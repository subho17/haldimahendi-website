// Verification submissions persistence — Postgres (Supabase) first, with a
// scratch/ JSON file fallback when DATABASE_URL is unset, mirroring the
// pattern used across this app.
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureVerificationsTable, ensureProfilesTable } from '@/lib/db';

const VERIFICATIONS_FILE = path.join(process.cwd(), 'scratch', 'verifications_db.json');

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRow {
  id: string;
  userId: string;
  idType: string;
  idNumber: string;
  selfieUrl?: string;
  documentUrl?: string;
  status: VerificationStatus;
  createdAt: string;
  reviewedAt?: string;
}

function ensureFile() {
  const dir = path.dirname(VERIFICATIONS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(VERIFICATIONS_FILE)) {
    fs.writeFileSync(VERIFICATIONS_FILE, JSON.stringify([], null, 2));
  }
}

function readFile(): VerificationRow[] {
  try {
    ensureFile();
    const parsed = JSON.parse(fs.readFileSync(VERIFICATIONS_FILE, 'utf-8') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[Verification] Failed to read verifications file:', e);
    return [];
  }
}

function writeFile(rows: VerificationRow[]) {
  try {
    ensureFile();
    fs.writeFileSync(VERIFICATIONS_FILE, JSON.stringify(rows, null, 2));
  } catch (e) {
    console.warn('[Verification] Failed to write verifications file:', e);
  }
}

async function readPg() {
  await ensureVerificationsTable();
  const { rows } = await pool!.query(
    `SELECT id, user_id, id_type, id_number, selfie_url, document_url, status, created_at, reviewed_at
     FROM verifications
     ORDER BY created_at DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    idType: r.id_type,
    idNumber: r.id_number,
    selfieUrl: r.selfie_url || undefined,
    documentUrl: r.document_url || undefined,
    status: (r.status || 'pending') as VerificationStatus,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
    reviewedAt: r.reviewed_at?.toISOString?.() || undefined,
  }));
}

async function loadAll(): Promise<VerificationRow[]> {
  if (hasPool) {
    try {
      return await readPg();
    } catch (e) {
      console.warn('[Verification] DB read failed, falling back to file:', e);
    }
  }
  return readFile();
}

function nowIso(): string {
  return new Date().toISOString();
}

// ------------------------------------------------------------------
// Submit / query
// ------------------------------------------------------------------
export async function submitVerification(input: {
  userId: string;
  idType: string;
  idNumber: string;
  selfieUrl?: string;
  documentUrl?: string;
}): Promise<VerificationRow | null> {
  const userId = (input.userId || '').trim();
  if (!userId) return null;

  const record: VerificationRow = {
    id: `ver_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    idType: input.idType,
    idNumber: input.idNumber,
    selfieUrl: input.selfieUrl,
    documentUrl: input.documentUrl,
    status: 'pending',
    createdAt: nowIso(),
  };

  const file = readFile();
  file.unshift(record);
  writeFile(file);

  if (hasPool) {
    try {
      await ensureVerificationsTable();
      await pool!.query(
        `INSERT INTO verifications (user_id, id_type, id_number, selfie_url, document_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, input.idType, input.idNumber, input.selfieUrl || null, input.documentUrl || null]
      );
    } catch (e) {
      console.warn('[Verification] DB submit failed, kept file fallback:', e);
    }
  }

  return record;
}

export async function getVerificationStatus(userId: string): Promise<{
  verified: boolean;
  submission: VerificationRow | null;
}> {
  const cleanId = (userId || '').trim();
  if (!cleanId) return { verified: false, submission: null };

  const rows = await loadAll();
  const mine = rows
    .filter((v) => v.userId === cleanId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const latest = mine[0] || null;
  return { verified: latest?.status === 'approved', submission: latest };
}

// ------------------------------------------------------------------
// Admin review
// ------------------------------------------------------------------
export async function listVerifications(filter?: 'pending' | 'all'): Promise<VerificationRow[]> {
  const rows = await loadAll();
  if (filter === 'pending') return rows.filter((v) => v.status === 'pending');
  return rows;
}

export async function reviewVerification(
  submissionId: string,
  action: 'approve' | 'reject'
): Promise<VerificationRow | null> {
  const rows = await loadAll();
  const target = rows.find((v) => v.id === submissionId);
  if (!target) return null;

  const status: VerificationStatus = action === 'approve' ? 'approved' : 'rejected';
  target.status = status;
  target.reviewedAt = nowIso();
  writeFile(rows);

  if (hasPool) {
    try {
      await ensureVerificationsTable();
      await pool!.query(
        `UPDATE verifications SET status = $2, reviewed_at = now()
         WHERE id = $1`,
        [submissionId, status]
      );

      // Mirror the verdict onto the member's profile.
      await ensureProfilesTable();
      await pool!.query(
        `UPDATE profiles SET verification_status = $2, updated_at = now()
         WHERE user_id = $1`,
        [target.userId, status]
      );
    } catch (e) {
      console.warn('[Verification] DB review failed, kept file fallback:', e);
    }
  }

  // Scratch profile mirror too.
  try {
    const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');
    if (fs.existsSync(USERS_FILE)) {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
      const idx = users.findIndex(
        (u: { profileId?: string; mobileNumber?: string; email?: string }) =>
          u.profileId === target.userId || u.mobileNumber === target.userId || u.email === target.userId
      );
      if (idx >= 0) {
        users[idx].verificationStatus = status;
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      }
    }
  } catch (e) {
    console.warn('[Verification] Could not mirror verdict to scratch profile:', e);
  }

  return target;
}
