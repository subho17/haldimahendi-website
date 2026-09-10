import crypto from 'crypto';

// Admin API guard. The admin key comes from the ADMIN_KEY env var and must be
// sent in the `x-admin-key` header. A constant-time compare prevents timing
// attacks. Defaults to a dev value; override in production.
export function checkAdminKey(headerValue: string | null): boolean {
  const expected = (process.env.ADMIN_KEY || 'shaadi-admin-dev').trim();
  if (!expected || !headerValue) return false;

  const a = Buffer.from(String(headerValue));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
