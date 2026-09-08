import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import { genderMatches } from '@/lib/matching';
import { getInvisibleIds } from '@/lib/reportStore';
import { resolveStatus } from '@/lib/membershipStore';
import { is4DigitId, generateUnique4DigitId } from '@/lib/idGenerator';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

interface SearchProfile {
  id: string;
  name: string;
  age: number;
  height: string;
  religion: string;
  caste?: string;
  motherTongue?: string;
  education: string;
  profession: string;
  city: string;
  state?: string;
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
    premium: resolveStatus(u.membershipTier, u.membershipExpiresAt).isPremium,
    tier: resolveStatus(u.membershipTier, u.membershipExpiresAt).tier,
    bio: u.bio || 'Registered Member.',
    isSuspended: !!u.isSuspended,
  };
}

// GET /api/search
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
    const userMobileParam = (searchParams.get('userMobile') || searchParams.get('mobile') || '').replace(/\D/g, '');
    const userEmailParam = (searchParams.get('userEmail') || searchParams.get('email') || '').toLowerCase().trim();
    const profileIdParam = (searchParams.get('profileId') || '').toLowerCase().trim();
    const invisibleIds = userId ? new Set(await getInvisibleIds(userId)) : new Set<string>();

    let allProfiles: SearchProfile[] = [];

    // 1. Fetch profiles from local JSON db
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

    // 2. Fetch profiles from Postgres DB if available
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(`
          SELECT id, user_id, display_name, mobile_number, email, avatar_url, gender, age, height, marital_status, religion, mother_tongue, education, profession, city, bio, verification_status, membership_tier, membership_expires_at, is_suspended
          FROM profiles
          ORDER BY created_at DESC
        `);

        const pgProfiles: SearchProfile[] = rows.map((r) => ({
          id: r.user_id || r.id,
          name: r.display_name || 'Member',
          age: r.age || 26,
          height: r.height || "5'7\"",
          religion: r.religion || 'Hindu',
          motherTongue: r.mother_tongue || 'Hindi',
          education: r.education || 'Graduate',
          profession: r.profession || 'Professional',
          city: r.city || 'Mumbai',
          country: 'India',
          maritalStatus: r.marital_status || 'Never Married',
          gender: r.gender || 'Groom',
          avatarUrl: r.avatar_url || '/images/default-avatar.png',
          verified: r.verification_status === 'approved',
          premium: resolveStatus(r.membership_tier, r.membership_expires_at).isPremium,
          tier: resolveStatus(r.membership_tier, r.membership_expires_at).tier,
          bio: r.bio || 'Verified Matrimonial Member.',
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

    // Filter profiles based on search criteria & robustly exclude viewer's own profile
    const viewerExcludedIds = new Set<string>();
    if (userId) viewerExcludedIds.add(userId.toLowerCase());
    if (profileIdParam) viewerExcludedIds.add(profileIdParam);
    if (userEmailParam) viewerExcludedIds.add(userEmailParam);
    if (userMobileParam) viewerExcludedIds.add(userMobileParam);

    const digitsOnlyUserId = userId.replace(/\D/g, '');
    if (digitsOnlyUserId.length >= 10) viewerExcludedIds.add(digitsOnlyUserId);

    const filtered = uniqueProfiles.filter((p) => {
      const pId = (p.id || '').toLowerCase();

      // Always exclude logged-in viewer
      if (pId && viewerExcludedIds.has(pId)) {
        return false;
      }

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

    return NextResponse.json({
      success: true,
      count: filtered.length,
      profiles: filtered,
    });
  } catch (error) {
    console.error('Error handling search request:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch search results' }, { status: 500 });
  }
}
