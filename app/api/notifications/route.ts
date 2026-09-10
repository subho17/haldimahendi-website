import { NextResponse } from 'next/server';
import {
  listNotifications,
  unreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/notificationStore';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import fs from 'fs';
import path from 'path';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// Try to resolve mobile number/email to profileId
async function resolveProfileId(identifier: string): Promise<string> {
  const clean = normalizeId(identifier);
  if (!clean) return clean;
  
  // If it looks like a profileId (starts with SH), return as-is
  if (clean.startsWith('SH')) return clean;
  
  // If it's a mobile number (10 digits), try to find profileId
  if (/^\d{10}$/.test(clean)) {
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(
          `SELECT user_id FROM profiles WHERE mobile_number = $1 LIMIT 1`,
          [clean]
        );
        if (rows.length > 0) return rows[0].user_id;
      } catch (e) {
        console.warn('[Notifications] Failed to resolve mobile to profileId:', e);
      }
    }
    // Fallback: check scratch file
    try {
      const usersFile = path.join(process.cwd(), 'scratch', 'users_db.json');
      if (fs.existsSync(usersFile)) {
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
        const hit = users.find((u: { profileId?: string; mobileNumber?: string; mobile_number?: string }) => 
          (u.mobileNumber || u.mobile_number) === clean
        );
        if (hit) return hit.profileId || clean;
      }
    } catch (e) {
      console.warn('[Notifications] Failed to resolve mobile from scratch:', e);
    }
  }
  
  // If email, try to find profileId
  if (clean.includes('@') && hasPool) {
    try {
      await ensureProfilesTable();
      const { rows } = await pool!.query(
        `SELECT user_id FROM profiles WHERE email = $1 LIMIT 1`,
        [clean]
      );
      if (rows.length > 0) return rows[0].user_id;
    } catch (e) {
      console.warn('[Notifications] Failed to resolve email to profileId:', e);
    }
  }
  
  return clean;
}

// GET /api/notifications?userId=... -> { notifications, unread }
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUserId = normalizeId(searchParams.get('userId'));
    if (!rawUserId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }
    
    const userId = await resolveProfileId(rawUserId);
    
    const [notifications, unread] = await Promise.all([
      listNotifications(userId),
      unreadCount(userId),
    ]);
    return NextResponse.json({ success: true, notifications, unread });
  } catch (e) {
    console.error('Error loading notifications:', e);
    return NextResponse.json({ success: false, message: 'Failed to load notifications' }, { status: 500 });
  }
}

// POST /api/notifications
// Body: { userId, action: 'read' | 'readAll', notificationId? }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawUserId = normalizeId(body.userId);
    if (!rawUserId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }
    
    const userId = await resolveProfileId(rawUserId);
    const action = String(body.action || '').trim();

    if (!['read', 'readAll'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    if (action === 'read') {
      await markNotificationRead(userId, normalizeId(body.notificationId));
    } else {
      await markAllNotificationsRead(userId);
    }

    const unread = await unreadCount(userId);
    return NextResponse.json({ success: true, unread });
  } catch (e) {
    console.error('Error handling notification action:', e);
    return NextResponse.json({ success: false, message: 'Failed to process action' }, { status: 500 });
  }
}
