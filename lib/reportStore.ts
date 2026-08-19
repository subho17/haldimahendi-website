// Reports + Blocks persistence — Postgres (Supabase) first, with a
// scratch/ JSON file fallback when DATABASE_URL is unset, mirroring the
// pattern used across this app.
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureSafetyTables } from '@/lib/db';

const SAFETY_FILE = path.join(process.cwd(), 'scratch', 'safety_db.json');

export interface ReportRow {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  details?: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface BlockRow {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

interface SafetyFile {
  reports: ReportRow[];
  blocks: BlockRow[];
}

function ensureFile() {
  const dir = path.dirname(SAFETY_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(SAFETY_FILE)) {
    fs.writeFileSync(SAFETY_FILE, JSON.stringify({ reports: [], blocks: [] }, null, 2));
  }
}

function readFile(): SafetyFile {
  try {
    ensureFile();
    const parsed = JSON.parse(fs.readFileSync(SAFETY_FILE, 'utf-8') || '{}');
    return {
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
    };
  } catch (e) {
    console.warn('[Safety] Failed to read safety file:', e);
    return { reports: [], blocks: [] };
  }
}

function writeFile(state: SafetyFile) {
  try {
    ensureFile();
    fs.writeFileSync(SAFETY_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn('[Safety] Failed to write safety file:', e);
  }
}

async function readPg() {
  await ensureSafetyTables();
  const [repRes, blockRes] = await Promise.all([
    pool!.query(`SELECT id, reporter_id, reported_id, reason, details, status, created_at FROM reports ORDER BY created_at DESC`),
    pool!.query(`SELECT id, blocker_id, blocked_id, created_at FROM blocks ORDER BY created_at DESC`),
  ]);
  const reports: ReportRow[] = repRes.rows.map((r) => ({
    id: r.id,
    reporterId: r.reporter_id,
    reportedId: r.reported_id,
    reason: r.reason,
    details: r.details || undefined,
    status: (r.status || 'open') as ReportRow['status'],
    createdAt: r.created_at?.toISOString?.() || r.created_at,
  }));
  const blocks: BlockRow[] = blockRes.rows.map((r) => ({
    id: r.id,
    blockerId: r.blocker_id,
    blockedId: r.blocked_id,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
  }));
  return { reports, blocks };
}

async function loadAll(): Promise<SafetyFile> {
  if (hasPool) {
    try {
      return await readPg();
    } catch (e) {
      console.warn('[Safety] DB read failed, falling back to file:', e);
    }
  }
  return readFile();
}

function nowIso(): string {
  return new Date().toISOString();
}

// ------------------------------------------------------------------
// Reports
// ------------------------------------------------------------------
export async function createReport(
  reporterId: string,
  reportedId: string,
  reason: string,
  details?: string
): Promise<void> {
  if (!reporterId || !reportedId || reporterId === reportedId) return;

  const file = readFile();
  file.reports.unshift({
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    reporterId,
    reportedId,
    reason,
    details,
    status: 'open',
    createdAt: nowIso(),
  });
  writeFile(file);

  if (hasPool) {
    try {
      await ensureSafetyTables();
      await pool!.query(
        `INSERT INTO reports (reporter_id, reported_id, reason, details)
         VALUES ($1, $2, $3, $4)`,
        [reporterId, reportedId, reason, details || null]
      );
    } catch (e) {
      console.warn('[Safety] DB createReport failed, kept file fallback:', e);
    }
  }
}

// ------------------------------------------------------------------
// Blocks
// ------------------------------------------------------------------
export async function blockMember(blockerId: string, blockedId: string): Promise<void> {
  if (!blockerId || !blockedId || blockerId === blockedId) return;

  const file = readFile();
  if (!file.blocks.some((b) => b.blockerId === blockerId && b.blockedId === blockedId)) {
    file.blocks.unshift({
      id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      blockerId,
      blockedId,
      createdAt: nowIso(),
    });
  }
  writeFile(file);

  if (hasPool) {
    try {
      await ensureSafetyTables();
      await pool!.query(
        `INSERT INTO blocks (blocker_id, blocked_id)
         VALUES ($1, $2)
         ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
        [blockerId, blockedId]
      );
    } catch (e) {
      console.warn('[Safety] DB blockMember failed, kept file fallback:', e);
    }
  }
}

export async function unblockMember(blockerId: string, blockedId: string): Promise<void> {
  const file = readFile();
  file.blocks = file.blocks.filter((b) => !(b.blockerId === blockerId && b.blockedId === blockedId));
  writeFile(file);

  if (hasPool) {
    try {
      await ensureSafetyTables();
      await pool!.query(
        'DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2',
        [blockerId, blockedId]
      );
    } catch (e) {
      console.warn('[Safety] DB unblockMember failed, kept file fallback:', e);
    }
  }
}

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  if (!blockerId || !blockedId || blockerId === blockedId) return false;

  if (hasPool) {
    try {
      await ensureSafetyTables();
      const { rows } = await pool!.query(
        `SELECT 1 FROM blocks WHERE blocker_id = $1 AND blocked_id = $2 LIMIT 1`,
        [blockerId, blockedId]
      );
      if (rows.length > 0) return true;
    } catch (e) {
      console.warn('[Safety] DB isBlocked failed, checking file:', e);
    }
  }

  const file = readFile();
  return file.blocks.some((b) => b.blockerId === blockerId && b.blockedId === blockedId);
}

// Users that `userId` can no longer see/interact with: everyone they blocked
// plus everyone who blocked them (mutual invisibility).
export async function getInvisibleIds(userId: string): Promise<string[]> {
  if (!userId) return [];

  const { blocks } = await loadAll();
  const invisible = new Set<string>();
  for (const b of blocks) {
    if (b.blockerId === userId) invisible.add(b.blockedId);
    else if (b.blockedId === userId) invisible.add(b.blockerId);
  }
  return [...invisible];
}

export async function getBlockedIds(userId: string): Promise<string[]> {
  if (!userId) return [];

  if (hasPool) {
    try {
      await ensureSafetyTables();
      const { rows } = await pool!.query(
        `SELECT blocked_id FROM blocks WHERE blocker_id = $1`,
        [userId]
      );
      return rows.map((r) => r.blocked_id) as string[];
    } catch (e) {
      console.warn('[Safety] DB getBlockedIds failed, falling back to file:', e);
    }
  }

  const file = readFile();
  return file.blocks.filter((b) => b.blockerId === userId).map((b) => b.blockedId);
}

// ------------------------------------------------------------------
// Admin / moderation
// ------------------------------------------------------------------
export async function listReports(filter?: 'open' | 'all'): Promise<ReportRow[]> {
  const { reports } = await loadAll();
  if (filter === 'open') return reports.filter((r) => r.status === 'open');
  return reports;
}

export async function reviewReport(reportId: string, action: 'resolve' | 'dismiss'): Promise<ReportRow | null> {
  const { reports, blocks } = await loadAll();
  const target = reports.find((r) => r.id === reportId);
  if (!target) return null;

  target.status = action === 'resolve' ? 'resolved' : 'dismissed';
  writeFile({ reports, blocks });

  if (hasPool) {
    try {
      await ensureSafetyTables();
      await pool!.query(
        `UPDATE reports SET status = $2 WHERE id = $1`,
        [reportId, target.status]
      );
    } catch (e) {
      console.warn('[Safety] DB reviewReport failed, kept file fallback:', e);
    }
  }

  return target;
}
