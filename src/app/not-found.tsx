import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
};

export default function NotFoundPage() {
  return (
    <div className="bg-[#fbf8ff] text-[#1a1b22] min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold text-[#634629] tracking-tighter">
            DonkeyGPT
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="text-[#634629] text-sm font-medium hover:opacity-80">
              Sign In
            </Link>
            <Link href="/signup" className="bg-[#634629] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#e9ddff] opacity-20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[#feddb3] opacity-20 rounded-full blur-[120px]" />

        <div className="max-w-2xl mx-auto text-center z-10">
          {/* Donkey illustration */}
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 bg-[#ffdcbf] rounded-3xl flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#634629] text-6xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-8xl font-black text-[#634629] tracking-tighter block leading-none">
              404
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#1a1b22] tracking-tight mb-4">
            Looks like this page went exploring...
          </h1>
          <p className="text-[#4f453c] text-lg leading-relaxed max-w-md mx-auto mb-10">
            Even DonkeyGPT couldn&apos;t find this one. The page you&apos;re looking for
            doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-[#634629] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">home</span>
              Go Home
            </Link>
            <Link
              href="/chat"
              className="px-8 py-4 bg-[#f4f2fd] text-[#634629] font-bold rounded-xl hover:bg-[#eeedf7] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">chat</span>
              Open Chat
            </Link>
          </div>

          <p className="mt-12 text-sm text-[#81756b]">
            Need help?{" "}
            <Link href="/privacy" className="text-[#6b38d4] font-medium hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </main>

      <footer className="w-full py-8 border-t border-[#eeedf7] bg-[#fbf8ff]">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
          <div className="text-xs text-slate-500 mb-4 md:mb-0">
            © 2024 DonkeyGPT. All rights reserved.
          </div>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-slate-400 hover:text-[#634629] text-xs">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-[#634629] text-xs">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
