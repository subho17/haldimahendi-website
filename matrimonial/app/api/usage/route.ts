import { NextResponse } from 'next/server';
import { getUsageSummary } from '@/lib/usageStore';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/usage?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

    const summary = await getUsageSummary(userId);
    return NextResponse.json({ success: true, usage: summary });
  } catch (e) {
    console.error('Error fetching usage:', e);
    return NextResponse.json({ success: false, message: 'Failed to fetch usage' }, { status: 500 });
  }
}
