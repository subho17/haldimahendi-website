import { NextResponse } from 'next/server';
import { checkAdminKey } from '@/lib/adminAuth';
import { listReports, reviewReport } from '@/lib/reportStore';

// GET /api/admin/reports  (admin, x-admin-key)
// Lists reports (open first).
export async function GET(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const rows = await listReports('all');
    const open = rows.filter((r) => r.status === 'open');
    const rest = rows.filter((r) => r.status !== 'open');
    return NextResponse.json({ success: true, reports: [...open, ...rest] });
  } catch (e) {
    console.error('Error listing reports:', e);
    return NextResponse.json({ success: false, message: 'Failed to list reports' }, { status: 500 });
  }
}

// POST /api/admin/reports  (admin, x-admin-key)
// Body: { reportId, action: 'resolve' | 'dismiss' }
export async function POST(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const reportId = String(body.reportId || '').trim();
    const action = String(body.action || '').trim();

    if (!reportId || !['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const updated = await reviewReport(reportId, action as 'resolve' | 'dismiss');
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (e) {
    console.error('Error reviewing report:', e);
    return NextResponse.json({ success: false, message: 'Failed to review report' }, { status: 500 });
  }
}