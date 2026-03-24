import Link from "next/link";
import { AuthSignInForm } from "@/components/auth-signin-form";

type PageProps = {
  searchParams?: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const callbackUrl = resolvedParams.callbackUrl || "/submit";

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-14 sm:px-6 lg:px-8">
      <AuthSignInForm callbackUrl={callbackUrl} />
      <p className="mt-4 text-center text-sm text-[color:var(--vibe-muted)]">
        Akkaunt yo&apos;qmi?{" "}
        <Link
          href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-bold text-[color:var(--vibe-ink)] underline underline-offset-4"
        >
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </section>
  );
}
