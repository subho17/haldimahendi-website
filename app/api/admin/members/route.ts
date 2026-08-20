import { NextResponse } from 'next/server';
import { checkAdminKey } from '@/lib/adminAuth';
import { listMembers, setSuspension } from '@/lib/adminStore';
import { blockMember, unblockMember } from '@/lib/reportStore';

// GET /api/admin/members  (admin, x-admin-key)
// ?q=...  -> search by name / id / mobile / email / city
export async function GET(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const members = await listMembers(q);
    return NextResponse.json({ success: true, members });
  } catch (e) {
    console.error('Error listing members:', e);
    return NextResponse.json({ success: false, message: 'Failed to list members' }, { status: 500 });
  }
}

// POST /api/admin/members
// Body: { action: 'suspend' | 'activate' | 'block' | 'unblock', userId, targetId? }
// suspend/activate -> userId is the member being suspended.
// block/unblock     -> block/unblock targetId on behalf of userId.
export async function POST(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const action = String(body.action || '').trim();
    const userId = String(body.userId || '').trim();
    const targetId = String(body.targetId || '').trim();

    if (!['suspend', 'activate', 'block', 'unblock'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    if (action === 'suspend' || action === 'activate') {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }
      await setSuspension(userId, action === 'suspend');
      return NextResponse.json({ success: true, action, userId });
    }

    if (!userId || !targetId || userId === targetId) {
      return NextResponse.json({ success: false, message: 'Invalid userId or targetId' }, { status: 400 });
    }
    if (action === 'block') await blockMember(userId, targetId);
    else await unblockMember(userId, targetId);
    return NextResponse.json({ success: true, action, userId, targetId });
  } catch (e) {
    console.error('Error handling member action:', e);
    return NextResponse.json({ success: false, message: 'Failed to process action' }, { status: 500 });
  }
}