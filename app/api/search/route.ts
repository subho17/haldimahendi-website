import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import { genderMatches } from '@/lib/matching';
import { getInvisibleIds } from '@/lib/reportStore';
import { resolveStatus } from '@/lib/membershipStore';

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
}

// Sample fallback profiles for mock demo data
const SAMPLE_PROFILES: SearchProfile[] = [
  {
    id: 'SH1001',
    name: 'Ananya Sharma',
    age: 26,
    height: "5'4\"",
    religion: 'Hindu',
    caste: 'Brahmin',
    motherTongue: 'Hindi',
    education: 'B.Tech - Computer Science',
    profession: 'Senior Software Engineer',
    city: 'Mumbai',
    country: 'India',
    maritalStatus: 'Never Married',
    gender: 'Bride',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=350',
    verified: true,
    premium: true,
    tier: 'premium',
    bio: 'Warm, career-oriented professional looking for a life partner with mutual respect.',
  },
  {
    id: 'SH1002',
    name: 'Rohan Mehta',
    age: 28,
    height: "5'10\"",
    religion: 'Hindu',
    caste: 'Bania',
    motherTongue: 'Gujarati',
    education: 'MBA - Finance',
    profession: 'Investment Analyst',
    city: 'Ahmedabad',
    country: 'India',
    maritalStatus: 'Never Married',
    gender: 'Groom',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=350',
    verified: true,
    bio: 'Family-centered finance professional passionate about fitness and travelling.',
  },
  {
    id: 'SH1003',
    name: 'Priya Nair',
    age: 25,
    height: "5'5\"",
    religion: 'Hindu',
    caste: 'Nair',
    motherTongue: 'Malayalam',
    education: 'M.Sc - Biotechnology',
    profession: 'Research Scientist',
    city: 'Bengaluru',
    country: 'India',
    maritalStatus: 'Never Married',
    gender: 'Bride',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=350',
    verified: true,
    bio: 'Simple and progressive individual seeking a caring and understanding partner.',
  },
];

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
    const invisibleIds = userId ? new Set(await getInvisibleIds(userId)) : new Set<string>();

    let allProfiles: SearchProfile[] = [...SAMPLE_PROFILES];

    // 1. Fetch profiles from local JSON db
    try {
      if (fs.existsSync(USERS_FILE)) {
        const fileData = fs.readFileSync(USERS_FILE, 'utf-8');
        const users = JSON.parse(fileData || '[]');
        const dbProfiles: SearchProfile[] = users.map(
          (u: {
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
          }) => ({
            id: u.profileId || `SH${Math.floor(100000 + Math.random() * 900000)}`,
            name: u.display_name || u.name || 'Shaadi Member',
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
            bio: u.bio || 'Registered Member on Shaadi Matrimonial.',
          })
        );
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
          SELECT id, user_id, display_name, mobile_number, avatar_url, gender, age, height, marital_status, religion, mother_tongue, education, profession, city, bio, verification_status, membership_tier, membership_expires_at
          FROM profiles
          ORDER BY created_at DESC
        `);

        const pgProfiles: SearchProfile[] = rows.map((r) => ({
          id: r.user_id || r.id,
          name: r.display_name || 'Shaadi Member',
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
        }));

        // Deduplicate by ID
        const existingIds = new Set(allProfiles.map((p) => p.id));
        pgProfiles.forEach((p) => {
          if (!existingIds.has(p.id)) {
            allProfiles.unshift(p);
          }
        });
      } catch (e) {
        console.warn('Error querying Postgres profiles for search:', e);
      }
    }

    // Filter profiles based on criteria
    const filtered = allProfiles.filter((p) => {
      if (invisibleIds.has(p.id)) return false;
      if (gender && !genderMatches(gender, p.gender)) return false;
      if (p.age < minAge || p.age > maxAge) return false;
      if (religion && religion !== 'Any' && p.religion.toLowerCase() !== religion.toLowerCase()) return false;
      if (maritalStatus && maritalStatus !== 'Any' && p.maritalStatus.toLowerCase() !== maritalStatus.toLowerCase()) return false;
      if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
      if (motherTongue && motherTongue !== 'Any' && p.motherTongue && p.motherTongue.toLowerCase() !== motherTongue.toLowerCase()) return false;
      if (query) {
        const matchesQuery =
          p.name.toLowerCase().includes(query) ||
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
