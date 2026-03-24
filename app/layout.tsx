import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Vibe Coding",
  description: "Trending design systems generated from prompts, screenshots, and websites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="min-h-screen bg-[color:var(--vibe-bg)] text-[color:var(--vibe-ink)]">
            <div className="page-atmosphere" aria-hidden />
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
