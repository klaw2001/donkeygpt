"use client";

import { create } from "zustand";
import type { Chat, Message } from "@/types";

interface ChatStore {
  currentChatId: string | null;
  messages: Message[];
  chats: Chat[];
  isStreaming: boolean;
  simplicityLevel: number;
  sidebarOpen: boolean;
  limitReached: boolean;
  dailyMessageCount: number;
  dailyMessageLimit: number;
  pendingQuestion: string | null;

  setCurrentChatId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  removeChat: (id: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setSimplicityLevel: (level: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLimitReached: (reached: boolean, count?: number) => void;
  setPendingQuestion: (q: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  currentChatId: null,
  messages: [],
  chats: [],
  isStreaming: false,
  simplicityLevel: 3,
  sidebarOpen: true,
  limitReached: false,
  dailyMessageCount: 0,
  dailyMessageLimit: 20,
  pendingQuestion: null,

  setCurrentChatId: (id) => set({ currentChatId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
        };
      }
      return { messages };
    }),
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
  removeChat: (id) =>
    set((state) => ({ chats: state.chats.filter((c) => c.id !== id) })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setSimplicityLevel: (simplicityLevel) => set({ simplicityLevel }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setLimitReached: (reached, count) =>
    set((state) => ({
      limitReached: reached,
      dailyMessageCount: count ?? state.dailyMessageCount,
    })),
  setPendingQuestion: (pendingQuestion) => set({ pendingQuestion }),
  reset: () =>
    set({ currentChatId: null, messages: [], isStreaming: false }),
}));
