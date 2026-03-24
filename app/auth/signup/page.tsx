import Link from "next/link";
import { AuthSignUpForm } from "@/components/auth-signup-form";

type PageProps = {
  searchParams?: Promise<{ callbackUrl?: string }>;
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const callbackUrl = resolvedParams.callbackUrl || "/submit";

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-14 sm:px-6 lg:px-8">
      <AuthSignUpForm callbackUrl={callbackUrl} />
      <p className="mt-4 text-center text-sm text-[color:var(--vibe-muted)]">
        Akkauntingiz bormi?{" "}
        <Link
          href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-bold text-[color:var(--vibe-ink)] underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
