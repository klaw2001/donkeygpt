"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    // In a real app, you'd call your password reset API here
    setEmail(data.email);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  return (
    <div className="bg-[#fbf8ff] text-[#1a1b22] min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold text-[#634629] tracking-tighter">
            DonkeyGPT
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="text-[#634629] text-sm font-medium hover:opacity-80 transition-opacity">
              Sign In
            </Link>
            <Link href="/signup" className="bg-[#634629] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-[#e9ddff] opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-[#feddb3] opacity-20 blur-[120px] rounded-full" />

        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-start relative z-10">
          {/* Form state */}
          <div
            className="bg-white rounded-xl p-8 md:p-12 border border-[#d3c4b9]/10"
            style={{ boxShadow: "0 16px 32px -8px rgba(26,27,34,0.05)" }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#634629] tracking-tight mb-3">
                Reset your password
              </h1>
              <p className="text-[#4f453c] leading-relaxed opacity-80">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="text-xs font-semibold uppercase tracking-widest text-[#4f453c] ml-1"
                  htmlFor="reset-email"
                >
                  Email Address
                </label>
                <input
                  {...register("email")}
                  id="reset-email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-[#e3e1ec] border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-[#634629]/10 transition-all text-[#1a1b22] placeholder:text-[#4f453c]/50 outline-none"
                />
                {errors.email && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#634629] text-white py-4 rounded-xl font-semibold tracking-tight shadow-lg shadow-[#634629]/20 hover:opacity-95 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
                {!isSubmitting && (
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                )}
              </button>
              <div className="pt-4 text-center">
                <Link
                  href="/signin"
                  className="text-sm font-medium text-[#6b38d4] hover:underline underline-offset-4 decoration-2 transition-all"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>

          {/* Success / Info state */}
          <div className="bg-[#f4f2fd] rounded-xl p-8 md:p-12 relative overflow-hidden flex flex-col items-center text-center justify-center min-h-[400px]">
            {submitted ? (
              <>
                <div className="mb-8 relative">
                  <div
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative z-10"
                    style={{ boxShadow: "0 16px 32px -8px rgba(26,27,34,0.05)" }}
                  >
                    <span
                      className="material-symbols-outlined text-[#6b38d4] text-4xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      mark_email_read
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-[#6b38d4]/10 blur-2xl rounded-full scale-150" />
                </div>
                <h2 className="text-2xl font-bold text-[#1a1b22] mb-3">
                  Check your email
                </h2>
                <p className="text-[#4f453c] leading-relaxed max-w-xs mx-auto mb-8">
                  We&apos;ve sent password reset instructions to{" "}
                  <strong>{email}</strong>. Check your spam folder if you
                  don&apos;t see it.
                </p>
                <div className="w-full space-y-4">
                  <button
                    type="button"
                    className="w-full bg-white text-[#634629] py-3 rounded-xl font-medium border border-[#d3c4b9]/20 hover:bg-white transition-colors"
                  >
                    Open Mail App
                  </button>
                  <p className="text-xs text-[#4f453c]">
                    Didn&apos;t receive the email?{" "}
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-[#6b38d4] font-semibold hover:underline"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <span className="material-symbols-outlined text-[#634629] text-3xl">
                    lock_reset
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#1a1b22] mb-3">
                  Secure password reset
                </h2>
                <p className="text-[#4f453c] leading-relaxed max-w-xs mx-auto">
                  We&apos;ll send a one-time link to your email so you can safely
                  create a new password.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full py-8 border-t border-[#eeedf7] bg-[#fbf8ff]">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
          <div className="text-xs text-slate-500 mb-4 md:mb-0">
            © 2024 DonkeyGPT. All rights reserved.
          </div>
          <div className="flex gap-8 text-xs text-slate-500">
            <Link href="/privacy" className="text-slate-400 hover:text-[#634629] hover:underline transition-all">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-[#634629] hover:underline transition-all">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
