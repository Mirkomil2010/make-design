import Link from "next/link";

const footerLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/pricing", label: "Pricing" },
  { href: "/mcp", label: "MCP" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white/50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-display text-xl font-bold text-[color:var(--vibe-ink)]">
              Vibe Coding
            </p>
            <p className="text-sm text-[color:var(--vibe-muted)]">
              Build design systems from prompts, screenshots, and websites.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[color:var(--vibe-muted)] transition hover:text-[color:var(--vibe-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-xs text-[color:var(--vibe-muted)]">
          Copyright {new Date().getFullYear()} Vibe Coding. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
