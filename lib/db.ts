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

let ensurePromise: Promise<void> | undefined;

// Idempotent bootstrap: creates the otp_codes table on first use so the
// app works on Vercel without a separate migration step.
export function ensureOtpTable(): Promise<void> {
  if (!hasPool) return Promise.resolve();
  if (!ensurePromise) {
    ensurePromise = pool!.query(
      `CREATE TABLE IF NOT EXISTS otp_codes (
        mobile_number  TEXT PRIMARY KEY,
        code           TEXT NOT NULL,
        expires_at     TIMESTAMPTZ NOT NULL,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        verified_at    TIMESTAMPTZ
      )`
    ).then(() => undefined);
  }
  return ensurePromise;
}

// ============================================================
// ⭐ PROFILES TABLE — auto-created on first use
// ============================================================

// Auto-create the profiles table on first use (no manual migration needed).
// Stores user profile data including avatar URL, display name, etc.
export function ensureProfilesTable(): Promise<void> {
  if (!hasPool) return Promise.resolve();
  if (ensurePromise) return Promise.resolve(); // already pending

  // Step 1: Create the table
  const step1 = pool!.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          UUID NOT NULL UNIQUE,
      display_name     TEXT NOT NULL,
      mobile_number    TEXT NOT NULL,
      avatar_url       TEXT,
      cover_image      TEXT,
      bio              TEXT,
      provider         TEXT NOT NULL DEFAULT 'otp',
      provider_id      TEXT,
      created_at       TIMESTAMPTZ DEFAULT now(),
      updated_at       TIMESTAMPTZ DEFAULT now()
    )
  `);

  // Step 2: Add timestamp trigger (runs after step1 completes)
  const step2 = step1.then(() => {
    return pool!.query(`
      CREATE OR REPLACE FUNCTION update_profiles_updated_at()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  });

  // Step 3: Add the trigger itself (runs after step2 completes)
  const step3 = step2.then(() => {
    return pool!.query(`
      CREATE TRIGGER update_profiles_timestamp
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_profiles_updated_at();
    `);
  });

  // All steps complete → return a resolved promise
  ensurePromise = Promise.all([step1, step2, step3]).then(() => undefined);
  return ensurePromise;
}