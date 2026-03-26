"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  messagesUsed: number;
  messagesLimit: number;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

export default function UpgradeModal({
  open,
  onClose,
  messagesUsed,
  messagesLimit,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/checkout", { method: "POST" });
      const data = await res.json();

      if (!data.subscriptionId || !data.key) {
        toast.error(data.error ?? "Failed to start checkout. Please try again.");
        setLoading(false);
        return;
      }

      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: data.key,
        subscription_id: data.subscriptionId,
        name: "DonkeyGPT",
        description: "Donkey Pro — Monthly Subscription",
        theme: { color: "#6b38d4" },
        handler: () => {
          window.location.href = "/subscription/success";
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });

      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#6b38d4]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-[#6b38d4]">
            workspace_premium
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#1a1b22] tracking-tight mb-2">
            You&apos;ve hit your daily limit
          </h2>
          <p className="text-[#4f453c] text-sm leading-relaxed">
            You&apos;ve used {messagesUsed} of {messagesLimit} daily messages.
            Upgrade to Donkey Pro for unlimited learning.
          </p>
        </div>
        <ul className="w-full text-left space-y-2 text-sm text-[#4f453c]">
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#6b38d4]">check_circle</span>
            Unlimited messages per day
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#6b38d4]">check_circle</span>
            Priority response speed
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#6b38d4]">check_circle</span>
            Early access to new features
          </li>
        </ul>
        <div className="w-full space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3.5 bg-[#6b38d4] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Opening checkout..." : "Upgrade to Pro"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-[#4f453c] text-sm font-medium hover:bg-[#f4f2fd] rounded-xl transition-colors cursor-pointer"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
