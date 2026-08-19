import { NextResponse } from 'next/server';
import {
  listNotifications,
  unreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/notificationStore';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/notifications?userId=... -> { notifications, unread }
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

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
    const userId = normalizeId(body.userId);
    const action = String(body.action || '').trim();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }
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
