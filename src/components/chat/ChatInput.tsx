"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import { SIMPLICITY_LABELS } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Message } from "@/types";

export default function ChatInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [sliderOpen, setSliderOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    currentChatId,
    setCurrentChatId,
    addMessage,
    updateLastMessage,
    setIsStreaming,
    isStreaming,
    simplicityLevel,
    setSimplicityLevel,
    setLimitReached,
    pendingQuestion,
    setPendingQuestion,
  } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Handle suggestion card clicks from EmptyState
  useEffect(() => {
    if (pendingQuestion) {
      setPendingQuestion(null);
      handleSend(pendingQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion]);

  const handleSend = async (overrideMessage?: string) => {
    const message = (overrideMessage ?? input).trim();
    if (!message || isStreaming) return;

    setInput("");
    setIsStreaming(true);

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId: currentChatId ?? "",
      role: "user",
      content: message,
      createdAt: new Date(),
    };
    addMessage(userMessage);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          chatId: currentChatId,
          simplicityLevel,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/signin");
          return;
        }
        if (res.status === 429) {
          const data = await res.json();
          if (data.code === "LIMIT_REACHED") {
            setLimitReached(true, data.count);
            setIsStreaming(false);
            // Remove the optimistic user message since it wasn't sent
            return;
          }
        }
        throw new Error("Failed to send message");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let fullContent = "";
      let aiMessageAdded = false;
      let newChatId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chatId && !currentChatId) {
                newChatId = data.chatId;
                setCurrentChatId(data.chatId);
                // Defer router.replace until after streaming to avoid remounting
                // ChatLayoutWrapper mid-stream (which would overwrite messages from DB)
              }
              if (data.delta) {
                fullContent += data.delta;
                if (!aiMessageAdded) {
                  // Add AI message on first token so Donkey Pulse shows while waiting
                  addMessage({
                    id: `temp-ai-${Date.now()}`,
                    chatId: newChatId ?? currentChatId ?? "",
                    role: "assistant",
                    content: fullContent,
                    createdAt: new Date(),
                  });
                  aiMessageAdded = true;
                } else {
                  updateLastMessage(fullContent);
                }
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      // Navigate after streaming so ChatLayoutWrapper doesn't reset messages mid-stream
      if (newChatId) {
        router.replace(`/chat/${newChatId}`, { scroll: false });
      }
    } catch (err) {
      toast.error("Failed to get a response. Please try again.");
      updateLastMessage("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer data-tour="chat-input" className="px-6 py-4 bg-gradient-to-t from-[#fbf8ff] to-transparent">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Collapsible Simplicity Slider */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            sliderOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white rounded-2xl px-4 pt-3 pb-4 shadow-sm border border-[#d3c4b9]/10 mb-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Explain like I&apos;m...
              </span>
              <span className="text-xs font-bold text-[#634629] bg-[#ffdcbf] px-2 py-0.5 rounded">
                {SIMPLICITY_LABELS[simplicityLevel] ?? "Standard"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-stone-400">Child</span>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={simplicityLevel}
                onChange={(e) => setSimplicityLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-[#e8e7f1] rounded-lg appearance-none cursor-pointer accent-[#634629]"
              />
              <span className="text-[10px] font-bold text-stone-400">Expert</span>
            </div>
          </div>
        </div>

        {/* Toggle arrow — always visible above input */}
        <div className="flex justify-center">
          <button
            data-tour="simplicity-toggle"
            onClick={() => setSliderOpen((v) => !v)}
            className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-[#634629] transition-colors py-1"
            title={sliderOpen ? "Hide complexity slider" : "Show complexity slider"}
          >
            <span className="text-[10px]">Explain like I&apos;m...</span>
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
              {sliderOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
            </span>
          </button>
        </div>

        {/* Chat Bar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#634629]/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-end gap-3 bg-[#e3e1ec] p-3 pl-6 rounded-3xl border border-transparent group-focus-within:border-[#634629]/10 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything—I'll break it down..."
              rows={1}
              disabled={isStreaming}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-[#1a1b22] py-3 resize-none max-h-32 min-h-[44px] placeholder-stone-500 font-medium leading-relaxed outline-none disabled:opacity-60"
            />
            <div className="flex items-center gap-2 pb-1.5 pr-1.5">
              <span className="text-[10px] font-mono text-stone-400 bg-stone-200/50 px-2 py-1 rounded-md hidden sm:block">
                {input.length} chars
              </span>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isStreaming}
                className="w-10 h-10 bg-[#634629] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
              >
                <span className="material-symbols-outlined">
                  {isStreaming ? "more_horiz" : "arrow_upward"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-stone-400 font-medium">
          DonkeyGPT can make mistakes. Consider checking important information.
        </p>
      </div>
    </footer>
  );
}
