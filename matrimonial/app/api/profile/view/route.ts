import { NextResponse } from 'next/server';
import { recordProfileView, getUsageSummary } from '@/lib/usageStore';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/profile/view?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

    const summary = await getUsageSummary(userId);
    const views = summary.profileViews.total ?? summary.profileViews.used ?? 0;
    const viewsToday = summary.profileViews.used ?? 0;

    return NextResponse.json({
      success: true,
      views,
      viewsToday,
    });
  } catch (e) {
    console.error('Error fetching profile views:', e);
    return NextResponse.json({ success: false, message: 'Failed to fetch views' }, { status: 500 });
  }
}

// POST /api/profile/view
// Body: { viewerId, viewedId }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const viewerId = normalizeId(body.viewerId);
    const viewedId = normalizeId(body.viewedId);

    if (!viewerId) {
      return NextResponse.json({ success: false, message: 'Missing viewerId' }, { status: 400 });
    }

    // Do not count viewing own profile
    if (viewedId && viewedId.toLowerCase() === viewerId.toLowerCase()) {
      const summary = await getUsageSummary(viewerId);
      return NextResponse.json({
        success: true,
        views: summary.profileViews.total ?? 0,
        isSelf: true,
      });
    }

    const newTotal = await recordProfileView(viewerId);
    return NextResponse.json({
      success: true,
      views: newTotal,
    });
  } catch (e) {
    console.error('Error recording profile view:', e);
    return NextResponse.json({ success: false, message: 'Failed to record view' }, { status: 500 });
  }
}
