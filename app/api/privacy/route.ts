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
          `SELECT hide_phone, hide_email, hide_surname, hide_photos, photo_privacy
           FROM profiles
           WHERE user_id = $1 OR mobile_number = $1`,
          [userId]
        );
        if (rows.length > 0) {
          return NextResponse.json({ success: true, privacy: rows[0] });
        }
      } catch (e) {
        console.warn('[Privacy] DB query failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      privacy: { hide_phone: false, hide_email: false, hide_surname: false, hide_photos: false, photo_privacy: 'public' },
    });
  } catch (e) {
    console.error('Error fetching privacy settings:', e);
    return NextResponse.json({ success: false, message: 'Failed to load privacy settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = normalizeId(body.userId);
    const settings = body.settings;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }
    if (!settings) {
      return NextResponse.json({ success: false, message: 'Missing settings' }, { status: 400 });
    }

    const allowedFields = ['hide_phone', 'hide_email', 'hide_surname', 'hide_photos', 'photo_privacy'];
    const updates: string[] = [];
    const values: unknown[] = [normalizeId(userId)];
    let paramIndex = 2;

    for (const field of allowedFields) {
      if (field in settings) {
        const value = settings[field];
        if (field === 'photo_privacy') {
          if (!['public', 'contacts_only', 'private'].includes(value)) {
            return NextResponse.json({ success: false, message: 'Invalid photo_privacy value' }, { status: 400 });
          }
          updates.push(`photo_privacy = $${paramIndex}`);
        } else {
          updates.push(`${field} = $${paramIndex}`);
        }
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid settings provided' }, { status: 400 });
    }

    values.push(normalizeId(userId)); // for WHERE clause

    if (hasPool) {
      try {
        await ensureProfilesTable();
        const query = `UPDATE profiles SET ${updates.join(', ')}, updated_at = now() WHERE user_id = $${paramIndex} OR mobile_number = $${paramIndex}`;
        await pool!.query(query, values);
      } catch (e) {
        console.warn('[Privacy] DB update failed:', e);
        return NextResponse.json({ success: false, message: 'Failed to update privacy settings' }, { status: 500 });
      }
    }

    // Update scratch file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
    const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
        const idx = users.findIndex((u: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) =>
          u.profileId === normalizeId(userId) || u.mobileNumber === userId || u.mobile_number === userId || u.email === normalizeId(userId)
        );
        if (idx >= 0) {
          for (const field of ['hide_phone', 'hide_email', 'hide_surname', 'hide_photos', 'photo_privacy']) {
            if (field in settings) {
              users[idx][field] = settings[field];
            }
          }
          users[idx].updatedAt = new Date().toISOString();
          fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }
      }
    } catch (e) {
      console.warn('[Privacy] Scratch update failed:', e);
    }

    return NextResponse.json({ success: true, message: 'Privacy settings updated' });
  } catch (e) {
    console.error('Error updating privacy settings:', e);
    return NextResponse.json({ success: false, message: 'Failed to update privacy settings' }, { status: 500 });
  }
}