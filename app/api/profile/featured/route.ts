import { NextRequest, NextResponse } from 'next/server';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    if (hasPool) {
      try {
        await pool!.query(`CREATE TABLE IF NOT EXISTS featured_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL UNIQUE,
          featured_until TIMESTAMPTZ NOT NULL,
          set_by_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
      } catch (e) {
        console.warn('[Featured] Table creation failed:', e);
      }

      try {
        const { rows } = await pool!.query(
          `SELECT featured_until, set_by_admin FROM featured_profiles WHERE user_id = $1 AND featured_until > now()`,
          [userId]
        );
        const active = rows[0] || null;
        return NextResponse.json({ success: true, featured: active });
      } catch (e) {
        console.warn('[Featured] DB query failed:', e);
      }
    }

    return NextResponse.json({ success: true, featured: null });
  } catch (e) {
    console.error('Error fetching featured status:', e);
    return NextResponse.json({ success: false, message: 'Failed to fetch featured status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = normalizeId(body.userId);
    const days = body.days || 30;
    const adminKey = req.headers.get('x-admin-key');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    // Admin-only endpoint for setting featured profiles
    if (adminKey) {
      const expectedKey = process.env.ADMIN_KEY || 'haldimehendi-admin-dev';
      if (adminKey !== expectedKey) {
        return NextResponse.json({ success: false, message: 'Invalid admin key' }, { status: 401 });
      }
    } else {
      // User can only purchase featured for themselves, limited duration
      if (days > 30) {
        return NextResponse.json({ success: false, message: 'Max duration is 30 days' }, { status: 400 });
      }
    }

    const featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    if (hasPool) {
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
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id) DO UPDATE SET
             featured_until = EXCLUDED.featured_until,
             set_by_admin = EXCLUDED.set_by_admin`,
          [userId, featuredUntil, !!adminKey]
        );

        await pool!.query(
          `UPDATE profiles SET featured_profile = TRUE, featured_profile_until = $2, updated_at = now()
           WHERE user_id = $1 OR mobile_number = $1`,
          [userId, featuredUntil]
        );
      } catch (e) {
        console.warn('[Featured] DB insert failed:', e);
        return NextResponse.json({ success: false, message: 'Failed to set featured profile' }, { status: 500 });
      }
    }

    // Update scratch file
    const fs = require('fs');
    const path = require('path');
    const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
        const idx = users.findIndex((u: any) =>
          u.profileId === userId || u.mobileNumber === userId || u.mobile_number === userId || u.email === userId
        );
        if (idx >= 0) {
          users[idx].featured_profile = true;
          users[idx].featured_profile_until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
          users[idx].updatedAt = new Date().toISOString();
          fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }
      }
    } catch (e) {
      console.warn('[Featured] Scratch update failed:', e);
    }

    return NextResponse.json({ success: true, featuredUntil: featuredUntil });
  } catch (e) {
    console.error('Error setting featured profile:', e);
    return NextResponse.json({ success: false, message: 'Failed to set featured profile' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    if (hasPool) {
      try {
        await pool!.query(`DELETE FROM featured_profiles WHERE user_id = $1`, [userId]);
        await pool!.query(
          `UPDATE profiles SET featured_profile = FALSE, featured_profile_until = NULL WHERE user_id = $1 OR mobile_number = $1`,
          [userId]
        );
      } catch (e) {
        console.warn('[Featured] Delete failed:', e);
        return NextResponse.json({ success: false, message: 'Failed to remove featured profile' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error removing featured profile:', e);
    return NextResponse.json({ success: false, message: 'Failed to remove featured profile' }, { status: 500 });
  }
}