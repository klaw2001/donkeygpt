"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/validations";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        router.push("/chat");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/chat" });
    } catch {
      toast.error("Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className="h-screen overflow-hidden flex flex-col md:flex-row"
      style={{
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(125,93,63,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(107,56,212,0.03) 0px, transparent 50%)",
        backgroundColor: "#fdfbfc",
      }}
    >
      {/* Left Branding Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 p-12 flex-col justify-between relative overflow-hidden h-full">
        <div className="z-10">
          <div className="flex items-center gap-3 mb-10">
            <Image src="/brand-assets/main-logo.png" alt="DonkeyGPT" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-[#1a1b22]">
              DonkeyGPT
            </span>
          </div>
          <div className="max-w-lg mt-16">
            <h2 className="text-5xl font-extrabold text-[#1a1b22] leading-tight tracking-tight mb-5">
              The intelligence of AI,{" "}
              <br />
              <span className="text-[#7D5D3F]">refined for creators.</span>
            </h2>
            <p className="text-lg text-[#4f453c] leading-relaxed">
              Experience a workspace where powerful language models meet elegant
              editorial design. Join thousands of innovators building the future
              with DonkeyGPT.
            </p>
          </div>
        </div>
        <div className="z-10 flex items-center gap-8 opacity-60">
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-3xl text-[#1a1b22]">
              rocket_launch
            </span>
            <span className="material-symbols-outlined text-3xl text-[#1a1b22]">
              auto_awesome
            </span>
            <span className="material-symbols-outlined text-3xl text-[#1a1b22]">
              verified
            </span>
          </div>
          <div className="h-px w-12 bg-[#d3c4b9]" />
          <p className="text-xs font-bold tracking-widest uppercase text-[#1a1b22]">
            Trusted by 20k+ companies
          </p>
        </div>
        {/* Atmospheric decorations */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#7D5D3F] opacity-[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 border border-[#7D5D3F]/10 rounded-full" />
      </div>

      {/* Right Form Panel */}
      <div className="flex-grow flex flex-col items-center justify-center p-5 md:p-10 lg:p-14 h-full bg-white md:bg-transparent">
        <div className="w-full max-w-[420px] space-y-3 lg:space-y-5">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2.5 mb-2">
            <Image src="/brand-assets/main-logo.png" alt="DonkeyGPT" width={32} height={32} className="rounded-lg" />
            <h1 className="text-sm font-bold text-[#1a1b22]">DonkeyGPT</h1>
          </div>

          <div className="space-y-0.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a1b22]">
              Sign In
            </h1>
            <p className="text-[#4f453c] text-xs md:text-sm">
              Welcome back. Please enter your account details.
            </p>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="flex items-center justify-center gap-2 md:gap-3 py-2.5 md:py-3 px-4 bg-white border border-[#d3c4b9]/40 hover:bg-[#fdfbfc] transition-all rounded-xl text-xs md:text-sm font-medium text-[#1a1b22] hover:shadow-sm disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isGoogleLoading ? "..." : "Google"}
            </button>
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 md:gap-3 py-2.5 md:py-3 px-4 bg-white border border-[#d3c4b9]/40 rounded-xl text-xs md:text-sm font-medium text-[#1a1b22] opacity-50 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xl">
                terminal
              </span>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d3c4b9]/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="px-3 bg-white text-[#81756b] font-bold">
                Or use email
              </span>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
            <div className="space-y-1">
              <label
                className="block text-xs md:text-sm font-semibold text-[#1a1b22]/80"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="name@company.com"
                className="block w-full px-4 py-2.5 md:py-3 text-sm bg-white border border-[#d3c4b9]/40 rounded-xl text-[#1a1b22] placeholder:text-[#81756b]/60 focus:ring-2 focus:ring-[#7D5D3F]/15 focus:border-[#7D5D3F] transition-all outline-none"
              />
              {errors.email && (
                <p className="text-[#ba1a1a] text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <input
                {...register("password")}
                id="password"
                type="password"
                placeholder="••••••••"
                className="block w-full px-4 py-2.5 md:py-3 text-sm bg-white border border-[#d3c4b9]/40 rounded-xl text-[#1a1b22] placeholder:text-[#81756b]/60 focus:ring-2 focus:ring-[#7D5D3F]/15 focus:border-[#7D5D3F] transition-all outline-none"
              />
              <div className="flex items-center justify-between">
                <label
                  className="block text-sm font-semibold text-[#1a1b22]/80 hidden"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#7D5D3F] hover:text-[#5d4728] transition-colors ml-auto"
                >
                  Forgot your password?
                </Link>
              </div>
              {errors.password && (
                <p className="text-[#ba1a1a] text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register("rememberMe")}
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#7D5D3F] focus:ring-[#7D5D3F]/20 border-[#d3c4b9] rounded transition-all cursor-pointer"
              />
              <label
                className="ml-2.5 block text-sm text-[#4f453c] font-medium cursor-pointer"
                htmlFor="remember-me"
              >
                Keep me signed in for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-3.5 text-sm bg-[#7D5D3F] text-white font-bold rounded-xl shadow-lg shadow-[#7D5D3F]/10 hover:bg-[#6a4f35] hover:shadow-xl active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Continue to Workspace"}
            </button>
          </form>

          <p className="text-center text-sm text-[#4f453c]">
            New to DonkeyGPT?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#7D5D3F] hover:underline underline-offset-4 transition-all"
            >
              Create an account
            </Link>
          </p>

          <div className="pt-1 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#81756b] font-bold">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline">
                Privacy
              </Link>
              {" · "}© 2024 DonkeyGPT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
