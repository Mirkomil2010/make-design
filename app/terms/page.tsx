export default function TermsPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-black tracking-tight text-[color:var(--vibe-ink)]">
        Terms of Service
      </h1>
      <div className="mt-6 rounded-3xl border border-black/10 bg-white/90 p-7 text-sm leading-7 text-[color:var(--vibe-muted)] shadow-[0_20px_45px_rgba(10,18,34,0.08)]">
        <p>
          By using Vibe Coding you agree to publish content you have rights to
          share, and you are responsible for links and assets attached to your
          design system entries.
        </p>
        <p className="mt-4">
          Platform abuse, malicious uploads, or attempts to manipulate rankings
          may result in account restrictions.
        </p>
      </div>
    </section>
  );
}
