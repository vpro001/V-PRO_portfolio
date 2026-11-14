import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const PREFIX = "scrypt";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${PREFIX}$${salt}$${hash}`;
}

export function isHashed(stored: unknown): boolean {
  return typeof stored === "string" && stored.startsWith(`${PREFIX}$`);
}

/**
 * Accepts both hashed passwords and the plain-text ones older accounts were
 * created with. `needsUpgrade` tells the caller to re-save a hash.
 */
export function verifyPassword(
  password: string,
  stored: unknown
): { ok: boolean; needsUpgrade: boolean } {
  if (typeof stored !== "string" || !stored) return { ok: false, needsUpgrade: false };

  if (isHashed(stored)) {
    const [, salt, hash] = stored.split("$");
    if (!salt || !hash) return { ok: false, needsUpgrade: false };
    const expected = Buffer.from(hash, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return { ok: timingSafeEqual(expected, actual), needsUpgrade: false };
  }

  const a = Buffer.from(password);
  const b = Buffer.from(stored);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return { ok, needsUpgrade: ok };
}
