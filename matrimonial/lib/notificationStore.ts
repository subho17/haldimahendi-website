// Notifications persistence — Postgres (Supabase) first, with a scratch/
// JSON file fallback when DATABASE_URL is unset, mirroring the pattern used
// across this app.
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureNotificationsTable } from '@/lib/db';

const NOTIFICATIONS_FILE = path.join(process.cwd(), 'scratch', 'notifications_db.json');

export type NotificationType = 'interest' | 'accept' | 'message' | 'system';

export interface NotificationRow {
  id: string;
  userId: string;
  actorId?: string;
  type: NotificationType;
  title?: string;
  message: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

interface NotificationsFile {
  notifications: NotificationRow[];
}

function ensureFile() {
  const dir = path.dirname(NOTIFICATIONS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(NOTIFICATIONS_FILE)) {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify({ notifications: [] }, null, 2));
  }
}

function readFile(): NotificationsFile {
  try {
    ensureFile();
    const parsed = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') || '{}');
    return {
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
    };
  } catch (e) {
    console.warn('[Notifications] Failed to read notifications file:', e);
    return { notifications: [] };
  }
}

function writeFile(state: NotificationsFile) {
  try {
    ensureFile();
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn('[Notifications] Failed to write notifications file:', e);
  }
}

async function readPg(userId: string) {
  await ensureNotificationsTable();
  const { rows } = await pool!.query(
    `SELECT id, user_id, actor_id, type, title, message, data, read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId]
  );
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    actorId: r.actor_id || undefined,
    type: (r.type || 'system') as NotificationType,
    title: r.title || undefined,
    message: r.message,
    data: r.data || undefined,
    read: !!r.read,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
  }));
}

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  opts?: { actorId?: string; title?: string; data?: Record<string, string> }
): Promise<void> {
  const cleanUserId = normalizeId(userId);
  if (!cleanUserId) return;

  const now = new Date().toISOString();
  const record: NotificationRow = {
    id: `nt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: cleanUserId,
    actorId: opts?.actorId,
    type,
    title: opts?.title,
    message,
    data: opts?.data,
    read: false,
    createdAt: now,
  };

  const file = readFile();
  file.notifications.unshift(record);
  // Cap stored notifications to avoid unbounded file growth.
  file.notifications = file.notifications.slice(0, 200);
  writeFile(file);

  if (hasPool) {
    try {
      await ensureNotificationsTable();
      await pool!.query(
        `INSERT INTO notifications (user_id, actor_id, type, title, message, data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cleanUserId, opts?.actorId || null, type, opts?.title || null, message, opts?.data ? JSON.stringify(opts.data) : null]
      );
    } catch (e) {
      console.warn('[Notifications] DB createNotification failed, kept file fallback:', e);
    }
  }
}

export async function listNotifications(userId: string): Promise<NotificationRow[]> {
  const cleanUserId = normalizeId(userId);
  if (!cleanUserId) return [];

  if (hasPool) {
    try {
      return await readPg(cleanUserId);
    } catch (e) {
      console.warn('[Notifications] DB read failed, falling back to file:', e);
    }
  }

  const file = readFile();
  return file.notifications.filter((n) => n.userId === cleanUserId).slice(0, 100);
}

export async function unreadCount(userId: string): Promise<number> {
  const cleanUserId = normalizeId(userId);
  if (!cleanUserId) return 0;

  if (hasPool) {
    try {
      await ensureNotificationsTable();
      const { rows } = await pool!.query(
        `SELECT count(*)::int AS "count" FROM notifications WHERE user_id = $1 AND read = false`,
        [cleanUserId]
      );
      return Number(rows[0]?.count || 0);
    } catch (e) {
      console.warn('[Notifications] DB unreadCount failed, falling back to file:', e);
    }
  }

  const file = readFile();
  return file.notifications.filter((n) => n.userId === cleanUserId && !n.read).length;
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const cleanUserId = normalizeId(userId);
  if (!cleanUserId) return;

  const file = readFile();
  const hit = file.notifications.find((n) => n.id === notificationId && n.userId === cleanUserId);
  if (hit) hit.read = true;
  writeFile(file);

  if (hasPool) {
    try {
      await ensureNotificationsTable();
      await pool!.query(
        `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
        [notificationId, cleanUserId]
      );
    } catch (e) {
      console.warn('[Notifications] DB markNotificationRead failed, kept file fallback:', e);
    }
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const cleanUserId = normalizeId(userId);
  if (!cleanUserId) return;

  const file = readFile();
  file.notifications.forEach((n) => {
    if (n.userId === cleanUserId) n.read = true;
  });
  writeFile(file);

  if (hasPool) {
    try {
      await ensureNotificationsTable();
      await pool!.query(
        `UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`,
        [cleanUserId]
      );
    } catch (e) {
      console.warn('[Notifications] DB markAllNotificationsRead failed, kept file fallback:', e);
    }
  }
}

// Convenience: build an in-app notification for an interest event.
export async function notifyInterestEvent(params: {
  actorId: string;
  actorName: string;
  recipientId: string;
  action: 'interest' | 'accept';
}): Promise<void> {
  const { actorId, actorName, recipientId, action } = params;
  if (!actorId || !recipientId || actorId === recipientId) return;

  if (action === 'interest') {
    await createNotification(recipientId, 'interest', `${actorName} sent you an interest.`, {
      actorId,
      title: 'New Interest',
      data: { profileId: actorId },
    });
  } else {
    await createNotification(recipientId, 'accept', `${actorName} accepted your interest. You can now chat!`, {
      actorId,
      title: 'Interest Accepted',
      data: { profileId: actorId },
    });
  }
}
