import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const chat = await prisma.chat.findFirst({
    where: { id, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  return Response.json(chat);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const chat = await prisma.chat.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  await prisma.chat.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
