import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SITE_COOKIE = "site_auth";
export const ADMIN_COOKIE = "admin_auth";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// Constant-time password comparison (hash both sides so lengths always match).
export function passwordsMatch(supplied: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const a = createHash("sha256").update(supplied).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

// The cookie value is an HMAC derived from the password itself, so a forged
// cookie can't pass verification and changing the password invalidates all
// existing sessions.
function tokenFor(secret: string, scope: string): string {
  return createHmac("sha256", secret).update(`gated-gallery:${scope}`).digest("hex");
}

export function siteToken(): string {
  return tokenFor(process.env.SITE_PASSWORD ?? "", "site");
}

export function adminToken(): string {
  return tokenFor(process.env.ADMIN_PASSWORD ?? "", "admin");
}

function cookieMatches(name: string, expected: string): boolean {
  const value = cookies().get(name)?.value;
  if (!value || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function isSiteAuthed(): boolean {
  if (!process.env.SITE_PASSWORD) return false;
  return cookieMatches(SITE_COOKIE, siteToken());
}

export function isAdminAuthed(): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  return cookieMatches(ADMIN_COOKIE, adminToken());
}

export function siteCookieOptions() {
  return COOKIE_OPTS;
}
