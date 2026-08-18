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
    ensureOtpPromise = pool!.query(
      `CREATE TABLE IF NOT EXISTS otp_codes (
        mobile_number  TEXT PRIMARY KEY,
        code           TEXT NOT NULL,
        expires_at     TIMESTAMPTZ NOT NULL,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        verified_at    TIMESTAMPTZ
      )`
    ).then(() => undefined);
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
        updated_at       TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Step 2: Add any missing columns safely to existing table
    await pool!.query(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INT;
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