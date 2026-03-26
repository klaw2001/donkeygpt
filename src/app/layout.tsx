import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/layout/Providers";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DonkeyGPT | The Patient Intelligence",
    template: "%s | DonkeyGPT",
  },
  description:
    "AI that explains complex topics in simple terms. No jargon. No judgment. Learn anything with DonkeyGPT.",
  keywords: ["AI tutor", "learning", "education", "explain simply", "DonkeyGPT"],
  icons: {
    icon: [
      { url: "/brand-assets/favicon_assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand-assets/favicon_assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/brand-assets/favicon_assets/apple-touch-icon.png",
    other: [
      { rel: "manifest", url: "/brand-assets/favicon_assets/site.webmanifest" },
    ],
  },
  openGraph: {
    title: "DonkeyGPT | The Patient Intelligence",
    description:
      "Learn anything without jargon or judgment. AI that explains like you're starting from zero.",
    type: "website",
    images: [{ url: "/brand-assets/white-bg-logo.png", width: 2048, height: 2048, alt: "DonkeyGPT" }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} light`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />

        {/* Google Translate widget */}
        {/* <div id="google_translate_element" />
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement(
                  {
                    pageLanguage: 'en',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                  },
                  'google_translate_element'
                );
              }
            `,
          }}
        />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        /> */}
      </body>
    </html>
  );
}
