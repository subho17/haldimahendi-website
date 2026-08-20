import { NextResponse } from 'next/server';
import { checkAdminKey } from '@/lib/adminAuth';
import { getAnalytics } from '@/lib/adminStore';

// GET /api/admin/analytics  (admin, x-admin-key)
export async function GET(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const analytics = await getAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (e) {
    console.error('Error loading analytics:', e);
    return NextResponse.json({ success: false, message: 'Failed to load analytics' }, { status: 500 });
  }
}