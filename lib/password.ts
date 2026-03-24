import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hashHex] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hashHex) {
    return false;
  }

  const derived = scryptSync(password, salt, KEY_LENGTH);
  const hash = Buffer.from(hashHex, "hex");
  if (hash.length !== derived.length) {
    return false;
  }
  return timingSafeEqual(hash, derived);
}
