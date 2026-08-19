import { NextResponse } from 'next/server';
import { checkAdminKey } from '@/lib/adminAuth';
import { listVerifications, reviewVerification } from '@/lib/verifyStore';

// GET /api/verification/review  (admin, x-admin-key)
// Lists verification submissions (pending first).
export async function GET(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const rows = await listVerifications('pending');
    return NextResponse.json({ success: true, verifications: rows });
  } catch (e) {
    console.error('Error listing verifications:', e);
    return NextResponse.json({ success: false, message: 'Failed to list verifications' }, { status: 500 });
  }
}

// POST /api/verification/review  (admin, x-admin-key)
// Body: { submissionId, action: 'approve' | 'reject' }
export async function POST(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const submissionId = String(body.submissionId || '').trim();
    const action = String(body.action || '').trim();

    if (!submissionId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const updated = await reviewVerification(submissionId, action as 'approve' | 'reject');
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch (e) {
    console.error('Error reviewing verification:', e);
    return NextResponse.json({ success: false, message: 'Failed to review verification' }, { status: 500 });
  }
}