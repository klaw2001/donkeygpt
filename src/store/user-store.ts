"use client";

import { create } from "zustand";
import type { User, UserSettings, SubscriptionInfo } from "@/types";

interface UserStore {
  user: User | null;
  settings: UserSettings | null;
  subscription: SubscriptionInfo | null;

  setUser: (user: User | null) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setSettings: (settings: UserSettings | null) => void;
  setSubscription: (sub: SubscriptionInfo | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  settings: null,
  subscription: null,

  setUser: (user) => set({ user }),
  setSettings: (settings) => set({ settings }),
  updateSettings: (partial) =>
    set((state) => ({
      settings: state.settings ? { ...state.settings, ...partial } : null,
    })),
  setSubscription: (subscription) => set({ subscription }),
}));
