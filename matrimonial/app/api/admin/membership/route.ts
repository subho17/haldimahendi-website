import { NextResponse } from 'next/server';
import { checkAdminKey } from '@/lib/adminAuth';
import { upgradeMembership, MEMBERSHIP_PLANS } from '@/lib/membershipStore';

// POST /api/admin/membership  (admin, x-admin-key)
// Body: { userId, planId }  -> grant or revoke membership on any account.
export async function POST(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const userId = String(body.userId || '').trim();
    const planId = String(body.planId || '').trim();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }
    if (!MEMBERSHIP_PLANS.some((p) => p.id === planId)) {
      return NextResponse.json({ success: false, message: 'Invalid planId' }, { status: 400 });
    }

    const result = await upgradeMembership(userId, planId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, membership: result.membership });
  } catch (e) {
    console.error('Error updating membership:', e);
    return NextResponse.json({ success: false, message: 'Failed to update membership' }, { status: 500 });
  }
}
