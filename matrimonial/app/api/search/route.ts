import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import { loadPreferences } from '@/lib/prefsStore';
import { findMatches, type MatchCandidate, type MatchPreferences } from '@/lib/matching';
import { getInvisibleIds } from '@/lib/reportStore';
import { is4DigitId, generateUnique4DigitId } from '@/lib/idGenerator';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

interface SearchProfile {
  id: string;
  name: string;
  age: number;
  height: string;
  religion: string;
  motherTongue?: string;
  education: string;
  profession: string;
  city: string;
  country?: string;
  maritalStatus: string;
  gender: string;
  avatarUrl: string;
  verified?: boolean;
  premium?: boolean;
  tier?: string;
  bio?: string;
  isSuspended?: boolean;
}

function normalizeGender(g?: string): 'male' | 'female' | 'other' {
  if (!g) return 'other';
  const s = g.trim().toLowerCase();
  if (['groom', 'man', 'male', 'boy', 'men'].includes(s)) return 'male';
  if (['bride', 'woman', 'female', 'girl', 'women', 'ladies'].includes(s)) return 'female';
  return 'other';
}

function genderMatches(target?: string, candidate?: string): boolean {
  if (!target || !candidate) return true;
  return normalizeGender(target) === normalizeGender(candidate);
}

interface UserRecord {
  profileId?: string;
  name?: string;
  display_name?: string;
  age?: number;
  height?: string;
  religion?: string;
  motherTongue?: string;
  education?: string;
  profession?: string;
  city?: string;
  maritalStatus?: string;
  gender?: string;
  avatarUrl?: string;
  avatar_url?: string;
  bio?: string;
  verificationStatus?: string;
  membershipTier?: string;
  membershipExpiresAt?: string;
  isSuspended?: boolean;
  mobileNumber?: string;
  mobile_number?: string;
  email?: string;
}

