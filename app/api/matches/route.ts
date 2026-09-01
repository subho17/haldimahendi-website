import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import { loadPreferences } from '@/lib/prefsStore';
import { findMatches, type MatchCandidate, type MatchPreferences } from '@/lib/matching';
import { getInvisibleIds } from '@/lib/reportStore';
import { resolveStatus } from '@/lib/membershipStore';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/matches?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    const profileIdParam = normalizeId(searchParams.get('profileId'));
    const userMobileParam = normalizeId(searchParams.get('userMobile') || searchParams.get('mobile')).replace(/\D/g, '');
    const userEmailParam = normalizeId(searchParams.get('userEmail') || searchParams.get('email')).toLowerCase();

    if (!userId && !profileIdParam && !userMobileParam && !userEmailParam) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

    const effectiveUserId = userId || profileIdParam || userMobileParam || userEmailParam;
    const prefs = (await loadPreferences(effectiveUserId)) || ({} as MatchPreferences);

    // ------------------------------------------------------------------
    // Build comprehensive viewer keys to exclude viewer completely
    // ------------------------------------------------------------------
    const viewerKeys = new Set<string>();
    if (userId) viewerKeys.add(userId.toLowerCase());
    if (profileIdParam) viewerKeys.add(profileIdParam.toLowerCase());
    if (userEmailParam) viewerKeys.add(userEmailParam);
    if (userMobileParam) viewerKeys.add(userMobileParam);
    const digitsOnlyUserId = userId.replace(/\D/g, '');
    if (digitsOnlyUserId.length >= 10) viewerKeys.add(digitsOnlyUserId);

    const viewer: { id: string; gender?: string | null; nakshatra?: string | null; manglik?: string | boolean | null } = { id: effectiveUserId };

    // 1. Resolve viewer from Postgres
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(`
          SELECT id, user_id, mobile_number, email, gender, nakshatra, manglik
          FROM profiles
        `);
        for (const r of rows) {
          const rId = (r.id || '').toString().toLowerCase();
          const rUserId = (r.user_id || '').toString().toLowerCase();
          const rMob = (r.mobile_number || '').toString().replace(/\D/g, '');
          const rEm = (r.email || '').toString().toLowerCase();

          const isViewer =
            (rId && viewerKeys.has(rId)) ||
            (rUserId && viewerKeys.has(rUserId)) ||
            (rMob && viewerKeys.has(rMob)) ||
            (rEm && viewerKeys.has(rEm));

          if (isViewer) {
            if (rId) viewerKeys.add(rId);
            if (rUserId) viewerKeys.add(rUserId);
            if (rMob) viewerKeys.add(rMob);
            if (rEm) viewerKeys.add(rEm);
            if (r.gender && !viewer.gender) viewer.gender = r.gender;
            if (r.nakshatra && !viewer.nakshatra) viewer.nakshatra = r.nakshatra;
            if (r.manglik != null && viewer.manglik == null) viewer.manglik = r.manglik;
          }
        }
      } catch (e) {
        console.warn('Error loading viewer profile from PG:', e);
      }
    }

    // 2. Resolve viewer from USERS_FILE
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
        for (const u of users) {
          const uProfileId = (u.profileId || '').toLowerCase();
          const uMob = (u.mobileNumber || u.mobile_number || '').replace(/\D/g, '');
          const uEm = (u.email || '').toLowerCase();

          const isViewer =
            (uProfileId && viewerKeys.has(uProfileId)) ||
            (uMob && viewerKeys.has(uMob)) ||
            (uEm && viewerKeys.has(uEm));

          if (isViewer) {
            if (uProfileId) viewerKeys.add(uProfileId);
            if (uMob) viewerKeys.add(uMob);
            if (uEm) viewerKeys.add(uEm);
            if (u.gender && !viewer.gender) viewer.gender = u.gender;
            if (u.nakshatra && !viewer.nakshatra) viewer.nakshatra = u.nakshatra;
            if (u.manglik != null && viewer.manglik == null) viewer.manglik = u.manglik;
          }
        }
      }
    } catch {
      // ignore
    }

    // ------------------------------------------------------------------
    // Collect candidate profiles
    // ------------------------------------------------------------------
    const candidates: MatchCandidate[] = [];

    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(`
          SELECT id, user_id, mobile_number, email, display_name, avatar_url, gender, age, height, marital_status,
                 religion, mother_tongue, education, profession, city, country, created_at,
                 membership_tier, membership_expires_at, rashi, nakshatra, manglik, diet,
                 smoking, drinking, is_suspended
          FROM profiles
          WHERE COALESCE(is_suspended, FALSE) = FALSE
          ORDER BY created_at DESC
        `);

        rows.forEach((r) => {
          const rId = (r.id || '').toString().toLowerCase();
          const rUserId = normalizeId(r.user_id).toLowerCase();
          const rMob = (r.mobile_number || '').toString().replace(/\D/g, '');
          const rEm = (r.email || '').toString().toLowerCase();

          // Skip if viewer's own profile
          if (
            (rId && viewerKeys.has(rId)) ||
            (rUserId && viewerKeys.has(rUserId)) ||
            (rMob && viewerKeys.has(rMob)) ||
            (rEm && viewerKeys.has(rEm))
          ) {
            return;
          }

          const mem = resolveStatus(r.membership_tier, r.membership_expires_at);
          const rec: MatchCandidate = {
            id: normalizeId(r.user_id || r.id),
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
            premium: mem.isPremium,
            tier: mem.tier,
            rashi: r.rashi,
            nakshatra: r.nakshatra,
            manglik: r.manglik,
            diet: r.diet,
            smoking: r.smoking,
            drinking: r.drinking,
            mobileNumber: r.mobile_number,
            email: r.email,
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
        interface ScratchUser {
          profileId?: string;
          display_name?: string;
          name?: string;
          mobileNumber?: string;
          mobile_number?: string;
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
          membershipTier?: string;
          membershipExpiresAt?: string;
          rashi?: string;
          nakshatra?: string;
          manglik?: string | boolean;
          diet?: string;
          smoking?: string;
          drinking?: string;
          isSuspended?: boolean;
        }
        users.forEach((u: ScratchUser) => {
          const uid = normalizeId(u.profileId || u.mobileNumber || u.email);
          const uProfileId = (u.profileId || '').toLowerCase();
          const uMobile = (u.mobileNumber || u.mobile_number || '').replace(/\D/g, '');
          const uEmail = (u.email || '').toLowerCase().trim();
          const uName = (u.display_name || u.name || '').toLowerCase().trim();

          // Skip invalid, suspended, or viewer's own profile
          if (
            !uid ||
            (uProfileId && viewerKeys.has(uProfileId)) ||
            (uMobile && viewerKeys.has(uMobile)) ||
            (uEmail && viewerKeys.has(uEmail))
          ) {
            return;
          }
          if (u.isSuspended) return;

          // Skip duplicates already present in candidates
          const isDuplicate = candidates.some((c) => {
            if (c.id.toLowerCase() === uid.toLowerCase()) return true;
            if (uMobile && c.mobileNumber && c.mobileNumber.replace(/\D/g, '') === uMobile) return true;
            if (uEmail && c.email && c.email.toLowerCase().trim() === uEmail) return true;
            if (uName && c.name.toLowerCase().trim() === uName && (c.gender || '').toLowerCase() === (u.gender || '').toLowerCase()) return true;
            return false;
          });
          if (isDuplicate) return;

          const mem = resolveStatus(u.membershipTier, u.membershipExpiresAt);
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
            mobileNumber: u.mobileNumber || u.mobile_number,
            email: u.email,
            createdAt: u.createdAt,
            premium: mem.isPremium,
            tier: mem.tier,
            rashi: u.rashi,
            nakshatra: u.nakshatra,
            manglik: u.manglik,
            diet: u.diet,
            smoking: u.smoking,
            drinking: u.drinking,
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
