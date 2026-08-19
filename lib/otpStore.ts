// OTP storage backed by Postgres (Supabase), with in-memory fallback
// when DATABASE_URL is not configured or un-reachable.
import { pool, hasPool, ensureOtpTable, ensureProfilesTable } from '@/lib/db';

// --- Rate limit / lockout policy -------------------------------
const SEND_COOLDOWN_MS = 60_000; // min gap between OTP sends
const SEND_WINDOW_MS = 15 * 60_000; // rolling window for send quota
const MAX_SENDS_PER_WINDOW = 3; // max OTP sends per window
const MAX_FAILED_ATTEMPTS = 5; // wrong codes before lockout
const LOCKOUT_MS = 30 * 60_000; // lockout duration after repeated failures

type OtpRecord = {
  code: string;
  expiresAt: number;
  sendCount: number;
  lastSentAt: number;
  failedAttempts: number;
  lockedUntil: number;
};

type SendCheck = {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: 'locked' | 'cooldown' | 'rate_limited';
};

type VerifyResult = {
  valid: boolean;
  reason?: string;
  locked?: boolean;
};

// Fallback in-memory store
const globalForOtp = global as unknown as {
  otpStore: Map<string, OtpRecord>;
};

export const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
}

async function getRecord(mobile: string): Promise<OtpRecord | undefined> {
  const mem = otpStore.get(mobile);
  if (!hasPool) return mem;

  try {
    await ensureOtpTable();
    const { rows } = await pool!.query<{
      code: string;
      expiresAt: string;
      sendCount: number;
      lastSentAt: string;
      failedAttempts: number;
      lockedUntil: string;
    }>(
      `SELECT code,
              EXTRACT(EPOCH FROM expires_at) * 1000 AS "expiresAt",
              COALESCE(send_count, 0) AS "sendCount",
              COALESCE(EXTRACT(EPOCH FROM last_sent_at) * 1000, 0) AS "lastSentAt",
              COALESCE(failed_attempts, 0) AS "failedAttempts",
              COALESCE(EXTRACT(EPOCH FROM locked_until) * 1000, 0) AS "lockedUntil"
       FROM otp_codes
       WHERE mobile_number = $1`,
      [mobile]
    );
    const row = rows[0];
    if (row) {
      return {
        code: row.code,
        expiresAt: Number(row.expiresAt),
        sendCount: Number(row.sendCount),
        lastSentAt: Number(row.lastSentAt),
        failedAttempts: Number(row.failedAttempts),
        lockedUntil: Number(row.lockedUntil),
      };
    }
  } catch (e) {
    console.warn('[DB] Failed to query OTP from database, using in-memory store:', e);
  }
  return mem;
}

async function setRecord(mobile: string, rec: OtpRecord): Promise<void> {
  otpStore.set(mobile, rec);

  if (hasPool) {
    try {
      await ensureOtpTable();
      await pool!.query(
        `INSERT INTO otp_codes (mobile_number, code, expires_at, send_count, last_sent_at, failed_attempts, locked_until)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (mobile_number) DO UPDATE
         SET code = EXCLUDED.code,
             expires_at = EXCLUDED.expires_at,
             send_count = EXCLUDED.send_count,
             last_sent_at = EXCLUDED.last_sent_at,
             failed_attempts = EXCLUDED.failed_attempts,
             locked_until = EXCLUDED.locked_until`,
        [
          mobile,
          rec.code,
          new Date(rec.expiresAt),
          rec.sendCount,
          new Date(rec.lastSentAt),
          rec.failedAttempts,
          rec.lockedUntil ? new Date(rec.lockedUntil) : null,
        ]
      );
    } catch (e) {
      console.warn('[DB] Failed to save OTP to database, using in-memory store:', e);
    }
  }
}

async function deleteRecord(mobile: string): Promise<void> {
  otpStore.delete(mobile);
  if (hasPool) {
    try {
      await pool!.query('DELETE FROM otp_codes WHERE mobile_number = $1', [mobile]);
    } catch (e) {
      console.warn('[DB] Failed to delete OTP from database:', e);
    }
  }
}

export async function checkSendAllowed(mobile: string): Promise<SendCheck> {
  const now = Date.now();
  const rec = await getRecord(mobile);

  if (!rec) return { allowed: true };

  if (rec.lockedUntil > now) {
    return {
      allowed: false,
      reason: 'locked',
      retryAfterSeconds: Math.ceil((rec.lockedUntil - now) / 1000),
    };
  }

  const sinceLastSend = now - rec.lastSentAt;
  if (rec.lastSentAt > 0 && sinceLastSend < SEND_COOLDOWN_MS) {
    return {
      allowed: false,
      reason: 'cooldown',
      retryAfterSeconds: Math.ceil((SEND_COOLDOWN_MS - sinceLastSend) / 1000),
    };
  }

  if (rec.sendCount >= MAX_SENDS_PER_WINDOW && sinceLastSend < SEND_WINDOW_MS) {
    return {
      allowed: false,
      reason: 'rate_limited',
      retryAfterSeconds: Math.ceil((SEND_WINDOW_MS - sinceLastSend) / 1000),
    };
  }

  return { allowed: true };
}

