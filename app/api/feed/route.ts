import { NextResponse } from 'next/server';
import { pool, hasPool } from '@/lib/db';
import { setCache, getCache } from '@/lib/cache';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
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

    // Check cache first
    const cacheKey = `feed:${viewerId}`;
    const cached = getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, profiles: cached });
    }

    // 1. Get viewer's gender from profiles table
    const viewerProfile = await (
      hasPool
        ? await pool!.query(
            `SELECT gender FROM profiles WHERE user_id = $1`,
            [viewerId]
          )
        : { rows: [] }
    ) as { rows: { gender: string }[] };

    const viewerGender = viewerProfile.rows.length > 0 ? (viewerProfile.rows[0].gender || '').toLowerCase() : '';

    // 2. Get viewer's partner preference (who they are looking for)
    const prefRows = await (
      hasPool
        ? await pool!.query(
            `SELECT partner_gender, age_min, age_max, city FROM partner_preferences WHERE user_id = $1`,
            [viewerId]
          )
        : { rows: [] }
    ) as {
      rows: {
        partner_gender: string | null;
        age_min: number | null;
        age_max: number | null;
        city: string | null;
      }[];
    };

    const pref = (prefRows.rows.length > 0 ? prefRows.rows[0] : {}) as {
      partner_gender?: string | null;
      age_min?: number | null;
      age_max?: number | null;
      city?: string | null;
    };

    const partnerGender = (pref.partner_gender || '').toLowerCase() || null;
    const ageMin = pref.age_min ?? null;
    const ageMax = pref.age_max ?? null;
    const prefCity = (pref.city || '').toLowerCase() || null;

    // 3. Determine which gender to show in feed
    let filterGender: string | null = null;

    if (partnerGender && partnerGender !== 'both') {
      filterGender = partnerGender;
    } else if (viewerGender) {
      // opposite gender
      filterGender = viewerGender === 'female' ? 'male' : 'female';
    }
    // if viewerGender unknown and partnerGender null -> show all (filterGender stays null)

    // 4. Build SQL WHERE clauses
    let whereClauses = [`user_id != $1`];
    const params: unknown[] = [viewerId];
    let paramIdx = 2; // $1 already used

    if (filterGender) {
      whereClauses.push(`LOWER(gender) = LOWER($${paramIdx})`);
      params.push(filterGender);
      paramIdx++;
    }

    // Age range filter from partner preference
    if (ageMin !== null || ageMax !== null) {
      const ageCond: string[] = [];
      if (ageMin !== null) {
        ageCond.push(`age >= $${paramIdx}`);
        params.push(ageMin);
        paramIdx++;
      }
      if (ageMax !== null) {
        ageCond.push(`age <= $${paramIdx}`);
        params.push(ageMax);
        paramIdx++;
      }
      whereClauses.push(`(${ageCond.join(' AND ')})`);
    }

    // Location filter (city or country) from partner preference
    if (prefCity) {
      whereClauses.push(`(LOWER(city) LIKE LOWER($${paramIdx}) OR LOWER(country) LIKE LOWER($${paramIdx}))`);
      params.push(prefCity);
      paramIdx++;
    }

    const whereClause = whereClauses.join(' AND ');

    // 5. Execute query
    let sql = `SELECT id, user_id, display_name, avatar_url, age, height, religion,
                mother_tongue, education, profession, city, country, bio, created_at,
                verification_status, membership_tier, membership_expires_at,
                dob, birth_time, birth_place, rashi, nakshatra, manglik, gotra,
                father_occupation, mother_occupation, siblings, family_type,
                family_values, diet, smoking, drinking, disability
             FROM profiles
            WHERE ${whereClause}
            ORDER BY created_at DESC LIMIT 20`;

    const { rows } = hasPool ? await pool!.query(sql, params) : { rows: [] };

    // Map rows to lean format
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

    // Cache result for 30 seconds
    setCache(cacheKey, profiles, 30_000);

    return NextResponse.json({ success: true, profiles });
  } catch (e) {
    console.error('Error fetching feed:', e);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}