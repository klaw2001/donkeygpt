"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chat-store";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import type { Chat } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function ChatSidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentChatId, setCurrentChatId, setMessages, reset, removeChat } = useChatStore();

  const { data: chats = [], refetch } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await fetch("/api/chats");
      if (!res.ok) throw new Error("Failed to fetch chats");
      return res.json();
    },
    enabled: !!session,
  });

  const handleNewChat = () => {
    reset();
    router.push("/chat");
  };

  const handleSelectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    const res = await fetch(`/api/chats/${chatId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
    router.push(`/chat/${chatId}`);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
    removeChat(chatId);
    if (currentChatId === chatId) {
      reset();
      router.push("/chat");
    }
    refetch();
  };

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <aside className={cn(
      "flex flex-col h-screen sticky top-0 left-0 bg-stone-50 font-sans z-40 border-r border-stone-200/60",
      "fixed md:relative transition-all duration-300",
      // Mobile: slide in/out; Desktop: full width or collapsed
      open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      collapsed ? "md:w-16" : "w-72"
    )}>
      {/* Brand */}
      <div className={cn("px-3 py-6 flex flex-col", collapsed ? "items-center" : "px-6")}>
        <div className={cn("flex items-center mb-6", collapsed ? "justify-center" : "gap-3")}>
          {/* Mobile close button */}
          {!collapsed && (
            <button
              className="md:hidden ml-auto order-last text-stone-400 hover:text-stone-700 transition-colors"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
          <Image
            src="/brand-assets/main-logo.png"
            alt="DonkeyGPT"
            width={40}
            height={40}
            className="rounded-xl flex-shrink-0"
          />
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-stone-900">
                DonkeyGPT
              </h1>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-widest">
                The Patient Intelligence
              </p>
            </div>
          )}
          {/* Collapse toggle — desktop only, next to logo when expanded */}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors ml-auto"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
          )}
        </div>

        {/* New Chat button */}
        <button
          data-tour="new-chat"
          onClick={handleNewChat}
          title="New Chat"
          className={cn(
            "flex items-center justify-center gap-2 py-3 bg-[#634629] text-white rounded-xl font-semibold shadow-sm hover:opacity-90 transition-all active:scale-95",
            collapsed ? "w-10 h-10 p-0 rounded-xl" : "w-full px-4"
          )}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {!collapsed && "New Chat"}
        </button>

        {/* Collapse toggle — desktop only, below new chat when collapsed */}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors mt-2"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        )}
      </div>

      {/* Navigation / History */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 no-scrollbar">
        {!collapsed && (
          <div className="px-2 mb-3">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Recent Chats
            </span>
          </div>
        )}

        <div className="space-y-1">
          {chats.length === 0 ? (
            !collapsed && (
              <p className="px-3 py-2 text-xs text-stone-400">
                No chats yet. Start a new conversation!
              </p>
            )
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                title={collapsed ? chat.title : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg cursor-pointer transition-colors duration-200 group",
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                  currentChatId === chat.id
                    ? "text-stone-900 font-semibold bg-stone-200"
                    : "text-stone-500 hover:bg-stone-200"
                )}
              >
                <span className="material-symbols-outlined text-stone-400 group-hover:text-[#634629] transition-colors flex-shrink-0">
                  {currentChatId === chat.id ? "chat_bubble" : "history"}
                </span>
                {!collapsed && (
                  <>
                    <span className="truncate text-sm flex-1">{chat.title}</span>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {!collapsed && (
          <div className="pt-8 px-2 mb-3">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Tools
            </span>
          </div>
        )}

        <div className={cn("space-y-1", collapsed && "pt-4")}>
          <Link
            href="/settings"
            title="Settings"
            className={cn(
              "flex items-center gap-3 rounded-lg text-stone-500 hover:bg-stone-200 transition-colors duration-200",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
            )}
          >
            <span className="material-symbols-outlined">settings</span>
            {!collapsed && <span className="text-sm">Settings</span>}
          </Link>
          <Link
            href="/privacy"
            title="Help & Privacy"
            className={cn(
              "flex items-center gap-3 rounded-lg text-stone-500 hover:bg-stone-200 transition-colors duration-200",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
            )}
          >
            <span className="material-symbols-outlined">help_outline</span>
            {!collapsed && <span className="text-sm">Help & Privacy</span>}
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className={cn("p-3 bg-stone-100/50 mt-auto border-t border-stone-200/60", collapsed ? "flex flex-col items-center gap-2" : "p-4")}>
        <div className={cn("flex items-center gap-3 p-2 rounded-xl", collapsed && "flex-col gap-1 p-1")}>
          <div
            className="w-10 h-10 rounded-full bg-[#634629] flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            title={collapsed ? (session?.user?.name ?? "User") : undefined}
          >
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-900 truncate">
                {session?.user?.name ?? "User"}
              </p>
              <p className="text-xs text-stone-500 truncate">
                {session?.user?.email ?? ""}
              </p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-stone-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Sign out"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
