import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "DonkeyGPT Terms of Service",
};

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: `By accessing and using DonkeyGPT, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
  },
  {
    id: "use",
    title: "Use of Service",
    content: `DonkeyGPT provides an AI-powered learning platform. You agree to use the service only for lawful purposes and in a way that does not infringe the rights of others.

Prohibited uses include:
• Attempting to circumvent, disable, or interfere with security features
• Using the service to generate harmful, illegal, or misleading content
• Attempting to reverse engineer or extract the underlying AI models
• Using automated scripts to access the service without permission`,
  },
  {
    id: "account",
    title: "Account Responsibilities",
    content: `You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account. DonkeyGPT cannot be held liable for any loss or damage arising from your failure to comply with this obligation.`,
  },
  {
    id: "ip",
    title: "Intellectual Property",
    content: `The content, features, and functionality of DonkeyGPT are owned by DonkeyGPT and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our explicit written permission.

You retain ownership of any content you submit to DonkeyGPT. By submitting content, you grant us a limited license to use it for the purpose of providing and improving our service.`,
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    content: `DonkeyGPT is provided "as is" without warranties of any kind. The AI-generated content is for educational purposes only and should not be considered professional advice (medical, legal, financial, or otherwise). Always consult a qualified professional for important decisions.`,
  },
  {
    id: "limitation",
    title: "Limitation of Liability",
    content: `In no event shall DonkeyGPT be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.`,
  },
  {
    id: "changes",
    title: "Changes to Terms",
    content: `We reserve the right to modify these terms at any time. We will provide notice of significant changes. Your continued use of the service after such modifications constitutes your acceptance of the new terms.`,
  },
  {
    id: "contact",
    title: "Contact",
    content: `For questions about these Terms of Service, please contact us at: legal@donkeygpt.io`,
  },
];

export default function TermsPage() {
  return (
    <div className="bg-[#fbf8ff] text-[#1a1b22] min-h-screen">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold text-[#634629] tracking-tighter">DonkeyGPT</Link>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="text-[#634629] text-sm font-medium hover:opacity-80">Sign In</Link>
            <Link href="/signup" className="bg-[#634629] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16 flex gap-16">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-bold text-[#4f453c] uppercase tracking-widest mb-4">Contents</p>
            <nav className="flex flex-col gap-1">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-sm text-[#81756b] hover:text-[#634629] transition-colors py-1 border-l-2 border-transparent hover:border-[#634629] pl-3">
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 max-w-3xl">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tight text-[#1a1b22] mb-4">Terms of Service</h1>
            <p className="text-[#4f453c] text-sm">Last updated: January 1, 2025</p>
          </div>
          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="text-2xl font-bold text-[#1a1b22] tracking-tight mb-4">{section.title}</h2>
                <p className="text-[#4f453c] leading-[1.7] whitespace-pre-line">{section.content}</p>
              </section>
            ))}
          </div>
        </main>
      </div>

      <footer className="w-full py-12 border-t border-[#eeedf7] bg-[#fbf8ff]">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
          <div className="text-xs text-slate-500 mb-4 md:mb-0">© 2024 DonkeyGPT. All rights reserved.</div>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-slate-400 hover:text-[#634629] text-xs transition-all">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-[#634629] text-xs transition-all">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
