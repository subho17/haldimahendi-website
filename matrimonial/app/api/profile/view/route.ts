import { NextResponse } from 'next/server';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
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

    let dbViews = 0;
    let thisWeekViews = 0;

    if (hasPool) {
      try {
        await ensureProfilesTable();
        // Check profile views on user's profile
        const profRes = await pool!.query(
          `SELECT COALESCE(profile_views, 0) AS pv FROM profiles WHERE user_id = $1 OR id::text = $1 OR mobile_number = $1 LIMIT 1`,
          [userId]
        );
        const colViews = profRes.rows.length > 0 ? Number(profRes.rows[0].pv || 0) : 0;

        // Check view events in profile_views table
        const resEvents = await pool!.query(
          `SELECT 
             COUNT(*) FILTER (WHERE viewed_profile_id = $1) AS views_received,
             COUNT(*) FILTER (WHERE viewer_id = $1) AS views_made,
             COUNT(*) FILTER (WHERE (viewed_profile_id = $1 OR viewer_id = $1) AND created_at >= NOW() - INTERVAL '7 days') AS this_week
           FROM profile_views 
           WHERE viewed_profile_id = $1 OR viewer_id = $1`,
          [userId]
        );

        const row = resEvents.rows[0];
        const viewsReceived = Number(row?.views_received || 0);
        const viewsMade = Number(row?.views_made || 0);
        thisWeekViews = Number(row?.this_week || 0);

        dbViews = Math.max(colViews, viewsReceived, viewsMade);
      } catch (err) {
        console.warn('Error querying postgres profile views:', err);
      }
    }

    const summary = await getUsageSummary(userId);
    const usageViews = summary.profileViews.total ?? summary.profileViews.used ?? 0;
    const finalViews = Math.max(dbViews, usageViews);

    return NextResponse.json({
      success: true,
      views: finalViews,
      thisWeek: thisWeekViews || finalViews,
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
      return NextResponse.json({
        success: true,
        isSelf: true,
      });
    }

    // Record in local usage store
    const newTotal = await recordProfileView(viewerId);

    // Record in Postgres if available
    if (hasPool) {
      try {
        await ensureProfilesTable();
        if (viewedId) {
          await pool!.query(
            `INSERT INTO profile_views (viewer_id, viewed_profile_id) VALUES ($1, $2)`,
            [viewerId, viewedId]
          );
          await pool!.query(
            `UPDATE profiles SET profile_views = COALESCE(profile_views, 0) + 1 WHERE user_id = $1 OR id::text = $1`,
            [viewedId]
          );
        } else {
          await pool!.query(
            `INSERT INTO profile_views (viewer_id, viewed_profile_id) VALUES ($1, 'unknown')`,
            [viewerId]
          );
        }
      } catch (err) {
        console.warn('Error recording view in postgres:', err);
      }
    }

    return NextResponse.json({
      success: true,
      views: newTotal,
    });
  } catch (e) {
    console.error('Error recording profile view:', e);
    return NextResponse.json({ success: false, message: 'Failed to record view' }, { status: 500 });
  }
}
