import { NextResponse } from 'next/server';
import { touchActivity } from '@/lib/adminStore';

// POST /api/activity  Body: { userId }
// Lightweight heartbeat used by authenticated clients to mark a member active.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId || '').trim();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }
    await touchActivity(userId);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error recording activity:', e);
    return NextResponse.json({ success: false, message: 'Failed to record activity' }, { status: 500 });
  }
}
