import { Pool } from 'pg';

const globalForDb = global as unknown as {
  pool: Pool | undefined;
};

function createPool(): Pool | undefined {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('[DB] DATABASE_URL not configured. Falling back to in-memory storage.');
    return undefined;
  }
  return new Pool({ connectionString });
}

export const pool = globalForDb.pool ?? createPool();

export const hasPool = typeof pool !== 'undefined' && !!pool;

export const db = {
  query: async <T extends unknown[] = unknown[]>(
    text: string,
    params?: unknown[]
  ): Promise<{ rows: T }> => {
    if (!pool) {
      throw new Error('[DB] DATABASE_URL is not configured.');
    }
    const result = await pool.query(text, params);
    return result as unknown as { rows: T };
  },
};

let ensureOtpPromise: Promise<void> | undefined;
let ensureProfilesPromise: Promise<void> | undefined;
let ensurePreferencesPromise: Promise<void> | undefined;
let ensureInteractionsPromise: Promise<void> | undefined;
let ensureChatPromise: Promise<void> | undefined;

// Idempotent bootstrap: creates the otp_codes table on first use so the
// app works on Vercel without a separate migration step.
export function ensureOtpTable(): Promise<void> {
  if (!hasPool) return Promise.resolve();
  if (!ensureOtpPromise) {
    ensureOtpPromise = (async () => {
      await pool!.query(
        `CREATE TABLE IF NOT EXISTS otp_codes (
          mobile_number  TEXT PRIMARY KEY,
          code           TEXT NOT NULL,
          expires_at     TIMESTAMPTZ NOT NULL,
          created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
          verified_at    TIMESTAMPTZ,
          send_count     INT NOT NULL DEFAULT 0,
          last_sent_at   TIMESTAMPTZ,
          failed_attempts INT NOT NULL DEFAULT 0,
          locked_until   TIMESTAMPTZ
        )`
      );
      await pool!.query(
        `ALTER TABLE otp_codes
         ADD COLUMN IF NOT EXISTS send_count INT NOT NULL DEFAULT 0,
         ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ,
         ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0,
         ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ`
      );
    })();
  }
  return ensureOtpPromise;
}

// ============================================================
// ⭐ PROFILES TABLE — auto-created on first use
// ============================================================

