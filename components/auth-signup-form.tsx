"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  callbackUrl: string;
};

export function AuthSignUpForm({ callbackUrl }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; details?: string }
        | null;
      setError(
        payload?.error || payload?.details || "Ro'yxatdan o'tishda xatolik yuz berdi.",
      );
      setIsSubmitting(false);
      return;
    }

    const payload = (await response.json()) as {
      username?: string;
      emailSent?: boolean;
      emailWarning?: string;
    };

    if (payload.emailSent === false) {
      setNotice(
        payload.emailWarning ||
          "Akkaunt yaratildi, lekin email yuborilmadi. RESEND sozlamasini tekshiring.",
      );
    }

    const signInResult = await signIn("credentials", {
      username: payload.username ?? email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!signInResult || signInResult.error) {
      setError("Account yaratildi, lekin login bo'lmadi. Sign in qiling.");
      router.push("/auth/signin");
      return;
    }

    router.push(signInResult.url ?? callbackUrl);
    router.refresh();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_20px_45px_rgba(10,20,35,0.1)]"
    >
      <h1 className="font-display text-3xl font-black tracking-tight text-[color:var(--vibe-ink)]">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[color:var(--vibe-muted)]">
        Login/parol yarating. Ma&apos;lumot Convex `users` jadvaliga saqlanadi va email yuboriladi.
      </p>

      <label className="mt-6 block text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--vibe-muted)]">
        Name (optional)
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-[color:var(--vibe-brand)] transition focus:ring-2"
          placeholder="Your name"
        />
      </label>

      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--vibe-muted)]">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {notice}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full rounded-full bg-[color:var(--vibe-brand)] px-4 py-2 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[color:var(--vibe-brand-strong)] disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
