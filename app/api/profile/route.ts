import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

export interface PublicProfile {
  id: string;
  name: string;
  age?: number | null;
  height?: string | null;
  religion?: string | null;
  motherTongue?: string | null;
  education?: string | null;
  profession?: string | null;
  city?: string | null;
  country?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt?: string | null;
  verified: boolean;
}

// Sample profiles shown in live search (mirror of /api/search) so that
// browsing sample results also opens a viewable profile.
const SAMPLE_PROFILES: PublicProfile[] = [
  {
    id: 'SH1001',
    name: 'Ananya Sharma',
    age: 26,
    height: "5'4\"",
    religion: 'Hindu',
    motherTongue: 'Hindi',
    education: 'B.Tech - Computer Science',
    profession: 'Senior Software Engineer',
    city: 'Mumbai',
    country: 'India',
    maritalStatus: 'Never Married',
    gender: 'Bride',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=350',
    bio: 'Warm, career-oriented professional looking for a life partner with mutual respect.',
    verified: true,
  },
  {
    id: 'SH1002',
    name: 'Rohan Mehta',
    age: 28,
    height: "5'10\"",
    religion: 'Hindu',
    motherTongue: 'Gujarati',
    education: 'MBA - Finance',
    profession: 'Investment Analyst',
    city: 'Ahmedabad',
    country: 'India',
    maritalStatus: 'Never Married',
    gender: 'Groom',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=350',
    bio: 'Family-centered finance professional passionate about fitness and travelling.',
    verified: true,
  },
  {
    id: 'SH1003',
    name: 'Priya Nair',
    age: 25,
    height: "5'5\"",
    religion: 'Hindu',
    motherTongue: 'Malayalam',
    education: 'M.Sc - Biotechnology',
    profession: 'Research Scientist',
    city: 'Bengaluru',
    country: 'India',
    maritalStatus: 'Never Married',
    gender: 'Bride',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=350',
    bio: 'Simple and progressive individual seeking a caring and understanding partner.',
    verified: true,
  },
];

// GET /api/profile?id=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = normalizeId(searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing id parameter' }, { status: 400 });
    }

    // 1. Postgres profiles
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(
          `SELECT user_id, display_name, avatar_url, gender, age, height, marital_status,
                  religion, mother_tongue, education, profession, city, country, bio, created_at,
                  verification_status
           FROM profiles
           WHERE user_id = $1 OR mobile_number = $1`,
          [id]
        );
        if (rows.length > 0) {
          const r = rows[0];
          return NextResponse.json({
            success: true,
            profile: {
              id: normalizeId(r.user_id),
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
            } as PublicProfile,
          });
        }
      } catch (e) {
        console.warn('Error querying profile from Postgres:', e);
      }
    }

    // 2. Scratch users file
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
        const hit = users.find(
          (u: { profileId?: string; mobileNumber?: string; email?: string }) =>
            u.profileId === id || u.mobileNumber === id || u.email === id
        );
        if (hit) {
          return NextResponse.json({
            success: true,
            profile: {
              id: normalizeId(hit.profileId || hit.mobileNumber || hit.email),
              name: hit.display_name || hit.name || 'Member',
              age: hit.age,
              height: hit.height,
              religion: hit.religion,
              motherTongue: hit.motherTongue,
              education: hit.education,
              profession: hit.profession,
              city: hit.city,
              country: hit.country || 'India',
              maritalStatus: hit.maritalStatus,
              gender: hit.gender,
              avatarUrl: hit.avatar_url || hit.avatarUrl,
              bio: hit.bio,
              createdAt: hit.createdAt || null,
              verified: hit.verificationStatus === 'approved',
            } as PublicProfile,
          });
        }
      }
    } catch (e) {
      console.warn('Error reading scratch profile:', e);
    }

    // 3. Sample profiles
    const sample = SAMPLE_PROFILES.find((p) => p.id === id);
    if (sample) {
      return NextResponse.json({ success: true, profile: sample });
    }

    return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
  } catch (e) {
    console.error('Error loading profile:', e);
    return NextResponse.json({ success: false, message: 'Failed to load profile' }, { status: 500 });
  }
}