// Auto-create the profiles table on first use (no manual migration needed).
// Stores user profile data including avatar URL, display name, etc.
export function ensureProfilesTable(): Promise<void> {
  if (!hasPool) return Promise.resolve();
  if (ensureProfilesPromise) return ensureProfilesPromise;

  ensureProfilesPromise = (async () => {
    // Step 1: Create table with full matrimonial profile schema
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          TEXT NOT NULL UNIQUE,
        display_name     TEXT NOT NULL,
        mobile_number    TEXT NOT NULL,
        email            TEXT,
        avatar_url       TEXT,
        cover_image      TEXT,
        gender           TEXT,
        age              INT,
        height           TEXT,
        marital_status   TEXT,
        religion         TEXT,
        mother_tongue    TEXT,
        education        TEXT,
        profession       TEXT,
        city             TEXT,
        country          TEXT DEFAULT 'India',
        bio              TEXT,
        provider         TEXT NOT NULL DEFAULT 'otp',
        provider_id      TEXT,
        created_at       TIMESTAMPTZ DEFAULT now(),
        updated_at       TIMESTAMPTZ DEFAULT now(),
        membership_tier  TEXT DEFAULT 'free',
        membership_expires_at TIMESTAMPTZ,
        dob            DATE,
        birth_time     TEXT,
        birth_place    TEXT,
        rashi          TEXT,
        nakshatra      TEXT,
        manglik        TEXT,
        gotra          TEXT,
        father_occupation TEXT,
        mother_occupation TEXT,
        siblings       TEXT,
        family_type    TEXT,
        family_values  TEXT,
        diet           TEXT,
        smoking        TEXT,
        drinking       TEXT,
        disability     TEXT,
        -- Verification badges
        mobile_verified     BOOLEAN DEFAULT FALSE,
        email_verified      BOOLEAN DEFAULT FALSE,
        id_verified         BOOLEAN DEFAULT FALSE,
        photo_verified      BOOLEAN DEFAULT FALSE,
        verification_badge  TEXT,
        -- Profile boost
        profile_boost_expires_at TIMESTAMPTZ,
        profile_boost_type TEXT,
        -- Featured profile
        featured_profile      BOOLEAN DEFAULT FALSE,
        featured_profile_until TIMESTAMPTZ,
        -- Contact credits
        contact_credits       INT DEFAULT 0,
        -- Privacy controls
        hide_phone          BOOLEAN DEFAULT FALSE,
        hide_email          BOOLEAN DEFAULT FALSE,
        hide_surname        BOOLEAN DEFAULT FALSE,
        hide_photos         BOOLEAN DEFAULT FALSE,
        photo_privacy       TEXT DEFAULT 'public', -- 'public', 'contacts_only', 'private'
        -- Existing columns
        dob            DATE,
        birth_time     TEXT,
        birth_place    TEXT,
        rashi          TEXT,
        nakshatra      TEXT,
        manglik        TEXT,
        gotra          TEXT,
        father_occupation TEXT,
        mother_occupation TEXT,
        siblings       TEXT,
        family_type    TEXT,
        family_values  TEXT,
        diet           TEXT,
        smoking        TEXT,
        drinking       TEXT,
        disability     TEXT
      )
    `);

    // Step 2: Add any missing columns safely to existing table
    await pool!.query(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marital_status TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religion TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mother_tongue TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profession TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_salt TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_time TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_place TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rashi TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nakshatra TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manglik TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gotra TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS father_occupation TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mother_occupation TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS siblings TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_type TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_values TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diet TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smoking TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drinking TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disability TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_badge TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_boost_expires_at TIMESTAMPTZ;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_boost_type TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_profile BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_profile_until TIMESTAMPTZ;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_credits INT DEFAULT 0;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hide_phone BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hide_email BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hide_surname BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hide_photos BOOLEAN DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_privacy TEXT DEFAULT 'public';
      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','flat')),
        discount_value INTEGER NOT NULL,
        applicable_plans TEXT[] DEFAULT '{}',
        max_uses INTEGER NOT NULL DEFAULT 1,
        used_count INTEGER NOT NULL DEFAULT 0,
        per_user_limit INTEGER NOT NULL DEFAULT 1,
        starts_at TIMESTAMPTZ NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      -- Profile boosts table
      CREATE TABLE IF NOT EXISTS profile_boosts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        boost_type TEXT NOT NULL CHECK (boost_type IN ('24h', '3d', '7d')),
        expires_at TIMESTAMPTZ NOT NULL,
        purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        is_active BOOLEAN DEFAULT TRUE
      );

      CREATE INDEX IF NOT EXISTS idx_profile_boosts_user ON profile_boosts (user_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_profile_boosts_expires ON profile_boosts (expires_at);

      -- Contact credits table
      CREATE TABLE IF NOT EXISTS contact_credits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        credits INT NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ,
        purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        source TEXT, -- 'membership', 'purchase', 'promo'
        UNIQUE (user_id)
      );

      -- Featured profiles
      CREATE TABLE IF NOT EXISTS featured_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL UNIQUE,
        featured_until TIMESTAMPTZ NOT NULL,
        set_by_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_featured_profiles_expires ON featured_profiles (featured_until);
    `);

    // Step 3: Create function & trigger
    await pool!.query(`
      CREATE OR REPLACE FUNCTION update_profiles_updated_at()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool!.query(`
      DROP TRIGGER IF EXISTS update_profiles_timestamp ON profiles;
      CREATE TRIGGER update_profiles_timestamp
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_profiles_updated_at();
    `);
  })();

  return ensureProfilesPromise;
}

// ============================================================
// ⭐ PARTNER PREFERENCES TABLE — auto-created on first use
// ============================================================

// Stores what each user is looking for in a partner. The matchmaking
// engine (lib/matching.ts) uses these to qualify and score candidates.
export function ensurePreferencesTable(): Promise<void> {
  if (!hasPool) return Promise.resolve();
  if (ensurePreferencesPromise) return ensurePreferencesPromise;

  ensurePreferencesPromise = (async () => {
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS partner_preferences (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       TEXT NOT NULL UNIQUE,
        partner_gender TEXT,
        age_min       INT,
        age_max       INT,
        height_min    TEXT,
        height_max    TEXT,
        religion      TEXT,
        mother_tongue TEXT,
        marital_status TEXT,
        city          TEXT,
        education     TEXT,
        created_at    TIMESTAMPTZ DEFAULT now(),
        updated_at    TIMESTAMPTZ DEFAULT now()
      )
    `);

    await pool!.query(`
      CREATE OR REPLACE FUNCTION update_partner_preferences_updated_at()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool!.query(`
      DROP TRIGGER IF EXISTS update_partner_preferences_timestamp ON partner_preferences;
      CREATE TRIGGER update_partner_preferences_timestamp
      BEFORE UPDATE ON partner_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_partner_preferences_updated_at();
    `);
  })();

  return ensurePreferencesPromise;
}

// ============================================================
// ⭐ INTERESTS + SHORTLISTS TABLES — auto-created on first use
// ============================================================

// interests: interest sent between two users (sender -> recipient).
//   status: 'pending' (awaiting recipient) | 'accepted' | 'declined'
// shortlists: a user bookmarking a profile.
export function ensureInteractionsTable(): Promise<void> {
  if (!hasPool) return Promise.resolve();
  if (ensureInteractionsPromise) return ensureInteractionsPromise;

  ensureInteractionsPromise = (async () => {
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS interests (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id    TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        status       TEXT NOT NULL DEFAULT 'pending',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (sender_id, recipient_id)
      )
    `);

    await pool!.query(`
      CREATE TABLE IF NOT EXISTS shortlists (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    TEXT NOT NULL,
        profile_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_id, profile_id)
      )
    `);
  })();

  return ensureInteractionsPromise;
}

