import { NextResponse } from 'next/server';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

const BOOST_CONFIG: Record<string, { days: number; label: string; price: number }> = {
  '24h': { days: 1, label: '24 Hours', price: 99 },
  '3d': { days: 3, label: '3 Days', price: 299 },
  '7d': { days: 7, label: '7 Days', price: 599 },
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    if (hasPool) {
      try {
        await pool!.query(`CREATE TABLE IF NOT EXISTS profile_boosts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          boost_type TEXT NOT NULL CHECK (boost_type IN ('24h', '3d', '7d')),
          expires_at TIMESTAMPTZ NOT NULL,
          purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          is_active BOOLEAN DEFAULT TRUE
        )`);
      } catch (e) {
        console.warn('[Boost] Table creation failed:', e);
      }

      try {
        const { rows } = await pool!.query(
          `SELECT boost_type, expires_at, is_active FROM profile_boosts WHERE user_id = $1 AND is_active = TRUE AND expires_at > now()`,
          [userId]
        );
        const activeBoost = rows[0] || null;
        return NextResponse.json({ success: true, activeBoost });
      } catch (e) {
        console.warn('[Boost] DB query failed:', e);
      }
    }

    return NextResponse.json({ success: true, activeBoost: null });
  } catch (e) {
    console.error('Error fetching boost:', e);
    return NextResponse.json({ success: false, message: 'Failed to fetch boost' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = normalizeId(body.userId);
    const boostType = body.boostType; // '24h' | '3d' | '7d'

    if (!userId || !boostType) {
      return NextResponse.json({ success: false, message: 'Missing userId or boostType' }, { status: 400 });
    }
    if (!BOOST_CONFIG[boostType]) {
      return NextResponse.json({ success: false, message: 'Invalid boost type' }, { status: 400 });
    }

    const config = BOOST_CONFIG[boostType];
    const expiresAt = new Date(Date.now() + config.days * 24 * 60 * 60 * 1000).toISOString();

    if (hasPool) {
      try {
        await pool!.query(`CREATE TABLE IF NOT EXISTS profile_boosts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          boost_type TEXT NOT NULL CHECK (boost_type IN ('24h', '3d', '7d')),
          expires_at TIMESTAMPTZ NOT NULL,
          purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          is_active BOOLEAN DEFAULT TRUE
        )`);

        await pool!.query(
          `INSERT INTO profile_boosts (user_id, boost_type, expires_at, purchased_at, is_active)
           VALUES ($1, $2, $3, now(), TRUE)
           ON CONFLICT (user_id) DO UPDATE SET
             boost_type = EXCLUDED.boost_type,
             expires_at = EXCLUDED.expires_at,
             purchased_at = EXCLUDED.purchased_at,
             is_active = TRUE`,
          [userId, boostType, expiresAt]
        );
      } catch (e) {
        console.warn('[Boost] DB insert failed:', e);
      }
    }

    // Update profiles table
    if (hasPool) {
      try {
        await pool!.query(
          `UPDATE profiles SET profile_boost_type = $2, profile_boost_expires_at = $3, updated_at = now()
           WHERE user_id = $1 OR mobile_number = $1`,
          [normalizeId(userId), boostType, expiresAt]
        );
      } catch (e) {
        console.warn('[Boost] Profile update failed:', e);
      }
    }

    return NextResponse.json({ success: true, expiresAt, boostType, config });
  } catch (e) {
    console.error('Error creating boost:', e);
    return NextResponse.json({ success: false, message: 'Failed to create boost' }, { status: 500 });
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
        await pool!.query(`UPDATE profile_boosts SET is_active = FALSE WHERE user_id = $1`, [userId]);
        await pool!.query(
          `UPDATE profiles SET profile_boost_type = NULL, profile_boost_expires_at = NULL WHERE user_id = $1 OR mobile_number = $1`,
          [userId]
        );
      } catch (e) {
        console.warn('[Boost] Deactivate failed:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error deactivating boost:', e);
    return NextResponse.json({ success: false, message: 'Failed to deactivate boost' }, { status: 500 });
  }
}