import { NextResponse } from 'next/server';
import { createReport } from '@/lib/reportStore';

const REASONS = [
  'fake_profile',
  'harassment',
  'inappropriate_content',
  'fraud_or_scam',
  'other',
];

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// POST /api/report
// Body: { actorId, otherId, reason, details? }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const actorId = normalizeId(body.actorId);
    const otherId = normalizeId(body.otherId);
    const reason = normalizeId(body.reason);
    const details = typeof body.details === 'string' ? body.details.trim().slice(0, 2000) : undefined;

    if (!actorId || !otherId) {
      return NextResponse.json({ success: false, message: 'Missing actorId or otherId' }, { status: 400 });
    }
    if (actorId === otherId) {
      return NextResponse.json({ success: false, message: 'You cannot report yourself' }, { status: 400 });
    }
    if (!REASONS.includes(reason)) {
      return NextResponse.json({ success: false, message: 'Please select a valid reason' }, { status: 400 });
    }

    await createReport(actorId, otherId, reason, details);
    return NextResponse.json({ success: true, message: 'Report submitted. Our moderation team will review it.' });
  } catch (e) {
    console.error('Error creating report:', e);
    return NextResponse.json({ success: false, message: 'Failed to submit report' }, { status: 500 });
  }
}
