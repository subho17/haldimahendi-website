// Interests + shortlists persistence — Postgres (Supabase) first,
// with a scratch/ JSON file fallback when DATABASE_URL is unset,
// mirroring the pattern used across this app.
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureInteractionsTable } from '@/lib/db';
import { getUserAliases, expandAllAliases } from '@/lib/userAliases';

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

  const [senderAliases, recipientAliases] = await Promise.all([
    getUserAliases(senderId),
    getUserAliases(recipientId),
  ]);

  const now = new Date().toISOString();
  const file = readFile();
  const existing = file.interests.find(
    (i) =>
      (senderAliases.includes(i.senderId) && recipientAliases.includes(i.recipientId)) ||
      (senderAliases.includes(i.recipientId) && recipientAliases.includes(i.senderId))
  );

  if (existing) {
    // If it's already accepted, don't revert to pending
    if (existing.status !== 'accepted') {
      existing.status = 'pending';
    }
  } else {
    file.interests.unshift({
      id: `in_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderId,
      recipientId,
      status: 'pending',
      createdAt: now,
    });
  }
  writeFile(file);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      await pool!.query(
        `INSERT INTO interests (sender_id, recipient_id, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (sender_id, recipient_id) DO UPDATE
           SET status = CASE WHEN interests.status = 'accepted' THEN 'accepted' ELSE 'pending' END,
               updated_at = now()`,
        [senderId, recipientId]
      );
    } catch (e) {
      console.warn('[Interactions] DB sendInterest failed, kept file fallback:', e);
    }
  }
}

export async function unsendInterest(senderId: string, recipientId: string): Promise<void> {
  const [senderAliases, recipientAliases] = await Promise.all([
    getUserAliases(senderId),
    getUserAliases(recipientId),
  ]);

  const file = readFile();
  file.interests = file.interests.filter(
    (i) =>
      !(
        (senderAliases.includes(i.senderId) && recipientAliases.includes(i.recipientId)) ||
        (senderAliases.includes(i.recipientId) && recipientAliases.includes(i.senderId))
      )
  );
  writeFile(file);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      await pool!.query(
        `DELETE FROM interests
         WHERE (sender_id = ANY($1::text[]) AND recipient_id = ANY($2::text[]))
            OR (sender_id = ANY($2::text[]) AND recipient_id = ANY($1::text[]))`,
        [senderAliases, recipientAliases]
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
  const [senderAliases, recipientAliases] = await Promise.all([
    getUserAliases(senderId),
    getUserAliases(recipientId),
  ]);

  const file = readFile();
  let fileUpdated = false;
  file.interests.forEach((i) => {
    const isMatch =
      (senderAliases.includes(i.senderId) && recipientAliases.includes(i.recipientId)) ||
      (senderAliases.includes(i.recipientId) && recipientAliases.includes(i.senderId));
    if (isMatch) {
      i.status = status;
      fileUpdated = true;
    }
  });

  if (!fileUpdated && status === 'accepted') {
    file.interests.unshift({
      id: `in_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderId,
      recipientId,
      status: 'accepted',
      createdAt: new Date().toISOString(),
    });
  }
  writeFile(file);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      const res = await pool!.query(
        `UPDATE interests SET status = $3, updated_at = now()
         WHERE (sender_id = ANY($1::text[]) AND recipient_id = ANY($2::text[]))
            OR (sender_id = ANY($2::text[]) AND recipient_id = ANY($1::text[]))`,
        [senderAliases, recipientAliases, status]
      );

      if (res.rowCount === 0 && status === 'accepted') {
        await pool!.query(
          `INSERT INTO interests (sender_id, recipient_id, status)
           VALUES ($1, $2, 'accepted')
           ON CONFLICT (sender_id, recipient_id) DO UPDATE SET status = 'accepted', updated_at = now()`,
          [senderId, recipientId]
        );
      }
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
export async function getSendState(
  userId: string
): Promise<{ sentIds: string[]; shortlistedIds: string[]; acceptedIds: string[] }> {
  if (!userId) return { sentIds: [], shortlistedIds: [], acceptedIds: [] };

  const myAliases = await getUserAliases(userId);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      const [sent, short, accepted] = await Promise.all([
        pool!.query(`SELECT DISTINCT recipient_id FROM interests WHERE sender_id = ANY($1::text[])`, [myAliases]),
        pool!.query(`SELECT DISTINCT profile_id FROM shortlists WHERE user_id = ANY($1::text[])`, [myAliases]),
        pool!.query(
          `SELECT DISTINCT
             CASE WHEN sender_id = ANY($1::text[]) THEN recipient_id ELSE sender_id END AS partner_id
           FROM interests
           WHERE status = 'accepted'
             AND (sender_id = ANY($1::text[]) OR recipient_id = ANY($1::text[]))`,
          [myAliases]
        ),
      ]);

      const [sentIds, shortlistedIds, acceptedIds] = await Promise.all([
        expandAllAliases(sent.rows.map((r) => r.recipient_id)),
        expandAllAliases(short.rows.map((r) => r.profile_id)),
        expandAllAliases(accepted.rows.map((r) => r.partner_id)),
      ]);

      return { sentIds, shortlistedIds, acceptedIds };
    } catch (e) {
      console.warn('[Interactions] DB getSendState failed, falling back to file:', e);
    }
  }

  const file = readFile();
  const rawSent = file.interests
    .filter((i) => myAliases.includes(i.senderId))
    .map((i) => i.recipientId);
  const rawShort = file.shortlists
    .filter((s) => myAliases.includes(s.userId))
    .map((s) => s.profileId);
  const rawAccepted = file.interests
    .filter((i) => i.status === 'accepted' && (myAliases.includes(i.senderId) || myAliases.includes(i.recipientId)))
    .map((i) => (myAliases.includes(i.senderId) ? i.recipientId : i.senderId));

  const [sentIds, shortlistedIds, acceptedIds] = await Promise.all([
    expandAllAliases(rawSent),
    expandAllAliases(rawShort),
    expandAllAliases(rawAccepted),
  ]);

  return { sentIds, shortlistedIds, acceptedIds };
}

export async function getInbox(userId: string) {
  const myAliases = await getUserAliases(userId);
  const { interests } = await loadAll();
  return {
    received: interests.filter((i) => myAliases.includes(i.recipientId)),
    sent: interests.filter((i) => myAliases.includes(i.senderId)),
  };
}

// Two users are "connected" when either has accepted the other's interest
// (mutual acceptance in either direction).
export async function isAcceptedConnection(a: string, b: string): Promise<boolean> {
  if (!a || !b || a === b) return false;

  const [aAliases, bAliases] = await Promise.all([
    getUserAliases(a),
    getUserAliases(b),
  ]);

  if (hasPool) {
    try {
      await ensureInteractionsTable();
      const { rows } = await pool!.query(
        `SELECT 1 FROM interests
         WHERE status = 'accepted'
           AND (
             (sender_id = ANY($1::text[]) AND recipient_id = ANY($2::text[])) OR
             (sender_id = ANY($2::text[]) AND recipient_id = ANY($1::text[]))
           )
         LIMIT 1`,
        [aAliases, bAliases]
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
      ((aAliases.includes(i.senderId) && bAliases.includes(i.recipientId)) ||
       (bAliases.includes(i.senderId) && aAliases.includes(i.recipientId)))
  );
}