function toSearchProfile(u: UserRecord): SearchProfile {
  const stableId: string = is4DigitId(u.profileId) ? u.profileId! : generateUnique4DigitId();
  u.profileId = stableId;
  return {
    id: stableId,
    name: u.display_name || u.name || 'Member',
    age: u.age || 26,
    height: u.height || "5'7\"",
    religion: u.religion || 'Hindu',
    motherTongue: u.motherTongue || 'Hindi',
    education: u.education || 'Graduate',
    profession: u.profession || 'Professional',
    city: u.city || 'Mumbai',
    country: 'India',
    maritalStatus: u.maritalStatus || 'Never Married',
    gender: u.gender || 'Groom',
    avatarUrl: u.avatar_url || u.avatarUrl || '/images/default-avatar.png',
    verified: u.verificationStatus === 'approved',
    premium: false,
    tier: 'free',
    bio: u.bio || 'Registered Member.',
    isSuspended: !!u.isSuspended,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get('gender') || '';
    const minAge = parseInt(searchParams.get('minAge') || '18', 10);
    const maxAge = parseInt(searchParams.get('maxAge') || '70', 10);
    const religion = searchParams.get('religion') || '';
    const maritalStatus = searchParams.get('maritalStatus') || '';
    const city = searchParams.get('city') || '';
    const motherTongue = searchParams.get('motherTongue') || '';
    const query = (searchParams.get('q') || '').toLowerCase();
    const userId = (searchParams.get('userId') || '').trim();
    const invisibleIds = userId ? new Set(await getInvisibleIds(userId)) : new Set<string>();

    // 1. Load user preferences for matching algorithm
    let prefs: MatchPreferences = {};
    if (userId) {
      prefs = await loadPreferences(userId) || {};
      // If preferences don't specify partnerGender, default based on user's gender
      if (!prefs.partnerGender) {
        const userGender = (prefs as Record<string, unknown>).gender as string || 'male';
        prefs.partnerGender = userGender === 'male' ? 'Woman' : 'Man';
      }
    }

    // 2. Fetch profiles from local JSON db
    let allProfiles: SearchProfile[] = [];
    try {
      if (fs.existsSync(USERS_FILE)) {
        const fileData = fs.readFileSync(USERS_FILE, 'utf-8');
        const users = JSON.parse(fileData || '[]') as UserRecord[];
        const dbProfiles = users.map(toSearchProfile);
        allProfiles = [...dbProfiles, ...allProfiles];
      }
    } catch (e) {
      console.warn('Error reading profiles from local JSON db:', e);
    }

    // 3. Fetch profiles from Postgres DB if available
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(`
          SELECT id, user_id, display_name, mobile_number, email, avatar_url, gender, age, height, marital_status, religion, mother_tongue, education, profession, city, bio, verification_status, membership_tier, membership_expires_at, is_suspended
          FROM profiles
          ORDER BY created_at DESC
        `);

        const pgProfiles: SearchProfile[] = rows.map((r) => toSearchProfile({
          profileId: r.user_id,
          display_name: r.display_name,
          age: r.age,
          height: r.height,
          religion: r.religion,
          motherTongue: r.mother_tongue,
          education: r.education,
          profession: r.profession,
          city: r.city,
          maritalStatus: r.marital_status,
          gender: r.gender,
          avatar_url: r.avatar_url,
          verificationStatus: r.verification_status,
          membershipTier: r.membership_tier,
          membershipExpiresAt: r.membership_expires_at,
          isSuspended: !!r.is_suspended,
        }));

        allProfiles = [...allProfiles, ...pgProfiles];
      } catch (e) {
        console.warn('Error querying Postgres profiles for search:', e);
      }
    }

    // Deduplicate across all sources by ID and Name+Gender combination
    const seenKeys = new Set<string>();
    const uniqueProfiles: SearchProfile[] = [];

    for (const p of allProfiles) {
      const idKey = p.id ? `id:${p.id.toLowerCase().trim()}` : '';
      const nameKey = p.name ? `name:${p.name.toLowerCase().trim().replace(/\s+/g, ' ')}-${(p.gender || '').toLowerCase()}` : '';

      if (
        (idKey && seenKeys.has(idKey)) ||
        (nameKey && seenKeys.has(nameKey))
      ) {
        continue;
      }

      if (idKey) seenKeys.add(idKey);
      if (nameKey) seenKeys.add(nameKey);

      uniqueProfiles.push(p);
    }

    // Convert to MatchCandidate for matching engine
    const candidates: MatchCandidate[] = uniqueProfiles.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      height: p.height,
      religion: p.religion,
      motherTongue: p.motherTongue,
      education: p.education,
      profession: p.profession,
      city: p.city,
      maritalStatus: p.maritalStatus,
      gender: p.gender,
      avatarUrl: p.avatarUrl,
      createdAt: new Date().toISOString(),
      premium: p.premium,
      tier: p.tier,
      rashi: '',
      nakshatra: '',
      manglik: '',
      diet: '',
      smoking: '',
      drinking: '',
    }));

    // 3. Run matching algorithm with preferences
    let matchedResults: Array<{ profile: SearchProfile; score: number; isEligible: boolean; breakdown: Record<string, number> }> = [];

    try {
      const matched = findMatches(prefs, candidates, { viewer: { id: userId, gender: gender ? (['bride', 'woman', 'female', 'girl', 'women', 'ladies'].includes(gender.toLowerCase()) ? 'female' : 'male') : undefined } });

      // Convert matched results
      matchedResults = matched.map((m) => ({
        profile: {
          id: m.profile.id,
          name: m.profile.name,
          age: Number(m.profile.age) || 26,
          height: m.profile.height || "5'7\"",
          religion: m.profile.religion || 'Hindu',
          motherTongue: m.profile.motherTongue || 'Hindi',
          education: m.profile.education || 'Graduate',
          profession: m.profile.profession || 'Professional',
          city: m.profile.city || 'Mumbai',
          maritalStatus: m.profile.maritalStatus || 'Never Married',
          gender: m.profile.gender || 'Groom',
          avatarUrl: m.profile.avatarUrl || '/images/default-avatar.png',
          verified: false,
          premium: m.profile.premium,
          tier: m.profile.tier,
          bio: (m.profile as unknown as Record<string, unknown>).bio as string || '',
          isSuspended: false,
        },
        score: m.score,
        isEligible: m.isEligible,
        breakdown: m.breakdown,
      }));
    } catch (matchError) {
      console.warn('Matching engine error, falling back to filtered results:', matchError);
      // Fall back to filtered results without scores
      const filtered = uniqueProfiles.filter((p) => {
        const pId = (p.id || '').toLowerCase();
        if (pId && userId && pId.includes(userId.toLowerCase())) return false;
        if (invisibleIds.has(p.id)) return false;
        if (p.isSuspended) return false;
        if (gender && !genderMatches(gender, p.gender)) return false;
        if (p.age < minAge || p.age > maxAge) return false;
        if (religion && religion !== 'Any' && p.religion.toLowerCase() !== religion.toLowerCase()) return false;
        if (maritalStatus && maritalStatus !== 'Any' && p.maritalStatus.toLowerCase() !== maritalStatus.toLowerCase()) return false;
        if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
        if (motherTongue && motherTongue !== 'Any' && p.motherTongue && p.motherTongue.toLowerCase() !== motherTongue.toLowerCase()) return false;
        if (query) {
          const matchesQuery =
            p.name.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            p.city.toLowerCase().includes(query) ||
            p.profession.toLowerCase().includes(query) ||
            p.religion.toLowerCase().includes(query);
          if (!matchesQuery) return false;
        }
        return true;
      });

      matchedResults = filtered.map((p) => ({
        profile: p,
        score: 50,
        isEligible: true,
        breakdown: {}
      }));
    }

    // Sort by score (highest first)
    matchedResults.sort((a, b) => b.score - a.score);

    // Get just the profiles for the response
    const searchProfiles = matchedResults.map((m) => m.profile);

    // Build score map for UI
    const scoreMap: Record<string, number> = {};
    matchedResults.forEach((m) => {
      scoreMap[m.profile.id] = m.score;
    });

    return NextResponse.json({
      success: true,
      count: searchProfiles.length,
      profiles: searchProfiles,
      scores: scoreMap,
    });
  } catch (error) {
    console.error('Error handling search request:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch search results' }, { status: 500 });
  }
}