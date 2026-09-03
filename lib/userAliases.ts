import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

// In-memory cache for fast lookup with TTL
const aliasCache = new Map<string, { aliases: string[]; ts: number }>();
const CACHE_TTL = 30000; // 30 seconds

export async function getUserAliases(id: string): Promise<string[]> {
  const cleanId = (id || '').toString().trim();
  if (!cleanId) return [];

  const cached = aliasCache.get(cleanId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.aliases;
  }

  const set = new Set<string>([cleanId]);

  // 1. Check local users file
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const users: Array<{ profileId?: string; mobileNumber?: string; mobile_number?: string; email?: string }> = JSON.parse(data || '[]');
      const hit = users.find(
        (u) =>
          (u.profileId && u.profileId.toLowerCase() === cleanId.toLowerCase()) ||
          (u.mobileNumber && u.mobileNumber.replace(/\D/g, '') === cleanId.replace(/\D/g, '')) ||
          (u.mobile_number && u.mobile_number.replace(/\D/g, '') === cleanId.replace(/\D/g, '')) ||
          (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
      );
      if (hit) {
        if (hit.profileId) set.add(hit.profileId);
        if (hit.mobileNumber) set.add(hit.mobileNumber);
        if (hit.mobile_number) set.add(hit.mobile_number);
        if (hit.email) set.add(hit.email);
      }
    }
  } catch (e) {
    console.warn('[UserAliases] file read error:', e);
  }

  // 2. Check Postgres profiles table
  if (hasPool) {
    try {
      await ensureProfilesTable();
      const idsToCheck = Array.from(set);
      const { rows } = await pool!.query(
        `SELECT user_id, mobile_number, email FROM profiles
         WHERE user_id = ANY($1::text[]) OR mobile_number = ANY($1::text[]) OR email = ANY($1::text[])`,
        [idsToCheck]
      );
      for (const r of rows) {
        if (r.user_id) set.add(r.user_id);
        if (r.mobile_number) set.add(r.mobile_number);
        if (r.email) set.add(r.email);
      }
    } catch (e) {
      console.warn('[UserAliases] Postgres read error:', e);
    }
  }

  const aliases = Array.from(set).filter(Boolean);
  for (const alias of aliases) {
    aliasCache.set(alias, { aliases, ts: Date.now() });
  }

  return aliases;
}

export async function expandAllAliases(ids: string[]): Promise<string[]> {
  const result = new Set<string>();
  for (const id of ids) {
    const aliases = await getUserAliases(id);
    for (const a of aliases) {
      result.add(a);
    }
  }
  return Array.from(result);
}
