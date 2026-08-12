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