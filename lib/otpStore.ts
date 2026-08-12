// OTP storage backed by Postgres (Supabase), with in-memory fallback
// when DATABASE_URL is not configured (local development without a DB).
import { pool, hasPool, ensureOtpTable } from '@/lib/db';

type OtpRecord = {
  code: string;
  expiresAt: number;
};

// Fallback in-memory store for development without DATABASE_URL
const globalForOtp = global as unknown as {
  otpStore: Map<string, OtpRecord>;
};

export const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
}

export async function saveOtp(mobileNumber: string, code: string, ttlSeconds = 300): Promise<void> {
  const cleanMobile = mobileNumber.trim();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  if (hasPool) {
    await ensureOtpTable();
    await pool!.query(
      `INSERT INTO otp_codes (mobile_number, code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (mobile_number) DO UPDATE
       SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at`,
      [cleanMobile, code, expiresAt]
    );
    return;
  }

  otpStore.set(cleanMobile, { code, expiresAt: expiresAt.getTime() });
}

export async function verifyOtp(
  mobileNumber: string,
  code: string
): Promise<{ valid: boolean; reason?: string }> {
  const cleanMobile = mobileNumber.trim();

  if (hasPool) {
    await ensureOtpTable();
    const { rows } = await pool!.query<{ code: string; expiresAt: string }>(
      `SELECT code, EXTRACT(EPOCH FROM expires_at) * 1000 AS "expiresAt"
       FROM otp_codes
       WHERE mobile_number = $1`,
      [cleanMobile]
    );

    const record = rows[0];
    if (!record) {
      return { valid: false, reason: 'No OTP request found for this mobile number.' };
    }

    if (Date.now() > Number(record.expiresAt)) {
      await pool!.query('DELETE FROM otp_codes WHERE mobile_number = $1', [cleanMobile]);
      return { valid: false, reason: 'OTP has expired. Please request a new code.' };
    }

    if (record.code !== code.trim()) {
      return { valid: false, reason: 'Invalid OTP code. Please check and try again.' };
    }

    await pool!.query('DELETE FROM otp_codes WHERE mobile_number = $1', [cleanMobile]);
    return { valid: true };
  }

  const record = otpStore.get(cleanMobile);

  if (!record) {
    return { valid: false, reason: 'No OTP request found for this mobile number.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanMobile);
    return { valid: false, reason: 'OTP has expired. Please request a new code.' };
  }

  if (record.code !== code.trim()) {
    return { valid: false, reason: 'Invalid OTP code. Please check and try again.' };
  }

  otpStore.delete(cleanMobile);
  return { valid: true };
}