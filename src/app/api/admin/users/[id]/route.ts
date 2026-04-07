import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      disabled: true,
      createdAt: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      onboardingCompleted: true,
      simplicityLevel: true,
      accounts: { select: { provider: true } },
      signupEvent: true,
      loginEvents: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true, ip: true, city: true, country: true, provider: true },
      },
      chats: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { messages: true } },
          usageLogs: { select: { totalTokens: true } },
        },
      },
      usageLogs: {
        orderBy: { createdAt: "desc" },
        select: {
          totalTokens: true,
          promptTokens: true,
          completionTokens: true,
          durationMs: true,
          createdAt: true,
          model: true,
        },
      },
    },
  });

  if (!user) return Response.json({ error: "Not found" }, { status: 404 });

  const totalTokens = user.usageLogs.reduce((s: number, l: { totalTokens: number }) => s + l.totalTokens, 0);
  const totalMessages = user.chats.reduce((s: number, c: { _count: { messages: number } }) => s + c._count.messages, 0);

  const chats = user.chats.map((c: { id: string; title: string; createdAt: Date; updatedAt: Date; _count: { messages: number }; usageLogs: { totalTokens: number }[] }) => ({
    ...c,
    tokenCost: c.usageLogs.reduce((s: number, l: { totalTokens: number }) => s + l.totalTokens, 0),
    usageLogs: undefined,
  }));

  // Daily token usage for chart (last 30 days)
  const dailyUsage = await prisma.$queryRaw<{ day: Date; tokens: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS day, COALESCE(SUM("totalTokens"), 0)::bigint AS tokens
    FROM "UsageLog"
    WHERE "userId" = ${id} AND "createdAt" >= NOW() - INTERVAL '30 days'
    GROUP BY date_trunc('day', "createdAt")
    ORDER BY day ASC
  `;

  return Response.json({
    ...user,
    totalTokens,
    totalMessages,
    chats,
    usageLogs: undefined,
    dailyUsage: dailyUsage.map((r: { day: Date; tokens: bigint }) => ({ day: r.day, tokens: Number(r.tokens) })),
    lastLogin: user.loginEvents[0] ?? null,
    loginEvents: undefined,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const allowed = ["name", "email", "plan", "disabled"] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, plan: true, disabled: true },
  });

  return Response.json(updated);
}
