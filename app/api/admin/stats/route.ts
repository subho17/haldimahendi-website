import { NextResponse } from 'next/server';
import { checkAdminKey } from '@/lib/adminAuth';
import { getAdminStats } from '@/lib/adminStore';

export async function GET(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const stats = await getAdminStats();
    return NextResponse.json({ success: true, stats });
  } catch (e) {
    console.error('Error loading admin stats:', e);
    return NextResponse.json({ success: false, message: 'Failed to load stats' }, { status: 500 });
  }
}