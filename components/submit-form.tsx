"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AI_DRAFT_STORAGE_KEY, PREVIEW_VARIANTS, type AIDesignDraft } from "@/lib/ai-draft";
import type { PreviewVariant } from "@/lib/types";

const previewOptions: { value: PreviewVariant; label: string }[] = [
  { value: "neonGrid", label: "Neon Grid" },
  { value: "tokenBoard", label: "Token Board" },
  { value: "atlasPanel", label: "Atlas Panel" },
  { value: "monoWire", label: "Mono Wire" },
  { value: "candyStack", label: "Candy Stack" },
  { value: "brutalist", label: "Brutalist" },
];

type SubmitFormInitial = {
  title: string;
  tagline: string;
  description: string;
  externalUrl: string;
  cover: string;
  tagsInput: string;
  previewVariant: PreviewVariant;
  notice: string;
};

function getInitialState(): SubmitFormInitial {
  const defaults: SubmitFormInitial = {
    title: "",
    tagline: "",
    description: "",
    externalUrl: "",
    cover: "",
    tagsInput: "tokens, components, saas",
    previewVariant: "neonGrid",
    notice: "",
  };

  if (typeof window === "undefined") {
    return defaults;
  }

  const raw = window.sessionStorage.getItem(AI_DRAFT_STORAGE_KEY);
  if (!raw) {
    return defaults;
  }

  window.sessionStorage.removeItem(AI_DRAFT_STORAGE_KEY);
  try {
    const draft = JSON.parse(raw) as Partial<AIDesignDraft>;
    const tagsInput =
      Array.isArray(draft.tags) && draft.tags.length > 0
        ? draft.tags
            .map((tag) => String(tag).trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 8)
            .join(", ")
        : defaults.tagsInput;
    const previewVariant =
      draft.previewVariant &&
      PREVIEW_VARIANTS.includes(draft.previewVariant as PreviewVariant)
        ? (draft.previewVariant as PreviewVariant)
        : defaults.previewVariant;

    return {
      title: typeof draft.title === "string" ? draft.title : defaults.title,
      tagline:
        typeof draft.tagline === "string" ? draft.tagline : defaults.tagline,
      description:
        typeof draft.description === "string"
          ? draft.description
          : defaults.description,
      externalUrl:
        typeof draft.externalUrl === "string"
          ? draft.externalUrl
          : defaults.externalUrl,
      cover: typeof draft.cover === "string" ? draft.cover : defaults.cover,
      tagsInput,
      previewVariant,
      notice: "AI draft loaded. Review fields and publish.",
    };
  } catch {
    return defaults;
  }
}

export function SubmitForm() {
  const router = useRouter();
  const initial = useMemo(() => getInitialState(), []);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initial.notice);
  const [title, setTitle] = useState(initial.title);
  const [tagline, setTagline] = useState(initial.tagline);
  const [description, setDescription] = useState(initial.description);
  const [externalUrl, setExternalUrl] = useState(initial.externalUrl);
  const [cover, setCover] = useState(initial.cover);
  const [tagsInput, setTagsInput] = useState(initial.tagsInput);
  const [previewVariant, setPreviewVariant] =
    useState<PreviewVariant>(initial.previewVariant);

  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8),
    [tagsInput],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      setNotice("");
      const response = await fetch("/api/design-systems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          tagline,
          description,
          externalUrl,
          cover,
          tags,
          previewVariant,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Failed to submit");
        return;
      }

      const payload = await response.json();
      if (payload?.slug) {
        router.push(`/design-systems/${payload.slug}`);
        return;
      }
      router.push("/explore");
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_24px_50px_rgba(16,24,40,0.1)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[color:var(--vibe-ink)]">
          Title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-black/35"
            placeholder="Aurora Prime"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[color:var(--vibe-ink)]">
          Tagline
          <input
            required
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-black/35"
            placeholder="A fast visual language for SaaS dashboards"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[color:var(--vibe-ink)] md:col-span-2">
          Description
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[130px] rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-black/35"
            placeholder="Tell people what makes this design system unique."
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[color:var(--vibe-ink)]">
          External URL
          <input
            required
            value={externalUrl}
            onChange={(event) => setExternalUrl(event.target.value)}
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-black/35"
            placeholder="https://example.com/design-system"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[color:var(--vibe-ink)]">
          Cover URL (optional)
          <input
            value={cover}
            onChange={(event) => setCover(event.target.value)}
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-black/35"
            placeholder="https://images.unsplash.com/..."
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[color:var(--vibe-ink)]">
          Tags (comma separated)
          <input
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-black/35"
            placeholder="tokens, components, saas"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[color:var(--vibe-ink)]">
          Preview variant
          <select
            value={previewVariant}
            onChange={(event) =>
              setPreviewVariant(event.target.value as PreviewVariant)
            }
            className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-black/35"
          >
            {previewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {notice}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs text-[color:var(--vibe-muted)]">
          Publish is instant. Card appears in Trending as soon as submit succeeds.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[color:var(--vibe-brand)] px-5 py-2 text-xs font-extrabold uppercase tracking-wide text-black transition hover:bg-[color:var(--vibe-brand-strong)] disabled:opacity-60"
        >
          {isPending ? "Publishing..." : "Publish system"}
        </button>
      </div>
    </form>
  );
}
