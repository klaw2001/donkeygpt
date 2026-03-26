"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { Metadata } from "next";

const topics = [
  { icon: "terminal", label: "Programming" },
  { icon: "calculate", label: "Math" },
  { icon: "science", label: "Science" },
  { icon: "history_edu", label: "Literature" },
  { icon: "palette", label: "Design" },
  { icon: "payments", label: "Finance" },
  { icon: "fitness_center", label: "Health" },
  { icon: "translate", label: "Languages" },
  { icon: "architecture", label: "History" },
  { icon: "psychology", label: "Philosophy" },
];

const defaultPrompts = [
  { icon: "lightbulb", text: "Explain quantum entanglement like I'm five." },
  { icon: "code", text: "Refactor this Python script for better efficiency." },
  { icon: "edit_note", text: "Write a formal proposal for a remote work policy." },
];

const topicPromptsMap: Record<string, { icon: string; text: string }> = {
  "Programming": { icon: "code", text: "Explain how recursion works with a simple example." },
  "Math": { icon: "calculate", text: "Break down what a derivative means for a total beginner." },
  "Science": { icon: "science", text: "Why do objects fall at the same speed regardless of weight?" },
  "Literature": { icon: "history_edu", text: "What makes a narrative compelling? Give me a simple framework." },
  "Design": { icon: "palette", text: "Explain color theory like I've never studied art." },
  "Finance": { icon: "payments", text: "What's compound interest and why does it matter?" },
  "Health": { icon: "fitness_center", text: "Explain how the immune system fights a virus, simply." },
  "Languages": { icon: "translate", text: "What's the fastest way to start learning a new language?" },
  "History": { icon: "architecture", text: "Why did the Roman Empire fall? Give me the simple version." },
  "Philosophy": { icon: "psychology", text: "What is the trolley problem and why do philosophers care about it?" },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [simplicityLevel, setSimplicityLevel] = useState(3);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 4;

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simplicityLevel,
          preferredTopics: selectedTopics,
        }),
      });
      toast.success("Your preferences have been saved!");
      router.push("/chat");
    } catch {
      toast.error("Failed to save preferences. You can update them in settings.");
      router.push("/chat");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#fbf8ff] text-[#1a1b22] min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#6b38d4]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#634629]/5 blur-[120px]" />
      </div>
      {/* Floating shapes */}
      <div className="fixed top-20 right-20 w-32 h-32 bg-[#8455ef]/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 left-20 w-48 h-48 bg-[#7d5d3f]/20 rounded-full blur-3xl" />

      <main className="relative z-10 w-full max-w-2xl mx-4">
        <div className="bg-white shadow-2xl shadow-[#1a1b22]/5 rounded-[2rem] overflow-hidden border border-[#d3c4b9]/10">
          {/* Progress Bar */}
          <div className="flex h-1.5 w-full bg-[#eeedf7] gap-1 p-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-full rounded-full transition-all duration-500 ease-out flex-1 ${
                  s <= step ? "bg-[#634629]" : "bg-[#e3e1ec]"
                }`}
              />
            ))}
          </div>

          <div className="p-8 md:p-12">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-[#ffdcbf] rounded-3xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
                  <span
                    className="material-symbols-outlined text-[#634629] text-5xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    smart_toy
                  </span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-extrabold tracking-tight text-[#634629]">
                    Welcome to DonkeyGPT! 🎓
                  </h1>
                  <p className="text-[#4f453c] text-lg max-w-md mx-auto leading-relaxed">
                    {session?.user?.name ? `Hey ${session.user.name}! ` : ""}
                    Your patient, steady, and remarkably intelligent companion
                    for deep work and creative exploration.
                  </p>
                </div>
                <div className="w-full pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-[#f4f2fd] rounded-2xl text-left border border-transparent hover:border-[#634629]/10 transition-colors">
                    <span className="material-symbols-outlined text-[#6b38d4] mb-3">
                      auto_awesome
                    </span>
                    <h3 className="font-bold text-[#634629]">
                      Patient Intelligence
                    </h3>
                    <p className="text-sm text-[#4f453c]">
                      We think through problems deeply before answering.
                    </p>
                  </div>
                  <div className="p-6 bg-[#f4f2fd] rounded-2xl text-left border border-transparent hover:border-[#634629]/10 transition-colors">
                    <span className="material-symbols-outlined text-[#5d4728] mb-3">
                      psychology
                    </span>
                    <h3 className="font-bold text-[#634629]">Curated Focus</h3>
                    <p className="text-sm text-[#4f453c]">
                      Minimalist interface designed for zero distractions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="bg-[#634629] text-white px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-[#634629]/20"
                >
                  Get Started
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            )}

            {/* Step 2: Simplicity Preference */}
            {step === 2 && (
              <div className="space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-[#634629]">
                    How do you like to learn?
                  </h2>
                  <p className="text-[#4f453c]">
                    Adjust your preferred complexity level for AI responses.
                  </p>
                </div>
                <div className="bg-[#f4f2fd] p-10 rounded-3xl relative">
                  <div className="flex justify-between mb-8 px-[7px]">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#e3e1ec] rounded-full flex items-center justify-center mb-2 mx-auto">
                        <span className="material-symbols-outlined text-[#634629]">
                          child_care
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#5d4125] tracking-wider">
                        VERY SIMPLE
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#e3e1ec] rounded-full flex items-center justify-center mb-2 mx-auto">
                        <span className="material-symbols-outlined text-[#634629]">
                          terminal
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#5d4125] tracking-wider">
                        TECHNICAL
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={simplicityLevel}
                    onChange={(e) => setSimplicityLevel(Number(e.target.value))}
                    className="w-full h-2 bg-[#e3e1ec] rounded-lg appearance-none cursor-pointer accent-[#634629]"
                  />
                  <div className="flex justify-between mt-4 px-[7px] text-[#4f453c] text-xs font-medium">
                    <span>ELI5</span>
                    <span>Standard</span>
                    <span>Advanced</span>
                    <span>Expert</span>
                    <span>Peer Review</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="text-[#634629] font-bold px-6 py-2 hover:bg-[#eeedf7] rounded-full transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-[#634629] text-white px-8 py-4 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#634629]/20"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Topics */}
            {step === 3 && (
              <div className="space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-[#634629]">
                    Tailor your experience
                  </h2>
                  <p className="text-[#4f453c]">
                    Select topics you&apos;re interested in for personalized prompts.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {topics.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => toggleTopic(t.label)}
                      className={`px-6 py-3 rounded-full border font-medium transition-all flex items-center gap-2 ${
                        selectedTopics.includes(t.label)
                          ? "bg-[#634629] text-white border-[#634629]"
                          : "bg-white text-[#1a1b22] border-[#d3c4b9] hover:border-[#634629]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {t.icon}
                      </span>
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="text-[#634629] font-bold px-6 py-2 hover:bg-[#eeedf7] rounded-full transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="bg-[#634629] text-white px-8 py-4 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#634629]/20"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Example Prompts */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-[#634629]">
                    Try asking...
                  </h2>
                  <p className="text-[#4f453c]">
                    Here are a few ways to start your journey with DonkeyGPT.
                  </p>
                </div>
                <div className="space-y-4">
                  {(selectedTopics.length > 0
                    ? selectedTopics.slice(0, 3).map((t) => topicPromptsMap[t]).filter(Boolean)
                    : defaultPrompts
                  ).map((p) => (
                    <div
                      key={p.text}
                      className="group cursor-pointer p-6 bg-[#f4f2fd] rounded-2xl hover:bg-[#eeedf7] transition-all border border-transparent hover:border-[#634629]/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#634629] group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">
                            {p.icon}
                          </span>
                        </div>
                        <span className="font-medium text-[#4f453c]">
                          {p.text}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[#d3c4b9] opacity-0 group-hover:opacity-100 transition-opacity">
                        chevron_right
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setStep(3)}
                    className="text-[#634629] font-bold px-6 py-2 hover:bg-[#eeedf7] rounded-full transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={isSaving}
                    className="bg-[#6b38d4] text-white px-10 py-4 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#6b38d4]/20 disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Finish Setup"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-8 flex justify-center items-center gap-6 text-xs text-[#4f453c]/60 font-medium tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">lock</span>
            Secure Workspace
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">cloud_done</span>
            Auto-Saved
          </div>
        </footer>
      </main>
    </div>
  );
}
