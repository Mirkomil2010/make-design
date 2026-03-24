import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SubmitForm } from "@/components/submit-form";
import { authOptions } from "@/lib/auth";

export default async function SubmitPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/submit");
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-black tracking-tight text-[color:var(--vibe-ink)] sm:text-5xl">
          Submit a Design System
        </h1>
        <p className="mt-3 text-sm text-[color:var(--vibe-muted)] sm:text-base">
          Publish instantly to trending. Your card will appear on home and
          explore pages.
        </p>
      </div>
      <SubmitForm />
    </section>
  );
}