// ============================================================
// ⭐ CHAT TABLES — auto-created on first use
// ============================================================

// conversations: a two-participant chat thread between user_a and user_b
// (user_a < user_b lexically, enforced by the app). Access is restricted
// to accepted connections (both members accepted each other's interest).
// chat_messages: messages within a conversation.
export function ensureChatTables(): Promise<void> {
  if (!hasPool) return Promise.resolve();
  if (ensureChatPromise) return ensureChatPromise;

  ensureChatPromise = (async () => {
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_a          TEXT NOT NULL,
        user_b          TEXT NOT NULL,
        last_message    TEXT,
        last_message_at TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_a, user_b)
      )
    `);

    await pool!.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id       TEXT NOT NULL,
        recipient_id    TEXT NOT NULL,
        content         TEXT NOT NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        read_at         TIMESTAMPTZ
      )
    `);

    await pool!.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_conv
      ON chat_messages (conversation_id, created_at)
    `);
  })();

  return ensureChatPromise;
}

// ============================================================
// ⭐ SAFETY TABLES (REPORTS + BLOCKS) — auto-created on first use
// ============================================================

let ensureSafetyPromise: Promise<void> | undefined;

// reports: user-submitted moderation reports against a member.
//   status: 'open' (awaiting review) | 'resolved' | 'dismissed'
// blocks: one user hiding/interacting-blocking another (blocker -> blocked).
export function ensureSafetyTables(): Promise<void> {  if (!hasPool) return Promise.resolve();
  if (ensureSafetyPromise) return ensureSafetyPromise;

  ensureSafetyPromise = (async () => {
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id TEXT NOT NULL,
        reported_id TEXT NOT NULL,
        reason      TEXT NOT NULL,
        details     TEXT,
        status      TEXT NOT NULL DEFAULT 'open',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool!.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blocker_id TEXT NOT NULL,
        blocked_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (blocker_id, blocked_id)
      )
    `);

    await pool!.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_reported
      ON reports (reported_id, status)
    `);
    await pool!.query(`
      CREATE INDEX IF NOT EXISTS idx_blocks_blocker
      ON blocks (blocker_id)
    `);
  })();

  return ensureSafetyPromise;
}

// ============================================================
// ⭐ NOTIFICATIONS TABLE — auto-created on first use
// ============================================================

let ensureNotificationsPromise: Promise<void> | undefined;
// notifications: in-app events for a member (interest received, accepted,
// new message, system). `read` controls the unread badge.
export function ensureNotificationsTable(): Promise<void> {
  if (!hasPool) return Promise.resolve();
  if (ensureNotificationsPromise) return ensureNotificationsPromise;

  ensureNotificationsPromise = (async () => {
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    TEXT NOT NULL,
        actor_id   TEXT,
        type       TEXT NOT NULL DEFAULT 'system',
        title      TEXT,
        message    TEXT NOT NULL,
        data       JSONB,
        read       BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool!.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user
      ON notifications (user_id, created_at)
    `);
  })();

  return ensureNotificationsPromise;
}

// ============================================================
// ⭐ VERIFICATIONS TABLE — auto-created on first use
// ============================================================

let ensureVerificationsPromise: Promise<void> | undefined;

// verifications: member photo/ID verification submissions.
//   status: 'pending' | 'approved' | 'rejected'
export function ensureVerificationsTable(): Promise<void> {
  if (!hasPool) return Promise.resolve();
  if (ensureVerificationsPromise) return ensureVerificationsPromise;

  ensureVerificationsPromise = (async () => {
    await pool!.query(`
      CREATE TABLE IF NOT EXISTS verifications (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     TEXT NOT NULL,
        id_type     TEXT NOT NULL,
        id_number   TEXT NOT NULL,
        selfie_url  TEXT,
        document_url TEXT,
        status      TEXT NOT NULL DEFAULT 'pending',
        reviewed_at TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool!.query(`
      CREATE INDEX IF NOT EXISTS idx_verifications_user
      ON verifications (user_id, created_at)
    `);
    await pool!.query(`
      CREATE INDEX IF NOT EXISTS idx_verifications_status
      ON verifications (status, created_at)
    `);
  })();

  return ensureVerificationsPromise;
}