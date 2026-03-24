export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-black tracking-tight text-[color:var(--vibe-ink)]">
        Privacy Policy
      </h1>
      <div className="mt-6 rounded-3xl border border-black/10 bg-white/90 p-7 text-sm leading-7 text-[color:var(--vibe-muted)] shadow-[0_20px_45px_rgba(10,18,34,0.08)]">
        <p>
          Vibe Coding stores your account identity, published design system
          metadata, engagement actions, and operational logs required to run the
          service.
        </p>
        <p className="mt-4">
          OAuth is handled by your provider. You can request content deletion by
          contacting support with your account email.
        </p>
      </div>
    </section>
  );
}
