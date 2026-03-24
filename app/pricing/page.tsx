import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$0",
    note: "For exploration and early drafts.",
    items: ["5 generations / day", "Community templates", "Public profile"],
  },
  {
    name: "Pro",
    price: "$29",
    note: "For production creators and teams.",
    items: ["Unlimited generations", "Website mode + advanced prompts", "Priority support"],
  },
  {
    name: "Studio",
    price: "$99",
    note: "For agencies and product organizations.",
    items: ["Team seats + permissions", "Private model tuning", "Dedicated onboarding"],
  },
];

export default function PricingPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-black tracking-tight text-[color:var(--vibe-ink)] sm:text-5xl">
          Pricing
        </h1>
        <p className="mt-3 text-sm text-[color:var(--vibe-muted)] sm:text-base">
          Pick the plan that matches your design system velocity.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_20px_45px_rgba(10,18,34,0.08)]"
          >
            <h2 className="font-display text-2xl font-black text-[color:var(--vibe-ink)]">
              {plan.name}
            </h2>
            <p className="mt-1 text-4xl font-black text-[color:var(--vibe-ink)]">
              {plan.price}
              <span className="ml-1 text-sm font-semibold text-[color:var(--vibe-muted)]">
                /month
              </span>
            </p>
            <p className="mt-2 text-sm text-[color:var(--vibe-muted)]">{plan.note}</p>
            <ul className="mt-5 space-y-2 text-sm text-[color:var(--vibe-muted)]">
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link
              href="/submit"
              className="mt-6 inline-flex rounded-full bg-[color:var(--vibe-brand)] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-black transition hover:bg-[color:var(--vibe-brand-strong)]"
            >
              Choose {plan.name}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
