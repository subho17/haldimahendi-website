import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import { resolveStatus, getMembership } from '@/lib/membershipStore';
import { is4DigitId, generateUnique4DigitId, maskPhoneNumber } from '@/lib/idGenerator';

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
  membership?: {
    tier: string;
    isPremium: boolean;
    label: string;
  };
  dob?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  rashi?: string | null;
  nakshatra?: string | null;
  manglik?: string | null;
  gotra?: string | null;
  fatherOccupation?: string | null;
  motherOccupation?: string | null;
  siblings?: string | null;
  familyType?: string | null;
  familyValues?: string | null;
  diet?: string | null;
  smoking?: string | null;
  drinking?: string | null;
  disability?: string | null;
  email?: string | null;
  mobile?: string | null;
  maskedMobile?: string | null;
}

// GET /api/profile?id=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = normalizeId(searchParams.get('id'));
    const viewerId = normalizeId(searchParams.get('viewerId'));
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing id parameter' }, { status: 400 });
    }

    // Contact details are premium-gated: only revealed to premium viewers or self.
    let viewerIsPremium = false;
    if (viewerId) {
      try {
        viewerIsPremium = (await getMembership(viewerId)).isPremium;
      } catch {
        viewerIsPremium = false;
      }
    }

    // 1. Postgres profiles
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(
          `SELECT user_id, display_name, email, avatar_url, mobile_number, gender, age, height, marital_status,
                  religion, mother_tongue, education, profession, city, country, bio, created_at,
                  verification_status, membership_tier, membership_expires_at,
                  dob, birth_time, birth_place, rashi, nakshatra, manglik, gotra,
                  father_occupation, mother_occupation, siblings, family_type, family_values,
                  diet, smoking, drinking, disability
           FROM profiles
           WHERE user_id = $1 OR mobile_number = $1`,
          [id]
        );
        if (rows.length > 0) {
          const r = rows[0];
          const isSelf = viewerId && (
            normalizeId(r.user_id).toLowerCase() === viewerId.toLowerCase() ||
            (r.mobile_number && r.mobile_number.replace(/\D/g, '') === viewerId.replace(/\D/g, ''))
          );
          const revealContact = Boolean(isSelf || viewerIsPremium);
          const mem = resolveStatus(r.membership_tier, r.membership_expires_at);
          const dob = r.dob instanceof Date ? r.dob.toISOString().slice(0, 10) : r.dob;
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
              membership: {
                tier: mem.tier,
                isPremium: mem.isPremium,
                label: mem.plan?.badgeLabel || '',
              },
              dob: dob || null,
              birthTime: r.birth_time || null,
              birthPlace: r.birth_place || null,
              rashi: r.rashi || null,
              nakshatra: r.nakshatra || null,
              manglik: r.manglik || null,
              gotra: r.gotra || null,
              fatherOccupation: r.father_occupation || null,
              motherOccupation: r.mother_occupation || null,
              siblings: r.siblings || null,
              familyType: r.family_type || null,
              familyValues: r.family_values || null,
              diet: r.diet || null,
              smoking: r.smoking || null,
              drinking: r.drinking || null,
              disability: r.disability || null,
              email: r.email || null,
              mobile: revealContact ? (r.mobile_number || null) : null,
              maskedMobile: maskPhoneNumber(r.mobile_number),
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
        const cleanQuery = id.toLowerCase().trim();
        const hit = users.find(
          (u: { profileId?: string; mobileNumber?: string; mobile_number?: string; email?: string }) =>
            (u.profileId && u.profileId.toLowerCase().trim() === cleanQuery) ||
            (u.mobileNumber && u.mobileNumber.replace(/\D/g, '') === cleanQuery.replace(/\D/g, '')) ||
            (u.mobile_number && u.mobile_number.replace(/\D/g, '') === cleanQuery.replace(/\D/g, '')) ||
            (u.email && u.email.toLowerCase().trim() === cleanQuery)
        );
        if (hit) {
          // Ensure profileId is a guaranteed 4-digit ID
          if (!is4DigitId(hit.profileId)) {
            const allIds = users.map((u: { profileId?: string }) => u.profileId).filter(Boolean);
            hit.profileId = generateUnique4DigitId(allIds);
            try {
              fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
            } catch (err) {
              console.warn('Error updating profileId to 4-digit:', err);
            }
          }

          const rawMobile = hit.mobileNumber || hit.mobile_number || null;
          const isSelf = viewerId && (
            (hit.profileId && hit.profileId.toLowerCase() === viewerId.toLowerCase()) ||
            (rawMobile && rawMobile.replace(/\D/g, '') === viewerId.replace(/\D/g, '')) ||
            (hit.email && hit.email.toLowerCase() === viewerId.toLowerCase())
          );
          const revealContact = Boolean(isSelf || viewerIsPremium);

          const mem = resolveStatus(hit.membershipTier, hit.membershipExpiresAt);
          const hitDob = (h: { dob?: unknown; dateOfBirth?: unknown }): string | null => {
            const d = h.dob || h.dateOfBirth || null;
            if (!d) return null;
            if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
            const dt = new Date(String(d));
            return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
          };
          return NextResponse.json({
            success: true,
            profile: {
              id: normalizeId(hit.profileId),
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
              membership: {
                tier: mem.tier,
                isPremium: mem.isPremium,
                label: mem.plan?.badgeLabel || '',
              },
              dob: hitDob(hit),
              birthTime: hit.birthTime || null,
              birthPlace: hit.birthPlace || null,
              rashi: hit.rashi || null,
              nakshatra: hit.nakshatra || null,
              manglik: hit.manglik || null,
              gotra: hit.gotra || null,
              fatherOccupation: hit.fatherOccupation || null,
              motherOccupation: hit.motherOccupation || null,
              siblings: hit.siblings || null,
              familyType: hit.familyType || null,
              familyValues: hit.familyValues || null,
              diet: hit.diet || null,
              smoking: hit.smoking || null,
              drinking: hit.drinking || null,
              disability: hit.disability || null,
              email: hit.email || null,
              mobile: revealContact ? rawMobile : null,
              maskedMobile: maskPhoneNumber(rawMobile),
            } as PublicProfile,
          });
        }
      }
    } catch (e) {
      console.warn('Error reading scratch profile:', e);
    }

    return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
  } catch (e) {
    console.error('Error loading profile:', e);
    return NextResponse.json({ success: false, message: 'Failed to load profile' }, { status: 500 });
  }
}
