"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

const testimonials = [
  {
    quote:
      '"DonkeyGPT explained quantum physics to me like I was five, and for the first time in my life, I actually understood it. It\'s the tutor I wish I had in college."',
    name: "Sarah J.",
    role: "Career Switcher",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ8vu3W9xriZk7y8pjtY5FmR7flNFx3nNhTe7wWAe2g7m8mRZSJp02RN3hSYAvJfVmMHBykPpaI9CkLBIlmK3awPurPawx0JLj9MwGuWEFdLzgEkjI3YUFG_z05_rkKyEL3SZxob__OGk1yhXJvUhA80w4s0Y36K2v9MiiPcB4X_e57276t5eoRumZ12LCKp-eBRJvrj313sE1RQskjvTUTjvaLsc-4h7kWkZQsyUUT5wyhnTdSILob_iR5a9cmcSBcfaDReqWqkvi",
  },
  {
    quote:
      '"Finally, an AI that doesn\'t talk down to me. It\'s patient, thorough, and surprisingly witty. It makes learning feel like a conversation, not a lecture."',
    name: "Marcus T.",
    role: "University Student",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmDMjuNaNoQfQ0FK4NmnZsDwMmTfpgmpTdrQaqaeFywr4ojqYAsj6rSXaZOQDI_U5_4OGvGd6fAfF7kmRKa4L1z30KvJNpCnz2Mzxb1vOS3DqDQdYKLMjgTjEGvU-n7lwdPm9_zaUss-hvxjkEiOHqLF95aDOidesO8nhUOAmzHPtB8A4BTdhH-5xRKe5ScLg-RmJpQ9LIwfF791IPrhUuBuHsWY1ttvdcT-w8-DZ42Ofk9iP2XeN0A4hYXR8toE1Cvb_rDD-FQpVv",
  },
  {
    quote:
      '"I used DonkeyGPT to learn how to fix my own bike. The step-by-step breakdown was incredible. No jargon, just clear instructions."',
    name: "Elena R.",
    role: "Lifelong Learner",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9L1F3XALJ_Owg64MpHw1nRjWGoAO7Ew5TORt3AYlFjpO0WsN6N_-bWo_FYMUOx2FX4Q4YoFTDmMMafP2mxI7xwVkeFH-FNVseSx96AIPquWE-GFGCvb722bOxmoMockLs5iRhj_UdcLrmftu8Im_migvrrcF5LGRjjI5wNhK5V-4i-vY75QSqxsY7m5DDBTmGear0B_6hKrs12980kWiYG72A4hue21taomgs9QkLUxPvcr-9qDSjsJLtONCQaQ_jf0Vjvrg4qfC-",
  },
];

const features = [
  {
    icon: "account_tree",
    title: "Break It Down",
    desc: "Complex topics explained step-by-step. We take the world's hardest concepts and unravel them into simple threads.",
    iconBg: "bg-primary-fixed",
    iconText: "text-primary",
  },
  {
    icon: "chat_bubble",
    title: "No Dumb Questions",
    desc: "Ask anything, get patient answers. Our AI never loses its temper and never thinks you're moving too slowly.",
    iconBg: "bg-secondary-fixed",
    iconText: "text-secondary",
  },
  {
    icon: "school",
    title: "Built for Beginners",
    desc: "Designed for learners, not experts. We strip away the ego of expertise to leave only the pure joy of discovery.",
    iconBg: "bg-tertiary-fixed",
    iconText: "text-tertiary",
  },
];

const problems = [
  {
    icon: "block",
    title: "Traditional resources assume prior knowledge.",
    desc: 'Most tutorials skip the "obvious" parts, leaving you stuck on page one.',
  },
  {
    icon: "sentiment_dissatisfied",
    title: "Asking 'basic' questions feels embarrassing.",
    desc: "Forums can be harsh. We provide a safe space where no question is too small.",
  },
  {
    icon: "payments",
    title: "Tutors are expensive & unavailable.",
    desc: "High-quality help shouldn't cost $100/hr or only be available 9-to-5.",
  },
  {
    icon: "description",
    title: "Documentation is written for experts.",
    desc: "Technical jargon acts as a wall. We tear that wall down with plain English.",
  },
];

const steps = [
  {
    num: "1",
    title: "Ask Simply",
    desc: "Type your question in plain language—no special commands needed.",
  },
  {
    num: "2",
    title: "Go Deeper",
    desc: "If confused, just ask for simpler explanations or more examples.",
  },
  {
    num: "3",
    title: "Apply It",
    desc: "Request practice problems or see real-world applications of the topic.",
  },
  {
    num: "4",
    title: "Own the Knowledge",
    desc: "Build on concepts progressively at your own pace until it sticks.",
  },
];

