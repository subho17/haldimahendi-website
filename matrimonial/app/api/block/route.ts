import { NextResponse } from 'next/server';
import { blockMember, unblockMember, getBlockedIds } from '@/lib/reportStore';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/block?userId=... -> { blockedIds }
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }
    const blockedIds = await getBlockedIds(userId);
    return NextResponse.json({ success: true, blockedIds });
  } catch (e) {
    console.error('Error loading blocked members:', e);
    return NextResponse.json({ success: false, message: 'Failed to load blocked members' }, { status: 500 });
  }
}

// POST /api/block
// Body: { actorId, otherId, action: 'block' | 'unblock' }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const actorId = normalizeId(body.actorId);
    const otherId = normalizeId(body.otherId);
    const action = String(body.action || '').trim();

    if (!actorId || !otherId) {
      return NextResponse.json({ success: false, message: 'Missing actorId or otherId' }, { status: 400 });
    }
    if (actorId === otherId) {
      return NextResponse.json({ success: false, message: 'You cannot block yourself' }, { status: 400 });
    }
    if (!['block', 'unblock'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    if (action === 'block') {
      await blockMember(actorId, otherId);
    } else {
      await unblockMember(actorId, otherId);
    }

    const blockedIds = await getBlockedIds(actorId);
    return NextResponse.json({ success: true, action, blockedIds });
  } catch (e) {
    console.error('Error handling block action:', e);
    return NextResponse.json({ success: false, message: 'Failed to process action' }, { status: 500 });
  }
}
