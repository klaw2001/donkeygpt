import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai, getSystemPrompt } from "@/lib/openai";
import { chatMessageSchema } from "@/lib/validations";
import { checkMessageLimit } from "@/lib/usage";

const MODEL = "gpt-4o-mini";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitCheck = await checkMessageLimit(session.user.id);
  if (!limitCheck.allowed) {
    return Response.json(
      {
        error: "Daily message limit reached",
        code: "LIMIT_REACHED",
        count: limitCheck.count,
        limit: limitCheck.limit,
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const result = chatMessageSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { message, chatId, simplicityLevel } = result.data;

  // Get or create chat
  let chat = chatId
    ? await prisma.chat.findFirst({
        where: { id: chatId, userId: session.user.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : null;

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        title: message.slice(0, 60) + (message.length > 60 ? "..." : ""),
      },
      include: { messages: true },
    });
  }

  // Save user message
  await prisma.message.create({
    data: { chatId: chat.id, role: "user", content: message },
  });

  const startTime = Date.now();
  const userId = session.user.id;
  const chatId_ = chat.id;

  // Build input:
  // - If chat has a lastResponseId → OpenAI already has full context; just send current message
  // - Otherwise (new chat or pre-migration chat) → send full history to establish context
  const input: string | Array<{ role: "user" | "assistant"; content: string }> =
    chat.lastResponseId
      ? message
      : [
          ...(chat.messages ?? []).map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: message },
        ];

  const stream = await openai.responses.create({
    model: MODEL,
    stream: true,
    instructions: getSystemPrompt(simplicityLevel),
    previous_response_id: chat.lastResponseId ?? undefined,
    input,
  });

  let fullResponse = "";
  let newResponseId: string | null = null;
  let usageData: { input_tokens: number; output_tokens: number; total_tokens: number } | null = null;

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send chatId first
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ chatId: chat!.id })}\n\n`)
      );

      for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
          const delta = event.delta;
          if (delta) {
            fullResponse += delta;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
            );
          }
        } else if (event.type === "response.completed") {
          newResponseId = event.response.id;
          usageData = event.response.usage ?? null;
        }
      }

      const durationMs = Date.now() - startTime;

      // Save assistant message
      const assistantMessage = await prisma.message.create({
        data: { chatId: chat!.id, role: "assistant", content: fullResponse },
      });

      // Update chat's lastResponseId for future context chaining
      if (newResponseId) {
        await prisma.chat.update({
          where: { id: chat!.id },
          data: { lastResponseId: newResponseId },
        });
      }

      // Fire-and-forget usage log — never surfaces errors to the client
      try {
        if (usageData) {
          await prisma.usageLog.create({
            data: {
              userId,
              chatId: chatId_,
              assistantMessageId: assistantMessage.id,
              model: MODEL,
              promptTokens: usageData.input_tokens,
              completionTokens: usageData.output_tokens,
              totalTokens: usageData.total_tokens,
              simplicityLevel,
              durationMs,
            },
          });
        }
      } catch (err) {
        console.error("[UsageLog] Failed to write usage record:", err);
      }

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
