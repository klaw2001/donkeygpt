"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch("password", "");
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getPasswordStrength();
  const strengthColors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Sign up failed. Please try again.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/onboarding");
      } else {
        router.push("/signin");
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
      await signIn("google", { callbackUrl: "/onboarding" });
    } catch {
      toast.error("Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-[#FDFCFB]">
      {/* Left Branding Panel */}
      <aside className="hidden lg:flex w-1/2 bg-[#7D5D3F] relative overflow-hidden flex-col justify-between p-14 h-full">
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-10">
            <Image src="/brand-assets/main-logo.png" alt="DonkeyGPT" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight">DonkeyGPT</span>
          </div>
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-5">
            Master any subject <br />
            with AI intelligence.
          </h2>
          <p className="text-white/80 text-lg max-w-md font-medium">
            Join thousands of students and professionals using DonkeyGPT to
            accelerate their learning journey.
          </p>
        </div>

        {/* Trust Signals */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 max-w-sm">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#7D5D3F] bg-white/20 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-white text-sm">
                    person
                  </span>
                </div>
              ))}
            </div>
            <div className="text-white">
              <p className="text-sm font-bold">Join 50k+ learners</p>
              <p className="text-xs text-white/60">
                Already scaling their knowledge
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <span className="material-symbols-outlined text-sm">
              verified_user
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              Secure Workspace • GDPR Compliant
            </span>
          </div>
        </div>

        {/* Decorative backgrounds */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 h-full">
        <div className="w-full max-w-[480px]">
          {/* Mobile header: logo inline with title */}
          <div className="flex items-center gap-3 mb-2 lg:hidden">
            <Image src="/brand-assets/main-logo.png" alt="DonkeyGPT" width={36} height={36} className="rounded-lg shrink-0" />
            <div>
              <h1 className="text-2xl font-extrabold text-[#1F2937] tracking-tight leading-tight">
                Create your account
              </h1>
              <p className="text-[#6B7280] text-xs font-medium">
                Get started with DonkeyGPT in seconds.
              </p>
            </div>
          </div>

          <div className="text-left mb-2 lg:mb-6 hidden lg:block">
            <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-[#6B7280] font-medium">
              Get started with DonkeyGPT in seconds.
            </p>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-2 lg:mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 py-2.5 rounded-xl transition-all border border-[#E5E7EB] shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-bold text-[#1F2937]">
                {isGoogleLoading ? "..." : "Google"}
              </span>
            </button>
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 bg-white py-2.5 rounded-xl border border-[#E5E7EB] shadow-sm opacity-50 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px] text-[#1F2937]">
                terminal
              </span>
              <span className="text-sm font-bold text-[#1F2937]">GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-2 lg:mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <span className="relative bg-[#FDFCFB] px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              or sign up with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 lg:space-y-5">
            {/* Identity Group */}
            <div className="space-y-2">
              <div className="space-y-1">
                <label
                  className="text-sm font-bold text-[#6B7280] ml-1"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  {...register("name")}
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 lg:py-3.5 text-[#1F2937] placeholder:text-gray-400 focus:ring-4 focus:ring-[#7D5D3F]/10 focus:border-[#7D5D3F] transition-all outline-none"
                />
                {errors.name && (
                  <p className="text-[#ba1a1a] text-xs">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-bold text-[#6B7280] ml-1"
                  htmlFor="signup-email"
                >
                  Email Address
                </label>
                <input
                  {...register("email")}
                  id="signup-email"
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 lg:py-3.5 text-[#1F2937] placeholder:text-gray-400 focus:ring-4 focus:ring-[#7D5D3F]/10 focus:border-[#7D5D3F] transition-all outline-none"
                />
                {errors.email && (
                  <p className="text-[#ba1a1a] text-xs">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Group — always side-by-side to save vertical space on mobile */}
            <div className="grid grid-cols-2 gap-3 lg:gap-5">
              <div className="space-y-1">
                <label
                  className="text-sm font-bold text-[#6B7280] ml-1"
                  htmlFor="signup-password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 lg:py-3.5 text-[#1F2937] placeholder:text-gray-400 focus:ring-4 focus:ring-[#7D5D3F]/10 focus:border-[#7D5D3F] transition-all outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7D5D3F] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1 mt-1 items-center">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength ? strengthColors[strength] : "bg-[#e3e1ec]"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-[#4f453c] ml-1 font-medium">
                      {strength > 0 ? strengthLabels[strength] : ""}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <p className="text-[#ba1a1a] text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-bold text-[#6B7280] ml-1"
                  htmlFor="confirm-password"
                >
                  Confirm
                </label>
                <input
                  {...register("confirmPassword")}
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 lg:py-3.5 text-[#1F2937] placeholder:text-gray-400 focus:ring-4 focus:ring-[#7D5D3F]/10 focus:border-[#7D5D3F] transition-all outline-none"
                />
                {errors.confirmPassword && (
                  <p className="text-[#ba1a1a] text-xs">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Referral Dropdown */}
            <div className="space-y-1">
              <label
                className="text-sm font-bold text-[#6B7280] ml-1"
                htmlFor="referral"
              >
                How did you hear about us?
              </label>
              <div className="relative group">
                <select
                  {...register("referral")}
                  id="referral"
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 lg:py-3.5 text-[#1F2937] focus:ring-4 focus:ring-[#7D5D3F]/10 focus:border-[#7D5D3F] appearance-none transition-all outline-none cursor-pointer pr-12"
                >
                  <option value="">Select an option</option>
                  <option value="social">Social Media</option>
                  <option value="friend">Word of Mouth</option>
                  <option value="search">Search Engine</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute right-0 top-0 h-full w-12 flex items-center justify-center pointer-events-none text-gray-400 group-hover:text-[#7D5D3F] transition-colors border-l border-[#E5E7EB]">
                  <span className="material-symbols-outlined text-[20px]">
                    unfold_more
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#7D5D3F] text-white py-2.5 lg:py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-[#7D5D3F]/20 hover:shadow-[#7D5D3F]/30 hover:-translate-y-px active:scale-[0.98] active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create your free account"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-2 text-center pt-2 border-t border-[#E5E7EB]/50">
            <p className="text-xs text-[#6B7280] font-medium">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-[#7D5D3F] font-bold hover:underline decoration-2 underline-offset-4 transition-all"
              >
                Sign in
              </Link>
              {" · "}
              <Link href="/terms" className="hover:text-[#7D5D3F] transition-colors text-gray-400">Terms</Link>
              {" & "}
              <Link href="/privacy" className="hover:text-[#7D5D3F] transition-colors text-gray-400">Privacy</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
