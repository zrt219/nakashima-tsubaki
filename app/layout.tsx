import type { Metadata } from "next";
import "./globals.css";
import { SoundToggle } from "@/components/tn-command-center/sound-toggle";

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
    <html lang="en">
      <body>
        {children}
        <SoundToggle />
      </body>
    </html>
  );
}
