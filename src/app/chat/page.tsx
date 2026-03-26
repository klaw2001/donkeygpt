import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ChatLayout from "@/components/chat/ChatLayout";

export const metadata: Metadata = {
  title: "Chat",
};

export default async function ChatPage() {
  const session = await auth();
  if (!session) redirect("/signin");

  return <ChatLayout />;
}
