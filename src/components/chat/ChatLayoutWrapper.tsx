"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import ChatLayout from "./ChatLayout";
import type { Message } from "@/types";

interface Props {
  chatId: string;
  initialMessages: Array<{
    id: string;
    chatId: string;
    role: string;
    content: string;
    createdAt: Date;
  }>;
}

export default function ChatLayoutWrapper({ chatId, initialMessages }: Props) {
  const { setCurrentChatId, setMessages, isStreaming } = useChatStore();

  useEffect(() => {
    // Don't overwrite in-progress streaming messages — the store already has the
    // correct optimistic state and the AI response hasn't been saved to DB yet.
    if (isStreaming) return;
    setCurrentChatId(chatId);
    setMessages(
      initialMessages.map((m) => ({
        ...m,
        role: m.role as "user" | "assistant",
      })) as Message[]
    );
  }, [chatId, initialMessages, setCurrentChatId, setMessages, isStreaming]);

  return <ChatLayout chatId={chatId} />;
}
