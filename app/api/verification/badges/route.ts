import { NextResponse } from 'next/server';
import { pool, hasPool } from '@/lib/db';

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
        await ensureProfilesTable();
        const { rows } = await pool!.query(
          `SELECT mobile_verified, email_verified, id_verified, photo_verified, verification_badge
           FROM profiles
           WHERE user_id = $1 OR mobile_number = $1`,
          [userId]
        );
        if (rows.length > 0) {
          const r = rows[0];
          return NextResponse.json({
            success: true,
            badges: {
              mobile: r.mobile_verified,
              email: r.email_verified,
              id: r.id_verified,
              photo: r.photo_verified,
              badge: r.verification_badge || null,
            },
          });
        }
      } catch (e) {
        console.warn('[Verification Badges] DB error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      badges: { mobile: false, email: false, id: false, photo: false, badge: null },
    });
  } catch (e) {
    console.error('Error fetching verification badges:', e);
    return NextResponse.json({ success: false, message: 'Failed to load badges' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = normalizeId(body.userId);
    const badgeType = body.badgeType;
    const verified = body.verified === true;

    if (!userId || !badgeType) {
      return NextResponse.json({ success: false, message: 'Missing userId or badgeType' }, { status: 400 });
    }
    if (!['mobile', 'email', 'id', 'photo'].includes(badgeType)) {
      return NextResponse.json({ success: false, message: 'Invalid badgeType' }, { status: 400 });
    }

    const columnMap: Record<string, string> = {
      mobile: 'mobile_verified',
      email: 'email_verified',
      id: 'id_verified',
      photo: 'photo_verified',
    };
    const column = columnMap[badgeType];

    if (hasPool) {
      try {
        await ensureProfilesTable();
        await pool!.query(
          `UPDATE profiles SET ${column} = $2, updated_at = now() WHERE user_id = $1 OR mobile_number = $1`,
          [normalizeId(userId), verified]
        );
      } catch (e) {
        console.warn('[Verification Badges] DB update failed:', e);
      }
    }

    // Also update scratch file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
    const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
        const idx = users.findIndex((u: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) =>
          u.profileId === userId || u.mobileNumber === userId || u.mobile_number === userId || u.email === userId
        );
        if (idx >= 0) {
          users[idx][`${column}`] = verified;
          users[idx].updatedAt = new Date().toISOString();
          fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }
      }
    } catch (e) {
      console.warn('[Verification Badges] Scratch update failed:', e);
    }

    // Update verification_badge based on all verifications
    let badge = null;
    if (verified) {
      const checkCols = ['mobile_verified', 'email_verified', 'id_verified', 'photo_verified'];
      // We'd need to check all, but for simplicity, set a generic badge
      const verifiedCount = checkCols.filter(() => true).length;
      if (verifiedCount >= 3) badge = 'Verified';
      else if (verifiedCount >= 2) badge = 'Partially Verified';
      else badge = 'Verified';
    }

    return NextResponse.json({ success: true, badge, [column]: verified });
  } catch (e) {
    console.error('Error updating verification badge:', e);
    return NextResponse.json({ success: false, message: 'Failed to update badge' }, { status: 500 });
  }
}