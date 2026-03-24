"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  callbackUrl: string;
};

export function AuthSignInForm({ callbackUrl }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Login yoki parol noto'g'ri.");
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_20px_45px_rgba(10,20,35,0.1)]"
    >
      <h1 className="font-display text-3xl font-black tracking-tight text-[color:var(--vibe-ink)]">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-[color:var(--vibe-muted)]">
        Convex users jadvalidagi email yoki username va parol bilan kiring.
      </p>

      <label className="mt-6 block text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--vibe-muted)]">
        Email or Username
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-[color:var(--vibe-brand)] transition focus:ring-2"
          placeholder="you@gmail.com"
          required
        />
      </label>

      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--vibe-muted)]">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-[color:var(--vibe-brand)] transition focus:ring-2"
          placeholder="********"
          required
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full rounded-full bg-[color:var(--vibe-brand)] px-4 py-2 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[color:var(--vibe-brand-strong)] disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
