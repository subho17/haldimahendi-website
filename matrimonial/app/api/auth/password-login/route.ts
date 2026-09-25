import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// POST /api/auth/password-login
// Body: { identifier, password }
// identifier = mobile number, email, or profile ID. Verifies the scrypt
// hash created at signup and returns the member profile on success.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = normalizeId(body.identifier).replace(/\s+/g, ' ');
    const password = String(body.password || '');

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide your email/mobile and password.' },
        { status: 400 }
      );
    }

    const cleanMobile = identifier.replace(/\D/g, '').slice(-10);
    const identifierMobile = cleanMobile.length >= 10 ? cleanMobile : '';
    const identifierEmail = identifier.toLowerCase();
    const identifierProfile = identifier;

    let profile: {
      id: string;
      name: string;
      mobileNumber: string;
      email?: string;
      avatarUrl?: string;
      gender?: string;
      maritalStatus?: string;
      city?: string;
    } | null = null;
    let passwordHash: string | null = null;
    let passwordSalt: string | null = null;

    // 1. Postgres profiles
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(
          `SELECT user_id, display_name, mobile_number, email, avatar_url,
                  gender, marital_status, city, password_hash, password_salt
           FROM profiles
           WHERE ($1 <> '' AND mobile_number = $1)
              OR (length($2) > 0 AND user_id = $2)
              OR (length($3) > 0 AND lower(email) = lower($3))
           LIMIT 1`,
          [identifierMobile, identifierProfile, identifierEmail]
        );
        if (rows.length > 0) {
          const r = rows[0];
          profile = {
            id: normalizeId(r.user_id || r.mobile_number),
            name: r.display_name || 'Member',
            mobileNumber: r.mobile_number || '',
            email: r.email || undefined,
            avatarUrl: r.avatar_url || undefined,
            gender: r.gender || undefined,
            maritalStatus: r.marital_status || undefined,
            city: r.city || undefined,
          };
          passwordHash = r.password_hash || null;
          passwordSalt = r.password_salt || null;
        }
      } catch (e) {
        console.warn('[PasswordLogin] Postgres lookup failed:', e);
      }
    }

    // 2. Scratch users file fallback
    if (!profile) {
      try {
        if (fs.existsSync(USERS_FILE)) {
          const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
          const hit = users.find((u: {
            profileId?: string;
            mobileNumber?: string;
            email?: string;
          }) => {
            const uMobile = u.mobileNumber ? u.mobileNumber.replace(/\D/g, '').slice(-10) : '';
            return (
              u.profileId === identifierProfile ||
              u.email?.toLowerCase() === identifierEmail ||
              (uMobile && uMobile === identifierMobile)
            );
          });
          if (hit) {
            profile = {
              id: normalizeId(hit.profileId || hit.mobileNumber || hit.email),
              name: hit.display_name || hit.name || 'Member',
              mobileNumber: hit.mobileNumber || '',
              email: hit.email || undefined,
              avatarUrl: hit.avatar_url || hit.avatarUrl || undefined,
              gender: hit.gender || undefined,
              maritalStatus: hit.maritalStatus || undefined,
              city: hit.city || undefined,
            };
            passwordHash = hit.passwordHash || null;
            passwordSalt = hit.passwordSalt || null;
          }
        }
      } catch (e) {
        console.warn('[PasswordLogin] Scratch lookup failed:', e);
      }
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'No account found with these details. Please sign up first.' },
        { status: 404 }
      );
    }

    if (!passwordHash || !passwordSalt) {
      return NextResponse.json(
        { success: false, message: 'This account has no password set. Please use Login with OTP.' },
        { status: 400 }
      );
    }

    const valid = await verifyPassword(password, passwordHash, passwordSalt);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // New login alert (fire-and-forget)
    if (profile.email) {
      import('@/lib/emailService').then(({ sendEmail, newLoginAlertEmail }) => {
        const tpl = newLoginAlertEmail();
        sendEmail({ to: profile!.email!, subject: tpl.subject, html: tpl.html }).catch(() => {});
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error in password login:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during login. Please try again.' },
      { status: 500 }
    );
  }
}
