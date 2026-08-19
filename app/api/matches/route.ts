import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import { loadPreferences } from '@/lib/prefsStore';
import { findMatches, type MatchCandidate, type MatchPreferences } from '@/lib/matching';
import { getInvisibleIds } from '@/lib/reportStore';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/matches?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

    const prefs = (await loadPreferences(userId)) || ({} as MatchPreferences);

    // ------------------------------------------------------------------
    // Load viewer profile (for same-gender exclusion defaults)
    // ------------------------------------------------------------------
    let viewer: { id: string; gender?: string | null } = { id: userId };
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(
          'SELECT user_id, gender FROM profiles WHERE user_id = $1',
          [userId]
        );
        if (rows.length > 0) viewer = { id: rows[0].user_id || userId, gender: rows[0].gender };
      } catch (e) {
        console.warn('Error loading viewer profile:', e);
      }
    }
    if (!viewer.gender) {
      try {
        const dir = path.dirname(USERS_FILE);
        if (fs.existsSync(USERS_FILE)) {
          const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
          const hit = users.find(
            (u: { profileId?: string; mobileNumber?: string; email?: string; gender?: string }) =>
              u.profileId === userId || u.mobileNumber === userId || u.email === userId
          );
          if (hit?.gender) viewer = { ...viewer, gender: hit.gender };
        }
        void dir;
      } catch {
        // ignore
      }
    }

    // ------------------------------------------------------------------
    // Collect candidate profiles
    // ------------------------------------------------------------------
    const candidates: MatchCandidate[] = [];

    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(`
          SELECT user_id, display_name, avatar_url, gender, age, height, marital_status,
                 religion, mother_tongue, education, profession, city, country, created_at
          FROM profiles
          WHERE user_id <> $1
          ORDER BY created_at DESC
        `, [userId]);

        rows.forEach((r) => {
          const rec: MatchCandidate = {
            id: normalizeId(r.user_id),
            name: r.display_name || 'Member',
            age: r.age,
            height: r.height,
            religion: r.religion,
            motherTongue: r.mother_tongue,
            education: r.education,
            profession: r.profession,
            city: r.city,
            country: r.country,
            maritalStatus: r.marital_status,
            gender: r.gender,
            avatarUrl: r.avatar_url,
            createdAt: r.created_at,
          };
          candidates.push(rec);
        });
      } catch (e) {
        console.warn('Error querying Postgres profiles for matches:', e);
      }
    }

    // Local scratch users (fallback source + extra seed data)
    try {
      const dir = path.dirname(USERS_FILE);
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
        users.forEach((u: {
          profileId?: string;
          display_name?: string;
          name?: string;
          mobileNumber?: string;
          email?: string;
          gender?: string;
          age?: number;
          height?: string;
          maritalStatus?: string;
          religion?: string;
          motherTongue?: string;
          education?: string;
          profession?: string;
          city?: string;
          country?: string;
          avatar_url?: string;
          avatarUrl?: string;
          createdAt?: string;
        }) => {
          const uid = normalizeId(u.profileId || u.mobileNumber || u.email);
          if (!uid || uid === userId) return;
          if (candidates.some((c) => c.id === uid)) return;
          candidates.push({
            id: uid,
            name: u.display_name || u.name || 'Member',
            age: u.age,
            height: u.height,
            religion: u.religion,
            motherTongue: u.motherTongue,
            education: u.education,
            profession: u.profession,
            city: u.city,
            country: u.country || 'India',
            maritalStatus: u.maritalStatus,
            gender: u.gender,
            avatarUrl: u.avatar_url || u.avatarUrl,
            createdAt: u.createdAt,
          });
        });
      }
      void dir;
    } catch (e) {
      console.warn('Error reading scratch users for matches:', e);
    }

    // ------------------------------------------------------------------
    // Run the matchmaking engine
    // ------------------------------------------------------------------
    const invisibleIds = await getInvisibleIds(userId);
    const visibleCandidates = candidates.filter((c) => !invisibleIds.includes(c.id));

    const matches = findMatches(prefs, visibleCandidates, { viewer });

    const eligible = matches.filter((m) => m.isEligible);
    const totalEligible = eligible.length;
    const newCount = eligible.filter((m) => m.isNew).length;

    if (!prefs.userId) prefs.userId = userId;

    return NextResponse.json({
      success: true,
      message: 'Matches generated successfully',
      preferences: prefs,
      meta: {
        totalCandidates: visibleCandidates.length,
        matches: totalEligible,
        newCount,
      },
      matches,
    });
  } catch (e) {
    console.error('Error generating matches:', e);
    return NextResponse.json({ success: false, message: 'Failed to generate matches' }, { status: 500 });
  }
}