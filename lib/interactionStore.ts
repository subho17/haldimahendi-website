// Interests + shortlists persistence — Postgres (Supabase) first,
// with a scratch/ JSON file fallback when DATABASE_URL is unset,
// mirroring the pattern used across this app.
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureInteractionsTable } from '@/lib/db';

const INTERACTIONS_FILE = path.join(process.cwd(), 'scratch', 'interactions_db.json');

export type InterestStatus = 'pending' | 'accepted' | 'declined';

export interface InterestRow {
  id: string;
  senderId: string;
  recipientId: string;
  status: InterestStatus;
  createdAt: string;
}

export interface ShortlistRow {
  id: string;
  userId: string;
  profileId: string;
  createdAt: string;
}

interface InteractionsFile {
  interests: InterestRow[];
  shortlists: ShortlistRow[];
}

function ensureFile() {
  const dir = path.dirname(INTERACTIONS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(INTERACTIONS_FILE)) {
    fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify({ interests: [], shortlists: [] }, null, 2));
  }
}

function readFile(): InteractionsFile {
  try {
    ensureFile();
    const data = fs.readFileSync(INTERACTIONS_FILE, 'utf-8');
    const parsed = JSON.parse(data || '{}');
    return {
      interests: Array.isArray(parsed.interests) ? parsed.interests : [],
      shortlists: Array.isArray(parsed.shortlists) ? parsed.shortlists : [],
    };
  } catch (e) {
    console.warn('[Interactions] Failed to read interactions file:', e);
    return { interests: [], shortlists: [] };
  }
}

function writeFile(state: InteractionsFile) {
  try {
    ensureFile();
    fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn('[Interactions] Failed to write interactions file:', e);
  }
}

async function readPg() {
  await ensureInteractionsTable();
  const [intRes, shortRes] = await Promise.all([
    pool!.query(`SELECT id, sender_id, recipient_id, status, created_at FROM interests ORDER BY created_at DESC`),
    pool!.query(`SELECT id, user_id, profile_id, created_at FROM shortlists ORDER BY created_at DESC`),
  ]);
  const interests: InterestRow[] = intRes.rows.map((r) => ({
    id: r.id,
    senderId: r.sender_id,
    recipientId: r.recipient_id,
    status: (r.status || 'pending') as InterestStatus,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
  }));
  const shortlists: ShortlistRow[] = shortRes.rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    profileId: r.profile_id,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
  }));
  return { interests, shortlists };
}

async function loadAll(): Promise<InteractionsFile> {
  if (hasPool) {
    try {
      return await readPg();
    } catch (e) {
      console.warn('[Interactions] DB read failed, falling back to file:', e);
    }
  }
  return readFile();
}

