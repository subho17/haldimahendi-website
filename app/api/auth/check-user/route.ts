import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

// POST /api/auth/check-user
// Body: { mobileNumber?: string, email?: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobileNumber, email } = body;

    const cleanMobile = mobileNumber ? mobileNumber.replace(/\D/g, '').slice(-10) : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanMobile && !cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Provide a mobile number or email to check' },
        { status: 400 }
      );
    }

    // 1. Check local JSON database
    let localFoundUser = null;
    try {
      if (fs.existsSync(USERS_FILE)) {
        const fileData = fs.readFileSync(USERS_FILE, 'utf-8');
        const users = JSON.parse(fileData || '[]');
        localFoundUser = users.find((u: { mobileNumber?: string; email?: string }) => {
          const uMobile = u.mobileNumber ? u.mobileNumber.replace(/\D/g, '').slice(-10) : '';
          const uEmail = u.email ? u.email.trim().toLowerCase() : '';
          return (cleanMobile && uMobile === cleanMobile) || (cleanEmail && uEmail && uEmail === cleanEmail);
        });
      }
    } catch (e) {
      console.warn('Error checking local users db:', e);
    }

    // 2. Check Postgres DB if available
    let dbFoundUser = null;
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(
          `SELECT user_id, display_name, mobile_number, avatar_url, provider
           FROM profiles
           WHERE (mobile_number = $1 AND length($1) > 5) OR (user_id = $2 AND length($2) > 0)`,
          [cleanMobile, cleanEmail]
        );
        if (rows.length > 0) {
          dbFoundUser = rows[0];
        }
      } catch (e) {
        console.warn('Error querying profiles table for check-user:', e);
      }
    }

    const existingUser = dbFoundUser || localFoundUser;

    if (existingUser) {
      return NextResponse.json({
        success: true,
        exists: true,
        message: 'Account already registered with this credential.',
        user: {
          name: existingUser.display_name || existingUser.name || 'Registered Member',
          mobileNumber: existingUser.mobile_number || existingUser.mobileNumber,
          email: existingUser.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      exists: false,
      message: 'User does not exist. Ready for registration.',
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json(
      { success: false, message: 'Server error checking user availability' },
      { status: 500 }
    );
  }
}
