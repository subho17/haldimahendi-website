// OTP storage backed by Postgres (Supabase), with in-memory fallback
// when DATABASE_URL is not configured or un-reachable.
import { pool, hasPool, ensureOtpTable, ensureProfilesTable } from '@/lib/db';

type OtpRecord = {
  code: string;
  expiresAt: number;
};

// Fallback in-memory store
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

  // Always save to in-memory map first as guarantee
  otpStore.set(cleanMobile, { code, expiresAt: expiresAt.getTime() });

  if (hasPool) {
    try {
      await ensureOtpTable();
      await pool!.query(
        `INSERT INTO otp_codes (mobile_number, code, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (mobile_number) DO UPDATE
         SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at`,
        [cleanMobile, code, expiresAt]
      );
    } catch (e) {
      console.warn('[DB] Failed to save OTP to database, using in-memory store:', e);
    }
  }
}

export async function verifyOtp(
  mobileNumber: string,
  code: string
): Promise<{ valid: boolean; reason?: string }> {
  const cleanMobile = mobileNumber.trim();

  // Try DB first if pool available
  if (hasPool) {
    try {
      await ensureOtpTable();
      const { rows } = await pool!.query<{ code: string; expiresAt: string }>(
        `SELECT code, EXTRACT(EPOCH FROM expires_at) * 1000 AS "expiresAt"
         FROM otp_codes
         WHERE mobile_number = $1`,
        [cleanMobile]
      );

      const record = rows[0];
      if (record) {
        if (Date.now() > Number(record.expiresAt)) {
          await pool!.query('DELETE FROM otp_codes WHERE mobile_number = $1', [cleanMobile]).catch(() => {});
          otpStore.delete(cleanMobile);
          return { valid: false, reason: 'OTP has expired. Please request a new code.' };
        }

        if (record.code !== code.trim()) {
          return { valid: false, reason: 'Invalid OTP code. Please check and try again.' };
        }

        await pool!.query('DELETE FROM otp_codes WHERE mobile_number = $1', [cleanMobile]).catch(() => {});
        otpStore.delete(cleanMobile);
        return { valid: true };
      }
    } catch (e) {
      console.warn('[DB] Failed to query OTP from database, falling back to in-memory store:', e);
    }
  }

  // Fallback to in-memory store
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

// ============================================================
// ⭐ SAVE PROFILE — stores user profile data to Supabase Postgres
// ============================================================

export type ProfileData = {
  userId: string;
  displayName: string;
  mobileNumber: string;
  avatarUrl?: string;
  provider: 'otp' | 'google' | 'password';
  gender?: string;
  age?: number;
  height?: string;
  maritalStatus?: string;
  religion?: string;
  motherTongue?: string;
  education?: string;
  profession?: string;
  city?: string;
  bio?: string;
};

export async function saveProfile(profileData: ProfileData): Promise<void> {
  if (!hasPool) {
    console.warn('[Profile] DATABASE_URL not configured. Profile stored locally.');
    return;
  }

  try {
    await ensureProfilesTable();
    await pool!.query(`
      INSERT INTO profiles (
        user_id, display_name, mobile_number, avatar_url, provider, provider_id,
        gender, age, height, marital_status, religion, mother_tongue, education, profession, city, bio, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, now())
      ON CONFLICT (user_id) DO UPDATE
      SET display_name   = EXCLUDED.display_name,
          avatar_url     = EXCLUDED.avatar_url,
          gender         = COALESCE(EXCLUDED.gender, profiles.gender),
          age            = COALESCE(EXCLUDED.age, profiles.age),
          height         = COALESCE(EXCLUDED.height, profiles.height),
          marital_status = COALESCE(EXCLUDED.marital_status, profiles.marital_status),
          religion       = COALESCE(EXCLUDED.religion, profiles.religion),
          mother_tongue  = COALESCE(EXCLUDED.mother_tongue, profiles.mother_tongue),
          education      = COALESCE(EXCLUDED.education, profiles.education),
          profession     = COALESCE(EXCLUDED.profession, profiles.profession),
          city           = COALESCE(EXCLUDED.city, profiles.city),
          bio            = COALESCE(EXCLUDED.bio, profiles.bio),
          updated_at     = now()
    `, [
      profileData.userId,
      profileData.displayName,
      profileData.mobileNumber,
      profileData.avatarUrl || undefined,
      profileData.provider,
      profileData.userId,
      profileData.gender || null,
      profileData.age || null,
      profileData.height || null,
      profileData.maritalStatus || null,
      profileData.religion || null,
      profileData.motherTongue || null,
      profileData.education || null,
      profileData.profession || null,
      profileData.city || null,
      profileData.bio || null,
    ]);
  } catch (e) {
    console.warn('[DB] Failed to save profile to Postgres database:', e);
  }
}