import { NextResponse } from 'next/server';
import { checkAdminKey } from '@/lib/adminAuth';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

async function getFeaturedProfiles(page: number, limit: number, offset: number) {
  if (!hasPool) return { featured: [], total: 0 };
  
  await pool!.query(`CREATE TABLE IF NOT EXISTS featured_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    featured_until TIMESTAMPTZ NOT NULL,
    set_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);

  const [{ rows: totalRows }, { rows: featuredRows }] = await Promise.all([
    pool!.query(`SELECT COUNT(*) as count FROM featured_profiles WHERE featured_until > now()`),
    pool!.query(
      `SELECT fp.*, p.display_name, p.avatar_url, p.mobile_number, p.city
       FROM featured_profiles fp
       JOIN profiles p ON p.user_id = fp.user_id
       WHERE fp.featured_until > now()
       ORDER BY fp.featured_until DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
  ]);

  return {
    featured: featuredRows,
    total: parseInt(totalRows[0].count, 10),
  };
}

async function setFeaturedProfile(userId: string, days: number) {
  if (!hasPool) return { success: false, message: 'Database not available' };
  
  const featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  
  try {
    await pool!.query(`CREATE TABLE IF NOT EXISTS featured_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL UNIQUE,
      featured_until TIMESTAMPTZ NOT NULL,
      set_by_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    await pool!.query(
      `INSERT INTO featured_profiles (user_id, featured_until, set_by_admin)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (user_id) DO UPDATE SET
         featured_until = EXCLUDED.featured_until,
         set_by_admin = TRUE`,
      [userId, featuredUntil]
    );

    await pool!.query(
      `UPDATE profiles SET featured_profile = TRUE, featured_profile_until = $2, updated_at = now()
       WHERE user_id = $1 OR mobile_number = $1`,
      [userId, featuredUntil]
    );
  } catch (e) {
    console.warn('[Admin Featured] DB insert failed:', e);
    throw e;
  }
}

async function deleteFeaturedProfile(userId: string) {
  if (!hasPool) return;
  
  try {
    await pool!.query(`DELETE FROM featured_profiles WHERE user_id = $1`, [userId]);
    await pool!.query(
      `UPDATE profiles SET featured_profile = FALSE, featured_profile_until = NULL WHERE user_id = $1 OR mobile_number = $1`,
      [userId]
    );
  } catch (e) {
    console.warn('[Admin Featured] Delete failed:', e);
    throw e;
  }
}

async function updateScratchFeatured(userId: string, days: number, isAdding: boolean) {
  const fs = require('fs');
  const path = require('path');
  const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');
  
  try {
    if (!fs.existsSync(USERS_FILE)) return;
    
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
    const idx = users.findIndex((u: any) =>
      u.profileId === userId || u.mobileNumber === userId || u.mobile_number === userId || u.email === userId
    );
    
    if (idx >= 0) {
      if (isAdding) {
        users[idx].featured_profile = true;
        users[idx].featured_profile_until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      } else {
        users[idx].featured_profile = false;
        users[idx].featured_profile_until = null;
      }
      users[idx].updatedAt = new Date().toISOString();
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }
  } catch (e) {
    console.warn('[Admin Featured] Scratch update failed:', e);
  }
}

export async function GET(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const result = await getFeaturedProfiles(page, limit, offset);
    return NextResponse.json({ success: true, ...result, page, limit });
  } catch (e) {
    console.error('Error loading featured profiles:', e);
    return NextResponse.json({ success: false, message: 'Failed to load featured profiles' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = normalizeId(body.userId);
    const days = body.days || 30;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }
    if (days > 365) {
      return NextResponse.json({ success: false, message: 'Max duration is 365 days' }, { status: 400 });
    }

    await setFeaturedProfile(userId, days);
    await updateScratchFeatured(userId, days, true);

    const featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    return NextResponse.json({ success: true, featuredUntil: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() });
  } catch (e) {
    console.error('Error setting featured profile:', e);
    return NextResponse.json({ success: false, message: 'Failed to set featured profile' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    await deleteFeaturedProfile(userId);
    await updateScratchFeatured(userId, 0, false);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error removing featured profile:', e);
    return NextResponse.json({ success: false, message: 'Failed to remove featured profile' }, { status: 500 });
  }
}