// Builds a lookup map of every known profile id -> candidate profile,
// merging the Postgres profiles table and the local scratch users file.
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import type { MatchCandidate } from '@/lib/matching';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

export async function buildProfileLookup(): Promise<Map<string, MatchCandidate>> {
  const lookup = new Map<string, MatchCandidate>();

  const add = (id?: string | null, profile?: MatchCandidate | null) => {
    const key = normalizeId(id);
    if (key && profile?.name) lookup.set(key, profile);
  };

  if (hasPool) {
    try {
      await ensureProfilesTable();
      const { rows } = await pool!.query(`
        SELECT user_id, mobile_number, display_name, avatar_url, gender, age, height,
               marital_status, religion, mother_tongue, education, profession, city, country, created_at
        FROM profiles
      `);
      rows.forEach((r) => {
        const candidate: MatchCandidate = {
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
        add(r.user_id, candidate);
        add(r.mobile_number, candidate);
      });
    } catch (e) {
      console.warn('Error building profile lookup from Postgres:', e);
    }
  }

  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
      users.forEach((u: {
        profileId?: string;
        mobileNumber?: string;
        email?: string;
        display_name?: string;
        name?: string;
        avatar_url?: string;
        avatarUrl?: string;
        gender?: string;
        age?: number;
        height?: string;
        maritalStatus?: string;
        religion?: string;
        motherTongue?: string;
        education?: string;
        profession?: string;
        city?: string;
        createdAt?: string;
      }) => {
        const candidate: MatchCandidate = {
          id: normalizeId(u.profileId || u.mobileNumber || u.email),
          name: u.display_name || u.name || 'Member',
          age: u.age,
          height: u.height,
          religion: u.religion,
          motherTongue: u.motherTongue,
          education: u.education,
          profession: u.profession,
          city: u.city,
          country: 'India',
          maritalStatus: u.maritalStatus,
          gender: u.gender,
          avatarUrl: u.avatar_url || u.avatarUrl,
          createdAt: u.createdAt,
        };
        add(u.profileId, candidate);
        add(u.mobileNumber, candidate);
        add(u.email, candidate);
      });
    }
  } catch (e) {
    console.warn('Error building profile lookup from scratch:', e);
  }

  return lookup;
}