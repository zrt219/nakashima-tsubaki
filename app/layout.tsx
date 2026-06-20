import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { LearningProvider } from "@/components/education/LearningContext";
import { AcademicOverlay } from "@/components/education/AcademicOverlay";
import { SoundToggle } from "@/components/tn-command-center/sound-toggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TN Precision AI Command Center",
  description:
    "Portfolio-grade industrial AI command center prototype for RAG, digital twins, advisory automation, and blockchain provenance.",
  themeColor: "#030508"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <LearningProvider>
            <main className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-50 antialiased selection:bg-cyan-500/30 selection:text-cyan-50">
              <div className="flex-1">{children}</div>
            </main>
            <AcademicOverlay />
          </LearningProvider>
        </ThemeProvider>
        <SoundToggle />
      </body>
    </html>
  );
}
