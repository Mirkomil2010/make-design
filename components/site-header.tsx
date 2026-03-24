"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const primaryLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/pricing", label: "Pricing" },
  { href: "/mcp", label: "MCP" },
  { href: "/submit", label: "Submit" },
];

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-[color:var(--vibe-header)]/95">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--vibe-brand)] text-xs font-extrabold text-black">
            VC
          </span>
          <span className="font-display text-base font-bold tracking-tight text-white">
            Vibe Coding
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-white/85 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <span className="text-xs text-white/70">Loading...</span>
          ) : session?.user ? (
            <>
              <span className="hidden text-xs font-medium text-white/70 sm:inline">
                {session.user.name ?? "Signed in"}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/60"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => signIn(undefined, { callbackUrl: "/submit" })}
                className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/60"
              >
                Sign in
              </button>
              <Link
                href="/auth/signup?callbackUrl=%2Fsubmit"
                className="rounded-full bg-[color:var(--vibe-brand)] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[color:var(--vibe-brand-strong)]"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
