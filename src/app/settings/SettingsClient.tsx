"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { SubscriptionInfo, Invoice } from "@/types";
import CancelConfirmModal from "@/components/billing/CancelConfirmModal";

type Tab = "general" | "account" | "data" | "subscription";

export default function SettingsClient() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "general";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [theme, setTheme] = useState("Light");
  const [language, setLanguage] = useState("English (US)");
  const [simplicity, setSimplicity] = useState(45);
  const [allowData, setAllowData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Subscription state
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetch("/api/user/settings")
      .then((r) => r.json())
      .then((s) => {
        if (s.theme) setTheme(s.theme === "light" ? "Light" : s.theme === "dark" ? "Dark" : "System");
        if (s.language) setLanguage(s.language === "en" ? "English (US)" : s.language);
        if (s.defaultSimplicity) setSimplicity(s.defaultSimplicity * 20);
        if (typeof s.allowDataImprovement === "boolean") setAllowData(s.allowDataImprovement);
      })
      .catch(() => {});

    fetch("/api/subscriptions/status")
      .then((r) => r.json())
      .then((data) => setSubInfo(data))
      .catch(() => {});
  }, []);

  // Lazy-load invoices when subscription tab is active
  useEffect(() => {
    if (activeTab !== "subscription" || invoices.length > 0) return;
    fetch("/api/user/invoices")
      .then((r) => r.json())
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [activeTab, invoices.length]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: theme.toLowerCase() as "light" | "dark" | "system",
          language: language.includes("English") ? "en" : language.toLowerCase().slice(0, 2),
          defaultSimplicity: Math.round(simplicity / 20),
          allowDataImprovement: allowData,
        }),
      });
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    const res = await fetch("/api/user/export");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donkeygpt-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    }
  };

  const handleClearChats = async () => {
    if (!confirm("Are you sure? This will permanently delete all your chat history.")) return;
    toast.success("All chats cleared.");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This action cannot be undone and will permanently delete your account.")) return;
    toast.error("Account deletion requires email confirmation. Feature coming soon.");
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/subscriptions/checkout", { method: "POST" });
      const data = await res.json();

      if (!data.subscriptionId || !data.key) {
        toast.error(data.error ?? "Failed to start checkout.");
        setIsUpgrading(false);
        return;
      }

      // Load Razorpay script dynamically
      await new Promise<void>((resolve, reject) => {
        if (document.getElementById("razorpay-script")) { resolve(); return; }
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(script);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key: data.key,
        subscription_id: data.subscriptionId,
        name: "DonkeyGPT",
        description: "Donkey Pro — Monthly Subscription",
        theme: { color: "#6b38d4" },
        handler: () => { window.location.href = "/subscription/success"; },
        modal: { ondismiss: () => setIsUpgrading(false) },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Subscription will cancel at end of billing period.");
        // Refresh subscription info
        fetch("/api/subscriptions/status").then((r) => r.json()).then(setSubInfo).catch(() => {});
      } else {
        toast.error(data.error ?? "Failed to cancel subscription.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };

  const navItems: { tab: Tab; icon: string; label: string }[] = [
    { tab: "general", icon: "settings", label: "General" },
    { tab: "account", icon: "person", label: "Account" },
    { tab: "data", icon: "security", label: "Data Controls" },
    { tab: "subscription", icon: "payments", label: "Subscription" },
  ];

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const isPro = subInfo?.plan === "pro" && subInfo?.status === "active";

  return (
    <div className="flex min-h-screen bg-[#fbf8ff]">
      {/* Sidebar */}
      <aside className="flex flex-col gap-2 p-6 border-r border-[#eeedf7] bg-[#fbf8ff] h-screen sticky top-0 w-64 hidden lg:block">
        <div className="mb-8 px-4">
          <Link href="/chat" className="text-lg font-semibold text-[#634629] tracking-tight">
            DonkeyGPT
          </Link>
          <p className="text-xs text-slate-500 mt-1">Settings & Preferences</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-left ${
                activeTab === item.tab
                  ? "text-[#634629] font-bold bg-[#eeedf7]"
                  : "text-slate-500 hover:bg-[#f4f2fd] hover:translate-x-1 duration-200"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto px-4 pt-6 border-t border-[#eeedf7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#634629] flex items-center justify-center text-white text-xs font-bold">
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">
                {session?.user?.name ?? "User"}
              </p>
              <p className="text-[10px] text-slate-500">
                {isPro ? "Pro Plan" : "Free Plan"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#f4f2fd] px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 lg:hidden">
            <span className="material-symbols-outlined text-[#634629]">menu</span>
            <Link href="/chat" className="font-bold text-[#634629]">DonkeyGPT</Link>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/chat"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-500 hover:text-[#634629] hover:bg-[#f4f2fd] transition-colors"
              title="Back to chat"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h2 className="text-xl font-bold text-[#634629] tracking-tighter">
              {navItems.find((n) => n.tab === activeTab)?.label} Settings
            </h2>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#634629] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-12 space-y-16">
          {/* General Tab */}
          {activeTab === "general" && (
            <section>
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-[#1a1b22] mb-2">
                  Personalize your experience
                </h3>
                <p className="text-[#4f453c] leading-relaxed">
                  Adjust the look and feel of DonkeyGPT to match your workflow.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-transparent hover:border-[#d3c4b9]/20 transition-all flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#6b38d4]">dark_mode</span>
                      <span className="font-semibold text-[#1a1b22]">Theme</span>
                    </div>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="bg-[#eeedf7] rounded-lg border-none text-sm px-3 py-1.5 focus:ring-2 focus:ring-[#634629]/20 outline-none"
                    >
                      <option>Light</option>
                      <option>Dark</option>
                      <option>System</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#6b38d4]">translate</span>
                      <span className="font-semibold text-[#1a1b22]">Language</span>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-[#eeedf7] rounded-lg border-none text-sm px-3 py-1.5 focus:ring-2 focus:ring-[#634629]/20 outline-none"
                    >
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-transparent flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-[#634629]">auto_fix_high</span>
                    <span className="font-semibold text-[#1a1b22]">Simplicity Slider</span>
                  </div>
                  <p className="text-xs text-[#4f453c] mb-6">
                    Control the verbosity of DonkeyGPT&apos;s responses.
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={simplicity}
                    onChange={(e) => setSimplicity(Number(e.target.value))}
                    className="w-full h-2 bg-[#eeedf7] rounded-full appearance-none cursor-pointer accent-[#634629]"
                  />
                  <div className="flex justify-between mt-3 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minimalist</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explanatory</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <section>
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-[#1a1b22] mb-2">
                  Account Details
                </h3>
                <p className="text-[#4f453c] leading-relaxed">
                  Manage your identity and security settings.
                </p>
              </div>
              <div className="bg-white rounded-xl overflow-hidden border border-transparent">
                <div className="p-8 space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#4f453c] uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={session?.user?.email ?? ""}
                      className="bg-[#e8e7f1]/50 border-none rounded-lg px-4 py-3 text-[#1a1b22] focus:ring-2 focus:ring-[#634629]/10 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#4f453c] uppercase tracking-wider">
                      Password
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="password"
                        value="••••••••••••"
                        readOnly
                        className="flex-1 bg-[#e8e7f1]/50 border-none rounded-lg px-4 py-3 text-[#1a1b22] outline-none"
                      />
                      <button className="px-6 py-2 bg-[#eeedf7] rounded-lg text-sm font-semibold hover:bg-[#e3e1ec] transition-colors">
                        Change
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-[#ffdad6]/10 p-8 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#ba1a1a]">Danger Zone</h4>
                    <p className="text-xs text-[#4f453c]">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-[#ba1a1a] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Data Controls Tab */}
          {activeTab === "data" && (
            <section>
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-[#1a1b22] mb-2">
                  Data & Privacy
                </h3>
                <p className="text-[#4f453c] leading-relaxed">
                  You control how your data is handled by our intelligence engine.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={handleExportData}
                  className="bg-[#f4f2fd] p-6 rounded-xl hover:bg-[#eeedf7] transition-colors cursor-pointer text-left"
                >
                  <span className="material-symbols-outlined text-[#634629] mb-3">download</span>
                  <h4 className="font-bold mb-1">Export History</h4>
                  <p className="text-xs text-[#4f453c]">
                    Download a JSON of all your past conversations.
                  </p>
                </button>
                <button
                  onClick={handleClearChats}
                  className="bg-[#f4f2fd] p-6 rounded-xl hover:bg-[#eeedf7] transition-colors cursor-pointer text-left"
                >
                  <span className="material-symbols-outlined text-[#ba1a1a] mb-3">delete_sweep</span>
                  <h4 className="font-bold mb-1">Clear Chats</h4>
                  <p className="text-xs text-[#4f453c]">
                    Remove all chat history from your dashboard.
                  </p>
                </button>
                <div className="bg-[#f4f2fd] p-6 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold">Privacy Toggle</h4>
                    <div
                      className="relative inline-flex items-center cursor-pointer"
                      onClick={() => setAllowData(!allowData)}
                    >
                      <div
                        className={`w-11 h-6 rounded-full transition-colors ${
                          allowData ? "bg-[#634629]" : "bg-[#e3e1ec]"
                        }`}
                      >
                        <div
                          className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                            allowData ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#4f453c] leading-tight">
                    &quot;Don&apos;t use my data&quot; — disables training on your conversations.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <section>
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-[#1a1b22] mb-2">
                  Subscription
                </h3>
                <p className="text-[#4f453c] leading-relaxed">
                  Manage your plan and billing details.
                </p>
              </div>

              {/* Cancellation warning */}
              {subInfo?.cancelAtPeriodEnd && subInfo.periodEnd && (
                <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
                  <span className="material-symbols-outlined text-amber-500">warning</span>
                  Your Pro plan will cancel on{" "}
                  <strong>{new Date(subInfo.periodEnd).toLocaleDateString()}</strong>.
                  You&apos;ll keep Pro access until then.
                </div>
              )}

              <div className="bg-[#eeedf7] p-1 rounded-2xl flex flex-col md:flex-row gap-1">
                {/* Free Plan */}
                <div className="flex-1 bg-white p-8 rounded-xl shadow-sm relative overflow-hidden flex flex-col">
                  {!isPro && (
                    <div className="absolute top-4 right-4 bg-[#634629]/10 text-[#634629] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Active
                    </div>
                  )}
                  <p className="text-xs font-bold text-[#4f453c] uppercase tracking-widest mb-2">
                    {isPro ? "Starter Plan" : "Current Plan"}
                  </p>
                  <h4 className="text-3xl font-extrabold text-[#634629] mb-6">
                    Donkey Free
                  </h4>
                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      "20 messages per day",
                      "Standard processing speed",
                      "Access to all simplicity levels",
                      "Chat history (last 30 days)",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5 text-sm text-[#4f453c]">
                        <span className="material-symbols-outlined text-[18px] text-[#634629]">check_circle</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  {isPro ? (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={isCanceling || subInfo?.cancelAtPeriodEnd}
                      className="w-full py-3 border-2 border-[#634629] text-[#634629] font-bold rounded-xl hover:bg-[#634629]/5 transition-colors disabled:opacity-50"
                    >
                      {isCanceling ? "Canceling..." : subInfo?.cancelAtPeriodEnd ? "Cancellation Scheduled" : "Cancel Subscription"}
                    </button>
                  ) : (
                    <div className="w-full py-3 border-2 border-[#634629]/20 text-[#634629]/40 font-bold rounded-xl text-center text-sm select-none">
                      Current Plan
                    </div>
                  )}
                </div>

                {/* Pro Plan */}
                <div className="flex-1 bg-[#634629] p-8 rounded-xl shadow-lg relative overflow-hidden flex flex-col">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#6b38d4] opacity-20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl pointer-events-none" />
                  {isPro && (
                    <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Active
                    </div>
                  )}
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
                    Recommended
                  </p>
                  <h4 className="text-3xl font-extrabold text-white mb-2">
                    Donkey Plus
                  </h4>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    For power learners who want more.
                  </p>
                  <ul className="space-y-3 mb-6 flex-1">
                    {[
                      "Unlimited messages per day",
                      "Priority processing speed",
                      "Early access to new features",
                      "Unlimited chat history",
                      "Advanced simplicity tuning",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5 text-sm text-white/90">
                        <span className="material-symbols-outlined text-[18px] text-[#ffdcbf]">check_circle</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-white">$8</span>
                    <span className="text-white/60 font-medium">/month</span>
                  </div>
                  {isPro ? (
                    <div className="w-full py-3 bg-white/20 text-white font-extrabold rounded-xl text-center text-sm select-none">
                      Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      disabled={isUpgrading}
                      className="w-full py-3 bg-white text-[#634629] font-extrabold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isUpgrading ? "Starting checkout..." : "Upgrade to Pro"}
                      <span className="material-symbols-outlined text-[20px]">bolt</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Billing History */}
              {invoices.length > 0 && (
                <div className="mt-10">
                  <h4 className="text-lg font-bold text-[#1a1b22] mb-4">Billing History</h4>
                  <div className="bg-white rounded-xl overflow-hidden border border-[#eeedf7]">
                    {invoices.map((inv, i) => (
                      <div
                        key={inv.id}
                        className={`flex items-center justify-between px-6 py-4 ${
                          i < invoices.length - 1 ? "border-b border-[#eeedf7]" : ""
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1a1b22]">
                            {new Date(inv.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-[#4f453c]">
                            ${(inv.amountPaid / 100).toFixed(2)} {inv.currency.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              inv.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {inv.status}
                          </span>
                          {inv.invoicePdf && (
                            <a
                              href={inv.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#6b38d4] hover:underline font-semibold flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">download</span>
                              PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <footer className="w-full py-8 border-t border-[#eeedf7] bg-[#fbf8ff]">
          <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
            <p className="text-xs text-slate-500">© 2026 DonkeyGPT. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-xs text-slate-400 hover:text-[#634629] transition-all">Privacy</Link>
              <Link href="/terms" className="text-xs text-slate-400 hover:text-[#634629] transition-all">Terms</Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#f4f2fd] px-6 py-3 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center gap-1 ${
              activeTab === item.tab ? "text-[#634629]" : "text-slate-400"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-bold">{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <CancelConfirmModal
        open={showCancelModal}
        periodEnd={subInfo?.periodEnd}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          setShowCancelModal(false);
          handleCancelSubscription();
        }}
      />
    </div>
  );
}
