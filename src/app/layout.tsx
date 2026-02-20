import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/core/providers/ThemeProvider";
import ToastProvider from "@/core/providers/ToastProvider";
import GlobalProtections from "@/components/GlobalProtections";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio OS | Mimansh Neupane",
  description: "Hacker-style developer identity system for Mimansh Neupane. A cinematic, dual-interface portfolio with CLI and GUI modes.",
  keywords: ["portfolio", "developer", "hacker", "terminal", "cyberpunk", "Mimansh Neupane"],
  authors: [{ name: "Mimansh Neupane" }],
  openGraph: {
    title: "Portfolio OS | Mimansh Neupane",
    description: "Enter a controlled digital system. A cinematic hacker-style developer portfolio.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistMono.variable} antialiased bg-black text-green-500 overflow-hidden h-screen flex flex-col`}
      >
        <ThemeProvider>
          <ToastProvider>
            <GlobalProtections>
              <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-20 scanlines"></div>
              <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>

              <main className="flex-1 overflow-y-auto p-4 md:p-8 font-mono z-10 relative">
                {children}
              </main>
            </GlobalProtections>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
