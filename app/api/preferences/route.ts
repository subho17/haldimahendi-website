import { NextResponse } from 'next/server';
import { loadPreferences, savePreferences } from '@/lib/prefsStore';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/preferences?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

    const stored = await loadPreferences(userId);

    // Fall back to basic defaults derived from the user's own profile
    // so the matches page works even before preferences are saved.
    let defaults: Record<string, unknown> = {};
    if (!stored) {
      let viewerGender: string | null = null;
      if (hasPool) {
        try {
          await ensureProfilesTable();
          const { rows } = await pool!.query('SELECT gender FROM profiles WHERE user_id = $1', [userId]);
          if (rows.length > 0) viewerGender = rows[0].gender || null;
        } catch (e) {
          console.warn('Error reading viewer gender for defaults:', e);
        }
      }
      if (!viewerGender) {
        try {
          if (fs.existsSync(USERS_FILE)) {
            const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
            const hit = users.find(
              (u: { profileId?: string; mobileNumber?: string; email?: string }) =>
                u.profileId === userId || u.mobileNumber === userId || u.email === userId
            );
            viewerGender = hit?.gender || null;
          }
        } catch {
          // ignore
        }
      }
      defaults = {
        partnerGender: viewerGender
          ? ['male', 'man', 'groom'].includes(viewerGender.toLowerCase())
            ? 'Woman'
            : 'Man'
          : 'Any',
        ageMin: 21,
        ageMax: 35,
      };
    }

    return NextResponse.json({
      success: true,
      exists: !!stored,
      preferences: stored || defaults,
    });
  } catch (e) {
    console.error('Error loading preferences:', e);
    return NextResponse.json({ success: false, message: 'Failed to load preferences' }, { status: 500 });
  }
}

// POST /api/preferences
// Body: { userId, partnerGender, ageMin, ageMax, heightMin, heightMax,
//         religion, motherTongue, maritalStatus, city, education }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = normalizeId(body.userId);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId in body' }, { status: 400 });
    }

    const preferences = {
      userId,
      partnerGender: body.partnerGender ? normalizeId(body.partnerGender) : undefined,
      ageMin: body.ageMin !== undefined && body.ageMin !== '' ? Number(body.ageMin) : undefined,
      ageMax: body.ageMax !== undefined && body.ageMax !== '' ? Number(body.ageMax) : undefined,
      heightMin: body.heightMin ? normalizeId(body.heightMin) : undefined,
      heightMax: body.heightMax ? normalizeId(body.heightMax) : undefined,
      religion: body.religion ? normalizeId(body.religion) : undefined,
      motherTongue: body.motherTongue ? normalizeId(body.motherTongue) : undefined,
      maritalStatus: body.maritalStatus ? normalizeId(body.maritalStatus) : undefined,
      city: body.city ? normalizeId(body.city) : undefined,
      education: body.education ? normalizeId(body.education) : undefined,
    };

    await savePreferences(preferences);

    return NextResponse.json({
      success: true,
      message: 'Partner preferences saved successfully',
      preferences,
    });
  } catch (e) {
    console.error('Error saving preferences:', e);
    return NextResponse.json({ success: false, message: 'Failed to save preferences' }, { status: 500 });
  }
}