export async function recordSend(mobile: string): Promise<void> {
  const now = Date.now();
  const rec = (await getRecord(mobile)) || {
    code: '',
    expiresAt: 0,
    sendCount: 0,
    lastSentAt: 0,
    failedAttempts: 0,
    lockedUntil: 0,
  };

  // New rolling window? Reset the send count.
  if (rec.lastSentAt > 0 && now - rec.lastSentAt > SEND_WINDOW_MS) {
    rec.sendCount = 0;
  }

  rec.sendCount += 1;
  rec.lastSentAt = now;
  await setRecord(mobile, rec);
}

export async function saveOtp(mobileNumber: string, code: string, ttlSeconds = 300): Promise<void> {
  const cleanMobile = mobileNumber.trim();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).getTime();

  const existing = await getRecord(cleanMobile);
  await setRecord(cleanMobile, {
    code,
    expiresAt,
    sendCount: existing?.sendCount ?? 0,
    lastSentAt: existing?.lastSentAt ?? 0,
    failedAttempts: existing?.failedAttempts ?? 0,
    lockedUntil: existing?.lockedUntil ?? 0,
  });
}

export async function verifyOtp(
  mobileNumber: string,
  code: string
): Promise<VerifyResult> {
  const cleanMobile = mobileNumber.trim();

  const record = await getRecord(cleanMobile);

  if (!record) {
    return { valid: false, reason: 'No OTP request found for this mobile number.' };
  }

  if (record.lockedUntil > Date.now()) {
    const mins = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return {
      valid: false,
      locked: true,
      reason: `Too many incorrect attempts. Please try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
    };
  }

  if (Date.now() > record.expiresAt) {
    await deleteRecord(cleanMobile);
    return { valid: false, reason: 'OTP has expired. Please request a new code.' };
  }

  if (record.code !== code.trim()) {
    record.failedAttempts += 1;
    if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_MS;
      await setRecord(cleanMobile, record);
      return {
        valid: false,
        locked: true,
        reason: 'Too many incorrect attempts. Account temporarily locked. Please try again in 30 minutes.',
      };
    }
    await setRecord(cleanMobile, record);
    return { valid: false, reason: 'Invalid OTP code. Please check and try again.' };
  }

  await deleteRecord(cleanMobile);
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
  passwordHash?: string;
  passwordSalt?: string;
  dob?: string;
  birthTime?: string;
  birthPlace?: string;
  rashi?: string;
  nakshatra?: string;
  manglik?: string;
  gotra?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: string;
  familyType?: string;
  familyValues?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  disability?: string;
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
        gender, age, height, marital_status, religion, mother_tongue, education, profession, city, bio,
        password_hash, password_salt, dob, birth_time, birth_place, rashi, nakshatra, manglik, gotra,
        father_occupation, mother_occupation, siblings, family_type, family_values, diet, smoking, drinking, disability,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, now())
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
          password_hash  = COALESCE(EXCLUDED.password_hash, profiles.password_hash),
          password_salt  = COALESCE(EXCLUDED.password_salt, profiles.password_salt),
          dob            = COALESCE(EXCLUDED.dob, profiles.dob),
          birth_time     = COALESCE(EXCLUDED.birth_time, profiles.birth_time),
          birth_place    = COALESCE(EXCLUDED.birth_place, profiles.birth_place),
          rashi          = COALESCE(EXCLUDED.rashi, profiles.rashi),
          nakshatra      = COALESCE(EXCLUDED.nakshatra, profiles.nakshatra),
          manglik        = COALESCE(EXCLUDED.manglik, profiles.manglik),
          gotra          = COALESCE(EXCLUDED.gotra, profiles.gotra),
          father_occupation = COALESCE(EXCLUDED.father_occupation, profiles.father_occupation),
          mother_occupation = COALESCE(EXCLUDED.mother_occupation, profiles.mother_occupation),
          siblings       = COALESCE(EXCLUDED.siblings, profiles.siblings),
          family_type    = COALESCE(EXCLUDED.family_type, profiles.family_type),
          family_values  = COALESCE(EXCLUDED.family_values, profiles.family_values),
          diet           = COALESCE(EXCLUDED.diet, profiles.diet),
          smoking        = COALESCE(EXCLUDED.smoking, profiles.smoking),
          drinking       = COALESCE(EXCLUDED.drinking, profiles.drinking),
          disability     = COALESCE(EXCLUDED.disability, profiles.disability),
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
      profileData.passwordHash || null,
      profileData.passwordSalt || null,
      profileData.dob || null,
      profileData.birthTime || null,
      profileData.birthPlace || null,
      profileData.rashi || null,
      profileData.nakshatra || null,
      profileData.manglik || null,
      profileData.gotra || null,
      profileData.fatherOccupation || null,
      profileData.motherOccupation || null,
      profileData.siblings || null,
      profileData.familyType || null,
      profileData.familyValues || null,
      profileData.diet || null,
      profileData.smoking || null,
      profileData.drinking || null,
      profileData.disability || null,
    ]);
  } catch (e) {
    console.warn('[DB] Failed to save profile to Postgres database:', e);
  }
}