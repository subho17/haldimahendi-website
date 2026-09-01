import { NextResponse } from 'next/server';
import { pool, hasPool } from '@/lib/db';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// Helper: run a raw query and return rows
async function query(text: string, params: unknown[] = []) {
  if (!hasPool) return { rows: [] };
  const result = await pool.query(text, params);
  return result as { rows: unknown[] };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const viewerId = normalizeId(searchParams.get('viewerId'));
    if (!viewerId) {
      return NextResponse.json(
        { success: false, message: 'Missing viewerId parameter' },
        { status: 400 }
      );
    }

    // 1. Get viewer's gender from profiles table
    const viewerProfile = await (
      hasPool
        ? await pool.query(
            `SELECT gender FROM profiles WHERE user_id = $1`,
            [viewerId]
          )
        : { rows: [] }
    ) as { rows: { gender: string }[] };

    const viewerGender = viewerProfile.rows.length > 0 ? viewerProfile.rows[0].gender : null;

    // 2. Get viewer's partner preference (who they are looking for)
    const prefRows = await (
      hasPool
        ? await pool.query(
            `SELECT partner_gender FROM partner_preferences WHERE user_id = $1`,
            [viewerId]
          )
        : { rows: [] }
    ) as { rows: { partner_gender: string }[] };

    const partnerGender = prefRows.length > 0 ? prefRows[0].partner_gender : null;

    // 3. Determine which gender to show in feed
    // Rules:
    // - If partner_gender is set, only show profiles matching that gender.
    // - If partner_gender is null or "both", show opposite gender to viewer's gender
    //   (girl -> boys, boy -> girls). If viewer gender unknown, show all except viewer.
    let filterGender: string | null = null;

    if (partnerGender && partnerGender.toLowerCase() !== 'both') {
      filterGender = partnerGender;
    } else if (viewerGender) {
      // opposite gender
      const opposite = viewerGender === 'female' ? 'male' : 'female';
      filterGender = opposite;
    }
    // if viewerGender unknown and partnerGender null -> show all (filterGender stays null)

    // 4. Build and execute the feed query
    const baseWhere = filterGender
      ? `gender = ${
          filterGender === 'male' ? 'MALE' : 'female'
        }` // we'll use lowercase param
      : '1=1';

    // Actually we'll use parameterized gender.
    // We'll construct query dynamically.

    let sql = `SELECT id, user_id, display_name, avatar_url, age, height, religion,
                mother_tongue, education, profession, city, country, bio, created_at,
                verification_status, membership_tier, membership_expires_at,
                dob, birth_time, birth_place, rashi, nakshatra, manglik, gotra,
                father_occupation, mother_occupation, siblings, family_type,
                family_values, diet, smoking, drinking, disability
             FROM profiles
            WHERE user_id != $1 `;

    const params: unknown[] = [viewerId];

    if (filterGender) {
      sql += ` AND LOWER(gender) = LOWER($${params.length + 1})`;
      params.push(filterGender);
    }

    // Optional: add ordering, limit
    sql += ` ORDER BY created_at DESC LIMIT 20`;

    const { rows } = await query(sql, params);

    // Map rows to a lean format
    const profiles = rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      name: r.display_name || 'Member',
      age: r.age,
      height: r.height,
      religion: r.religion,
      motherTongue: r.mother_tongue,
      education: r.education,
      profession: r.profession,
      city: r.city,
      country: r.country || 'India',
      maritalStatus: r.marital_status,
      gender: r.gender,
      avatarUrl: r.avatar_url,
      bio: r.bio,
      createdAt: r.created_at?.toISOString?.() || null,
      verified: r.verification_status === 'approved',
    }));

    return NextResponse.json({ success: true, profiles });
  } catch (e) {
    console.error('Error fetching feed:', e);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}