const freePlanItems = [
  "Up to 20 messages per day",
  "Each conversation can go as deep as you need",
  "Patient, jargon-free explanations",
  "No credit card required",
];

const proPlanItems = [
  { text: "Unlimited conversations", bold: true },
  { text: "Priority response speed", bold: false },
  { text: "Early access to new features", bold: false },
  { text: "Support our mission to make learning accessible", bold: false },
];

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" } as const,
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export default function LandingPage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    ["features", "pricing", "about"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const navClass = (href: string) => {
    const active = activeSection === href.slice(1);
    return [
      "tracking-tight font-semibold transition-all pb-1 border-b-2",
      active
        ? "text-primary border-primary"
        : "text-on-surface/70 border-transparent hover:text-primary hover:border-primary",
    ].join(" ");
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm shadow-[#1a1b22]/5">
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
          <div className="flex items-center gap-2">
            <Image src="/brand-assets/main-logo.png" alt="DonkeyGPT logo" width={36} height={32} />
            <span className="text-2xl font-black text-primary tracking-tighter">
              DonkeyGPT
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <a key={href} className={navClass(href)} href={href}>
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/chat"
                className="hidden md:block px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-md hover:opacity-90 transition-all active:scale-95"
              >
                Go to App
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="hidden md:block px-5 py-2 text-on-surface/70 font-medium hover:bg-surface-container-lowest/50 transition-all duration-300 active:scale-95"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden md:block px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-md hover:opacity-90 transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}
            <button
              className="md:hidden p-2 text-on-surface/70 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </nav>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-outline-variant/10 px-8 py-6 flex flex-col gap-5">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                className={navClass(href)}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="border-t border-outline-variant/10 pt-5">
              {isLoggedIn ? (
                <Link
                  href="/chat"
                  className="block px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold text-center shadow-md hover:opacity-90 transition-all active:scale-95"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to App
                </Link>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="block text-on-surface/70 font-medium mb-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold text-center shadow-md hover:opacity-90 transition-all active:scale-95"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-36 pb-16 md:pt-40 md:pb-24 px-5 md:px-8 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs md:text-sm font-medium mb-6 md:mb-8">
                <span className="material-symbols-outlined text-sm">
                  auto_awesome
                </span>
                Introducing The Patient Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-on-surface tracking-tight leading-[1.1] mb-6 md:mb-8">
                Learn anything. <br />
                <span className="text-primary">No jargon. No judgment.</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-on-surface-variant leading-relaxed max-w-2xl mx-auto mb-10 md:mb-12">
                AI that explains like you&apos;re starting from zero—because
                everyone&apos;s a beginner at something.
              </p>
              <div className="flex flex-col items-center gap-4">
                <Link
                  href="/signup"
                  className="px-7 md:px-10 py-4 md:py-5 bg-primary text-on-primary text-base md:text-xl font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-3 group"
                >
                  Start Learning for Free
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
                <p className="text-on-surface-variant/60 text-sm font-medium">
                  No credit card required
                </p>
              </div>
            </motion.div>
          </div>
          {/* Donkey illustration — hidden on mobile to prevent horizontal overflow */}
          <div className="absolute -right-20 top-40 opacity-20 pointer-events-none hidden sm:block">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQ8v7Co0hLQbTs4Wor0gFEk-LpIL9yA6IdIdG917Y7Xa0L6vIstAwWyGG-bWcVUplyT1_YqR-aojBxhx1noQge_osCWY-ZQqd94E7sGgo3zn1SyNY2TJwvWlLiGlxZ34c0p-OPvgYO4zLZgS0ZdfiGo73chqpbVSNvz5Gukg8tgqoOAwx5xgh-entw3cHirRHgkyKR8EzlZtZu7k7Bvdp7u9VqEUdmHwkiTkA1sdrthZK1HIkgmDoruw9bCeRlLlMmLjtgPMvbrp0-"
              alt="Friendly donkey character illustration"
              width={500}
              height={500}
              className="object-contain rotate-12"
              priority
            />
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-16 md:py-24 px-5 md:px-8 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              className="order-1 lg:order-1"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU1gzBbCZgmlpfS2uusL4gJmMIxfn9Gxg9dCmmjB_M_ODEua_aGMEAy9qUpJuLdxB4kVoixlHNfC1GYCmHeG3oKHYdspIGwP6ea1aqEwJeEgTRUKwrNh7taVzhY3qBQZfKCetRTt49ihykiZCNFMXwhS3vJNVGuwTTgHnr1Cewjz3YPNgvqR3Lx-4Hkx8gYsyIv8F_8rFvZ4uiwUwTVyXYsUuW6eTb4t_EE74qw7tyHPaS_PyVTCkcfQVmcOh8e5nAhKKBCwtGayYp"
                  alt="Peaceful learning environment"
                  width={800}
                  height={500}
                  className="w-full h-64 md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              </div>
            </motion.div>
            <motion.div
              className="order-2 lg:order-2 flex flex-col gap-5 md:gap-6"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="text-primary font-bold uppercase tracking-widest text-sm">
                Our Mission
              </span>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-on-surface tracking-tight leading-tight">
                Built by educators who hate gatekeeping.
              </h2>
              <div className="space-y-4 text-base md:text-lg text-on-surface-variant leading-relaxed">
                <p>
                  DonkeyGPT is an AI-powered learning companion built for
                  absolute beginners. Created by educators frustrated with
                  gatekeeping in learning.
                </p>
                <p className="font-medium text-on-surface">
                  Mission: Make expert knowledge accessible without the
                  intimidation.
                </p>
                <p>
                  We believe everyone deserves patient, judgment-free
                  explanations. Whether you&apos;re learning to code,
                  understanding taxes, or exploring physics, we&apos;re here to
                  help you cross the finish line.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why DonkeyGPT? (Problems) */}
        <section className="py-16 md:py-24 px-5 md:px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-10 md:mb-16" {...fadeUp}>
              <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight mb-3 md:mb-4">
                Why DonkeyGPT?
              </h2>
              <p className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto">
                Traditional learning is broken for beginners. We fixed it.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              {problems.map((item, i) => (
                <motion.div
                  key={item.icon}
                  className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl flex gap-5 md:gap-6"
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-on-surface mb-2">
                      {item.title}
                    </h4>
                    <p className="text-on-surface-variant">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="mt-8 md:mt-12 bg-primary text-on-primary p-5 md:p-8 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6 shadow-xl text-center md:text-left"
              {...fadeUp}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <span className="material-symbols-outlined text-3xl md:text-4xl flex-shrink-0">
                  check_circle
                </span>
                <h3 className="text-base md:text-xl lg:text-2xl font-bold">
                  The Solution: AI that meets you exactly where you are, any
                  time, any topic.
                </h3>
              </div>
              <Link
                href="/signup"
                className="px-5 md:px-8 py-2.5 md:py-3 text-sm md:text-base bg-surface text-primary font-bold rounded-xl whitespace-nowrap hover:bg-primary-fixed transition-colors"
              >
                Try it now
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="py-16 md:py-24 bg-surface px-5 md:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-10 md:mb-16" {...fadeUp}>
              <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight mb-3 md:mb-4">
                Everything You Need to Learn
              </h2>
              <p className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto">
                Three core principles that make DonkeyGPT different from every other AI.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.icon}
                  className="bg-surface-container-lowest p-7 md:p-10 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-5 md:gap-6 border border-outline-variant/20"
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${f.iconBg} flex items-center justify-center ${f.iconText}`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {f.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-on-surface mb-2 md:mb-3 tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-on-surface-variant leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Master Anything */}
        <section className="py-16 md:py-24 px-5 md:px-8 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-10 md:mb-16" {...fadeUp}>
              <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight mb-3 md:mb-4">
                How to Master Anything
              </h2>
              <p className="text-on-surface-variant text-base md:text-lg">
                Simple steps to unlocking your potential.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="relative flex flex-col items-center text-center group"
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center text-2xl md:text-3xl font-black mb-4 md:mb-6 shadow-inner transition-transform group-hover:scale-110">
                    {step.num}
                  </div>
                  <h4 className="text-base md:text-xl font-bold mb-2 md:mb-3">{step.title}</h4>
                  <p className="text-on-surface-variant text-xs md:text-sm">{step.desc}</p>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-10 -right-4 w-8 border-t-2 border-dashed border-outline-variant" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 md:py-24 px-5 md:px-8 bg-surface">
          <motion.div
            className="max-w-7xl mx-auto text-center mb-10 md:mb-16"
            {...fadeUp}
          >
            <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight mb-3 md:mb-4">
              Trusted by students, career switchers, and curious minds
            </h2>
            <p className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto">
              Real stories from learners just like you.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="p-8 rounded-xl bg-surface-container-low/50 italic text-on-surface-variant font-medium leading-relaxed relative"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              >
                <span className="material-symbols-outlined absolute -top-4 -left-2 text-primary-container opacity-20 text-6xl">
                  format_quote
                </span>
                {t.quote}
                <div className="mt-6 flex items-center gap-3 not-italic">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-bold text-on-surface tracking-tight">
                    {t.name}, {t.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="py-16 md:py-24 px-5 md:px-8 bg-surface-container-low/30"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-10 md:mb-16" {...fadeUp}>
              <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight mb-3 md:mb-4">
                Choose Your Learning Journey
              </h2>
              <p className="text-on-surface-variant text-base md:text-lg">
                Simple pricing for minds that never stop growing.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <motion.div
                className="bg-surface-container-lowest p-7 md:p-10 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col border border-outline-variant/10"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-on-surface mb-2">
                    Free Forever
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-on-surface">
                      $0
                    </span>
                    <span className="text-on-surface-variant font-medium">
                      /month
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {freePlanItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">
                        check_circle
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 md:py-4 text-sm md:text-base bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-on-primary transition-all active:scale-95 text-center block"
                >
                  Start Learning for Free
                </Link>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                className="bg-surface-container-lowest p-7 md:p-10 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative border-2 border-primary/20"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              >
                <div className="absolute top-4 right-4 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                  Most Popular
                </div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-on-surface mb-2">
                    Pro
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-on-surface">
                      $8
                    </span>
                    <span className="text-on-surface-variant font-medium">
                      /month
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {proPlanItems.map((item) => (
                    <li
                      key={item.text}
                      className="flex items-start gap-3 text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">
                        check_circle
                      </span>
                      <span
                        className={
                          item.bold ? "font-medium text-on-surface" : ""
                        }
                      >
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={isLoggedIn ? "#" : "/signup"}
                  onClick={
                    isLoggedIn
                      ? async (e) => {
                          e.preventDefault();
                          const res = await fetch("/api/subscriptions/checkout", { method: "POST" });
                          const data = await res.json();
                          if (data.url) window.location.href = data.url;
                        }
                      : undefined
                  }
                  className="w-full py-3 md:py-4 text-sm md:text-base bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-center block"
                >
                  Upgrade to Pro
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-5 md:px-8">
          <motion.div
            className="max-w-5xl mx-auto rounded-3xl bg-primary-container p-8 md:p-20 text-center relative overflow-hidden"
            {...fadeUp}
          >
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-on-primary-container mb-4 md:mb-6 tracking-tight">
                Ready to stop feeling lost?
              </h2>
              <p className="text-base md:text-xl text-on-primary-container/80 mb-8 md:mb-10 max-w-xl mx-auto">
                Join 50,000+ learners who are mastering new skills without the
                headache.
              </p>
              <Link
                href="/signup"
                className="inline-block px-6 md:px-8 py-3 md:py-4 bg-surface text-primary font-bold text-sm md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Get Started for Free
              </Link>
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-surface/10 rounded-full blur-3xl" />
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-surface-container-lowest/10 rounded-full blur-3xl" />
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full py-10 md:py-12 px-5 md:px-8 border-t border-outline-variant/15">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 max-w-7xl mx-auto mb-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/brand-assets/main-logo.png" alt="DonkeyGPT logo" width={32} height={32} />
              <span className="font-bold text-2xl text-primary">
                DonkeyGPT
              </span>
            </div>
            <p className="text-on-surface/60 text-sm leading-relaxed mb-6">
              The patient intelligence that bridges the gap between expert
              knowledge and beginner curiosity.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors"
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <span className="font-bold text-on-surface text-sm uppercase tracking-wider">
                Product
              </span>
              <a
                href="#about"
                className="text-on-surface/60 hover:text-primary transition-colors duration-200 text-sm"
              >
                About
              </a>
              <a
                href="#pricing"
                className="text-on-surface/60 hover:text-primary transition-colors duration-200 text-sm"
              >
                Pricing
              </a>
              <a
                href="#features"
                className="text-on-surface/60 hover:text-primary transition-colors duration-200 text-sm"
              >
                Features
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold text-on-surface text-sm uppercase tracking-wider">
                Company
              </span>
              <a
                href="#"
                className="text-on-surface/60 hover:text-primary transition-colors duration-200 text-sm"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-on-surface/60 hover:text-primary transition-colors duration-200 text-sm"
              >
                Twitter
              </a>
              <Link
                href="/privacy"
                className="text-on-surface/60 hover:text-primary transition-colors duration-200 text-sm"
              >
                Privacy
              </Link>
            </div>
            <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
              <span className="font-bold text-on-surface text-sm uppercase tracking-wider">
                Stay Updated
              </span>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  className="px-4 py-2 rounded-lg bg-surface-container border-none focus:ring-2 focus:ring-primary/20 text-sm outline-none"
                />
                <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto pt-8 border-t border-outline-variant/10">
          <span className="text-on-surface/60 text-sm">
            © {new Date().getFullYear()} DonkeyGPT. The Patient Intelligence.
          </span>
          <div className="flex gap-8">
            <Link href="/terms" className="text-on-surface/60 text-sm">
              Terms
            </Link>
            <Link href="/privacy" className="text-on-surface/60 text-sm">
              Privacy Policy
            </Link>
            <a href="#" className="text-on-surface/60 text-sm">
              Cookie Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
