import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ChatLayoutWrapper from "@/components/chat/ChatLayoutWrapper";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const chat = await prisma.chat.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: chat?.title ?? "Chat" };
}

export default async function ChatIdPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/signin");

  const { id } = await params;

  const chat = await prisma.chat.findFirst({
    where: { id, userId: session.user?.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!chat) redirect("/chat");

  return <ChatLayoutWrapper chatId={id} initialMessages={chat.messages} />;
}
