"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatTour from "./ChatTour";
import { useChatStore } from "@/store/chat-store";
import UpgradeModal from "@/components/billing/UpgradeModal";
import allQuestions from "@/data/questions.json";

interface Props {
  chatId?: string;
}

export default function ChatLayout({ chatId }: Props) {
  const { messages, isStreaming, currentChatId, limitReached, dailyMessageCount, dailyMessageLimit, setLimitReached } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetch("/api/subscriptions/status")
      .then((r) => r.json())
      .then((data) => {
        setIsPro(data.plan === "pro" && data.status === "active");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const headingText = currentChatId ? "DonkeyGPT" : "New Conversation";

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbf8ff]">
      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <main className="flex-1 flex flex-col relative bg-[#fbf8ff]">
        {/* Header */}
        <header className="flex justify-between items-center px-4 py-2.5 md:px-6 md:py-4 w-full sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1 text-stone-500 hover:text-stone-900 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Heading — dropdown trigger for free users */}
            {!isPro ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-1 text-base md:text-lg font-bold text-stone-900 tracking-tight hover:text-[#634629] transition-colors"
                >
                  {headingText}
                  <span className="material-symbols-outlined text-base text-stone-400">
                    {dropdownOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-[#e3e1ec] py-1 min-w-[220px] z-50">
                    <Link
                      href="/settings?tab=subscription"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f4f2fd] transition-colors group"
                    >
                      <span className="material-symbols-outlined text-sm text-[#6b38d4]">workspace_premium</span>
                      <div>
                        <p className="text-sm font-semibold text-[#6b38d4]">Upgrade to Pro</p>
                        <p className="text-[10px] text-stone-400">Unlock unlimited messages</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <h2 className="text-base md:text-lg font-bold text-stone-900 tracking-tight">{headingText}</h2>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 md:px-6 md:py-6 no-scrollbar">
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-8">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isStreaming={
                    isStreaming && idx === messages.length - 1 && msg.role === "assistant"
                  }
                />
              ))
            )}

            {/* Donkey Pulse (loading indicator before first assistant token) */}
            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-center gap-3 opacity-40 animate-pulse">
                <div className="w-7 h-7 md:w-9 md:h-9 bg-[#e8e7f1] rounded-xl flex items-center justify-center text-stone-400">
                  <span className="material-symbols-outlined text-sm">more_horiz</span>
                </div>
                <div className="h-3 bg-[#e8e7f1] w-1/3 rounded-full" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput />
      </main>

      <UpgradeModal
        open={limitReached}
        onClose={() => setLimitReached(false)}
        messagesUsed={dailyMessageCount}
        messagesLimit={dailyMessageLimit}
      />

      <ChatTour />
    </div>
  );
}

function EmptyState() {
  const { setPendingQuestion } = useChatStore();
  const [displayed, setDisplayed] = useState<{ icon: string; text: string }[]>([]);

  useEffect(() => {
    const shuffled = [...(allQuestions as { icon: string; text: string }[])].sort(
      () => Math.random() - 0.5
    );
    setDisplayed(shuffled.slice(0, 4));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4 md:gap-8">
      <Image
        src="/brand-assets/main-logo.png"
        alt="DonkeyGPT"
        width={56}
        height={56}
        className="rounded-2xl md:rounded-3xl md:w-20 md:h-20"
      />
      <div>
        <h3 className="text-base md:text-xl font-bold text-[#1a1b22] tracking-tight mb-1 md:mb-2">
          How can I help you learn today?
        </h3>
        <p className="text-[#4f453c] text-xs md:text-sm">
          Ask me anything—I&apos;ll break it down without judgment.
        </p>
      </div>
      <div data-tour="suggestions" className="grid grid-cols-2 gap-2 md:gap-3 w-full max-w-2xl">
        {displayed.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[52px] md:h-[60px] bg-[#f4f2fd] rounded-2xl animate-pulse"
              />
            ))
          : displayed.map((ex) => (
              <button
                key={ex.text}
                onClick={() => setPendingQuestion(ex.text)}
                className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-[#f4f2fd] rounded-2xl text-left hover:bg-[#eeedf7] active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-white flex items-center justify-center text-[#634629] flex-shrink-0">
                  <span className="material-symbols-outlined text-xs md:text-sm">{ex.icon}</span>
                </div>
                <span className="text-xs md:text-sm text-[#4f453c] font-medium line-clamp-2">{ex.text}</span>
              </button>
            ))}
      </div>
    </div>
  );
}
