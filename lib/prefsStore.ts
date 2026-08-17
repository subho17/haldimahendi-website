// Partner preferences persistence — Postgres (Supabase) first,
// with a scratch/ JSON file fallback when DATABASE_URL is unset,
// mirroring the pattern used across this app.
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensurePreferencesTable } from '@/lib/db';
import type { MatchPreferences } from '@/lib/matching';

const PREFS_FILE = path.join(process.cwd(), 'scratch', 'preferences_db.json');

export type StoredPreferences = MatchPreferences;

function ensurePrefsFile() {
  const dir = path.dirname(PREFS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(PREFS_FILE)) fs.writeFileSync(PREFS_FILE, JSON.stringify([], null, 2));
}

function readFilePrefs(userId: string): MatchPreferences | null {
  try {
    ensurePrefsFile();
    const data = fs.readFileSync(PREFS_FILE, 'utf-8');
    const records = JSON.parse(data || '[]') as (MatchPreferences & { userId: string })[];
    const found = records.find((r) => r.userId === userId);
    return found || null;
  } catch (e) {
    console.warn('[Prefs] Failed to read preferences file:', e);
    return null;
  }
}

function writeFilePrefs(prefs: MatchPreferences): void {
  try {
    ensurePrefsFile();
    const data = fs.readFileSync(PREFS_FILE, 'utf-8');
    const records = JSON.parse(data || '[]') as (MatchPreferences & { userId: string; createdAt?: string; updatedAt?: string })[];
    const idx = records.findIndex((r) => r.userId === prefs.userId);
    const record = { ...prefs, updatedAt: new Date().toISOString() } as MatchPreferences & { userId: string; createdAt?: string; updatedAt?: string };
    if (idx >= 0) records[idx] = { ...records[idx], ...record };
    else records.push({ ...record, createdAt: new Date().toISOString() });
    fs.writeFileSync(PREFS_FILE, JSON.stringify(records, null, 2));
  } catch (e) {
    console.warn('[Prefs] Failed to write preferences file:', e);
  }
}

export async function loadPreferences(userId: string): Promise<StoredPreferences | null> {
  if (!userId) return null;

  if (hasPool) {
    try {
      await ensurePreferencesTable();
      const { rows } = await pool!.query(
        `SELECT user_id, partner_gender, age_min, age_max, height_min, height_max,
                religion, mother_tongue, marital_status, city, education
         FROM partner_preferences
         WHERE user_id = $1`,
        [userId]
      );
      if (rows.length > 0) {
        const r = rows[0];
        return {
          userId: r.user_id,
          partnerGender: r.partner_gender || undefined,
          ageMin: r.age_min ?? undefined,
          ageMax: r.age_max ?? undefined,
          heightMin: r.height_min || undefined,
          heightMax: r.height_max || undefined,
          religion: r.religion || undefined,
          motherTongue: r.mother_tongue || undefined,
          maritalStatus: r.marital_status || undefined,
          city: r.city || undefined,
          education: r.education || undefined,
        };
      }
    } catch (e) {
      console.warn('[Prefs] DB read failed, falling back to file:', e);
    }
  }

  return readFilePrefs(userId);
}

export async function savePreferences(prefs: StoredPreferences): Promise<void> {
  if (!prefs?.userId) return;

  // Always write to the file store as a guarantee (matches OTP pattern).
  writeFilePrefs(prefs);

  if (hasPool) {
    try {
      await ensurePreferencesTable();
      await pool!.query(
        `INSERT INTO partner_preferences (
           user_id, partner_gender, age_min, age_max, height_min, height_max,
           religion, mother_tongue, marital_status, city, education
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (user_id) DO UPDATE
         SET partner_gender = EXCLUDED.partner_gender,
             age_min        = EXCLUDED.age_min,
             age_max        = EXCLUDED.age_max,
             height_min     = EXCLUDED.height_min,
             height_max     = EXCLUDED.height_max,
             religion       = EXCLUDED.religion,
             mother_tongue  = EXCLUDED.mother_tongue,
             marital_status = EXCLUDED.marital_status,
             city           = EXCLUDED.city,
             education      = EXCLUDED.education
         `,
        [
          prefs.userId,
          prefs.partnerGender || null,
          prefs.ageMin ?? null,
          prefs.ageMax ?? null,
          prefs.heightMin || null,
          prefs.heightMax || null,
          prefs.religion || null,
          prefs.motherTongue || null,
          prefs.maritalStatus || null,
          prefs.city || null,
          prefs.education || null,
        ]
      );
    } catch (e) {
      console.warn('[Prefs] DB write failed, kept file fallback:', e);
    }
  }
}