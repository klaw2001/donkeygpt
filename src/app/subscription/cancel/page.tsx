import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout Canceled — DonkeyGPT" };

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-[#fbf8ff] flex flex-col items-center justify-center px-6 text-center">
      <Image
        src="/brand-assets/main-logo.png"
        alt="DonkeyGPT"
        width={72}
        height={72}
        className="rounded-3xl mb-8"
      />
      <div className="w-16 h-16 rounded-full bg-[#e8e7f1] flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-3xl text-[#4f453c]">close</span>
      </div>
      <h1 className="text-3xl font-black text-[#1a1b22] tracking-tight mb-3">
        No worries — maybe later.
      </h1>
      <p className="text-[#4f453c] text-lg mb-10 max-w-md leading-relaxed">
        Your free plan is still active. Come back whenever you&apos;re ready to upgrade.
      </p>
      <Link
        href="/chat"
        className="px-8 py-4 bg-[#634629] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95"
      >
        Back to Chat
      </Link>
      <Link
        href="/settings?tab=subscription"
        className="mt-4 text-sm text-[#4f453c] hover:text-[#634629] transition-colors"
      >
        View plans
      </Link>
    </div>
  );
}
