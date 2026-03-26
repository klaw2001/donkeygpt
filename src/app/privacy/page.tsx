import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "DonkeyGPT Privacy Policy - how we collect, use, and protect your data.",
};

const sections = [
  {
    id: "intro",
    title: "Introduction",
    content: `DonkeyGPT ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered learning platform. Please read this policy carefully. By using DonkeyGPT, you consent to the practices described in this policy.`,
  },
  {
    id: "information",
    title: "Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, use our chat interface, or contact us for support. This includes:

• Account information: name, email address, and password
• Profile preferences: learning topics, simplicity preferences, and language settings
• Usage data: conversations with DonkeyGPT, chat history, and interaction patterns
• Device information: IP address, browser type, operating system, and referring URLs
• Cookies and similar tracking technologies`,
  },
  {
    id: "use",
    title: "How We Use Your Information",
    content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Personalize your learning experience based on your preferences
• Process transactions and send related information
• Send technical notices, updates, security alerts, and support messages
• Respond to comments, questions, and requests
• Monitor and analyze trends, usage, and activities in connection with our services
• Train and improve our AI models (only if you have not opted out)
• Detect, investigate, and prevent fraudulent transactions and other illegal activities`,
  },
  {
    id: "sharing",
    title: "Information Sharing",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:

• With service providers who assist us in operating our platform (e.g., cloud hosting, payment processing)
• If required by law, regulation, or legal process
• To protect the rights, property, or safety of DonkeyGPT, our users, or others
• In connection with a merger, acquisition, or sale of all or a portion of our assets

We require all third parties to respect the security of your personal data and to treat it in accordance with applicable laws.`,
  },
  {
    id: "data-controls",
    title: "Your Data Controls",
    content: `You have control over your data. You can:

• Access and update your account information at any time through Settings
• Opt out of having your conversations used for AI training via the Privacy Toggle in Settings > Data Controls
• Export all your data in JSON format from Settings > Data Controls > Export History
• Delete your entire chat history from Settings > Data Controls > Clear Chats
• Request deletion of your account and all associated data through Settings > Account > Delete Account

We will respond to all legitimate requests within 30 days.`,
  },
  {
    id: "security",
    title: "Data Security",
    content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures include:

• Encryption of data in transit using TLS/SSL
• Encrypted storage of passwords using bcrypt
• Regular security audits and penetration testing
• Strict access controls for employees and contractors
• Automatic session expiration

However, no method of transmission over the Internet or electronic storage is 100% secure.`,
  },
  {
    id: "cookies",
    title: "Cookies",
    content: `We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.

We use the following types of cookies:
• Session cookies: to operate our service
• Preference cookies: to remember your preferences and settings
• Security cookies: for security purposes`,
  },
  {
    id: "retention",
    title: "Data Retention",
    content: `We retain your personal information for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.

When you delete your account, we will delete or anonymize your personal information within 30 days, unless we are required to retain certain information by law. Chat history is retained until you delete it or delete your account.`,
  },
  {
    id: "children",
    title: "Children's Privacy",
    content: `Our service is not directed to children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers.`,
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: `We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy. You are advised to review this Privacy Policy periodically for any changes.`,
  },
  {
    id: "contact",
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us at:

DonkeyGPT Privacy Team
Email: privacy@donkeygpt.io

We take all privacy inquiries seriously and will respond within 30 days.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#fbf8ff] text-[#1a1b22] min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold text-[#634629] tracking-tighter">
            DonkeyGPT
          </Link>
          <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
            <Link href="/#features" className="text-slate-500 hover:text-[#634629] transition-colors">Features</Link>
            <Link href="/#pricing" className="text-slate-500 hover:text-[#634629] transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="text-[#634629] text-sm font-medium hover:opacity-80 transition-opacity">Sign In</Link>
            <Link href="/signup" className="bg-[#634629] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16 flex gap-16">
        {/* TOC Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-bold text-[#4f453c] uppercase tracking-widest mb-4">
              Contents
            </p>
            <nav className="flex flex-col gap-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-sm text-[#81756b] hover:text-[#634629] transition-colors py-1 border-l-2 border-transparent hover:border-[#634629] pl-3"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-3xl">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tight text-[#1a1b22] mb-4">
              Privacy Policy
            </h1>
            <p className="text-[#4f453c] text-sm">
              Last updated: January 1, 2025
            </p>
          </div>

          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="text-2xl font-bold text-[#1a1b22] tracking-tight mb-4">
                  {section.title}
                </h2>
                <p className="text-[#4f453c] leading-[1.7] whitespace-pre-line">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-[#eeedf7] bg-[#fbf8ff]">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
          <div className="text-xs text-slate-500 mb-4 md:mb-0">
            © 2024 DonkeyGPT. All rights reserved.
          </div>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-slate-400 hover:text-[#634629] text-xs transition-all">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-[#634629] text-xs transition-all">Terms</Link>
            <Link href="/signin" className="text-slate-400 hover:text-[#634629] text-xs transition-all">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