// ------------------------------------------------------------------
// Interests
// ------------------------------------------------------------------
export async function sendInterest(senderId: string, recipientId: string): Promise<void> {
  if (!senderId || !recipientId || senderId === recipientId) return;

  const now = new Date().toISOString();
  const file = readFile();
  const existing = file.interests.find(
    (i) => i.senderId === senderId && i.recipientId === recipientId
  );
  if (existing) existing.status = 'pending';
  else file.interests.unshift({ id: `in_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, senderId, recipientId, status: 'pending', createdAt: now });
  writeFile(file);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      await pool!.query(
        `INSERT INTO interests (sender_id, recipient_id, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (sender_id, recipient_id) DO UPDATE SET status = 'pending', updated_at = now()`,
        [senderId, recipientId]
      );
    } catch (e) {
      console.warn('[Interactions] DB sendInterest failed, kept file fallback:', e);
    }
  }
}

export async function unsendInterest(senderId: string, recipientId: string): Promise<void> {
  const file = readFile();
  file.interests = file.interests.filter(
    (i) => !(i.senderId === senderId && i.recipientId === recipientId)
  );
  writeFile(file);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      await pool!.query(
        'DELETE FROM interests WHERE sender_id = $1 AND recipient_id = $2',
        [senderId, recipientId]
      );
    } catch (e) {
      console.warn('[Interactions] DB unsendInterest failed, kept file fallback:', e);
    }
  }
}

export async function setInterestStatus(
  senderId: string,
  recipientId: string,
  status: InterestStatus
): Promise<void> {
  const file = readFile();
  const row = file.interests.find(
    (i) => i.senderId === senderId && i.recipientId === recipientId
  );
  if (row) row.status = status;
  writeFile(file);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      await pool!.query(
        `UPDATE interests SET status = $3, updated_at = now()
         WHERE sender_id = $1 AND recipient_id = $2`,
        [senderId, recipientId, status]
      );
    } catch (e) {
      console.warn('[Interactions] DB setInterestStatus failed, kept file fallback:', e);
    }
  }
}

// ------------------------------------------------------------------
// Shortlists
// ------------------------------------------------------------------
export async function shortlistProfile(userId: string, profileId: string): Promise<void> {
  if (!userId || !profileId) return;

  const file = readFile();
  if (!file.shortlists.some((s) => s.userId === userId && s.profileId === profileId)) {
    file.shortlists.unshift({
      id: `sh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      profileId,
      createdAt: new Date().toISOString(),
    });
  }
  writeFile(file);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      await pool!.query(
        `INSERT INTO shortlists (user_id, profile_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, profile_id) DO NOTHING`,
        [userId, profileId]
      );
    } catch (e) {
      console.warn('[Interactions] DB shortlist failed, kept file fallback:', e);
    }
  }
}

export async function unshortlistProfile(userId: string, profileId: string): Promise<void> {
  const file = readFile();
  file.shortlists = file.shortlists.filter((s) => !(s.userId === userId && s.profileId === profileId));
  writeFile(file);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      await pool!.query(
        'DELETE FROM shortlists WHERE user_id = $1 AND profile_id = $2',
        [userId, profileId]
      );
    } catch (e) {
      console.warn('[Interactions] DB unshortlist failed, kept file fallback:', e);
    }
  }
}

// ------------------------------------------------------------------
// Queries
// ------------------------------------------------------------------
export async function getSendState(userId: string): Promise<{ sentIds: string[]; shortlistedIds: string[] }> {
  if (!userId) return { sentIds: [], shortlistedIds: [] };

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      const [sent, short] = await Promise.all([
        pool!.query(`SELECT DISTINCT recipient_id FROM interests WHERE sender_id = $1`, [userId]),
        pool!.query(`SELECT DISTINCT profile_id FROM shortlists WHERE user_id = $1`, [userId]),
      ]);
      return {
        sentIds: sent.rows.map((r) => r.recipient_id) as string[],
        shortlistedIds: short.rows.map((r) => r.profile_id) as string[],
      };
    } catch (e) {
      console.warn('[Interactions] DB getSendState failed, falling back to file:', e);
    }
  }

  const file = readFile();
  return {
    sentIds: file.interests.filter((i) => i.senderId === userId).map((i) => i.recipientId),
    shortlistedIds: file.shortlists.filter((s) => s.userId === userId).map((s) => s.profileId),
  };
}

export async function getInbox(userId: string) {
  const { interests } = await loadAll();
  return {
    received: interests.filter((i) => i.recipientId === userId),
    sent: interests.filter((i) => i.senderId === userId),
  };
}

// Two users are "connected" when either has accepted the other's interest
// (mutual acceptance in either direction).
export async function isAcceptedConnection(a: string, b: string): Promise<boolean> {
  if (!a || !b || a === b) return false;

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      const { rows } = await pool!.query(
        `SELECT 1 FROM interests
         WHERE status = 'accepted'
           AND ((sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1))
         LIMIT 1`,
        [a, b]
      );
      if (rows.length > 0) return true;
    } catch (e) {
      console.warn('[Interactions] DB isAcceptedConnection failed, checking file:', e);
    }
  }

  const file = readFile();
  return file.interests.some(
    (i) =>
      i.status === 'accepted' &&
      ((i.senderId === a && i.recipientId === b) || (i.senderId === b && i.recipientId === a))
  );
}