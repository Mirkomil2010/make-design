import { createHash } from "crypto";

const usernamePattern = /^[a-z0-9_]{3,24}$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function sanitizeUsernameBase(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function hashSuffix(value: string, length = 6) {
  return createHash("sha1").update(value).digest("hex").slice(0, length);
}

function ensureLength(username: string, fallbackSeed: string) {
  if (username.length >= 3 && username.length <= 24) {
    return username;
  }

  if (username.length < 3) {
    return `user_${hashSuffix(fallbackSeed, 8)}`.slice(0, 24);
  }

  return username.slice(0, 24);
}

export function makeUsernameFromEmail(email: string) {
  const normalized = normalizeUsername(email);
  const local = normalized.split("@")[0] || "user";
  const base = sanitizeUsernameBase(local) || "user";
  const suffix = hashSuffix(normalized);
  const truncatedBase = base.slice(0, 24 - (suffix.length + 1));
  const candidate = `${truncatedBase}_${suffix}`;
  return ensureLength(candidate, normalized);
}

export function toLegacyUsernameIdentifier(value: string) {
  const normalized = normalizeUsername(value);
  if (normalized.includes("@")) {
    return makeUsernameFromEmail(normalized);
  }
  return ensureLength(sanitizeUsernameBase(normalized), normalized);
}

export function isValidUsername(value: string) {
  return usernamePattern.test(value);
}
