import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import { verifyOtp } from '@/lib/otpStore';
import { hashPassword } from '@/lib/password';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

// POST /api/auth/reset-password
// Body: { mobileNumber, otp, newPassword }
// Verifies the mobile OTP (same store used by login/signup), then hashes and
// stores the new password for the matching account.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mobileNumber = String(body.mobileNumber || '');
    const otp = String(body.otp || '').trim();
    const newPassword = String(body.newPassword || '');

    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const otpResult = await verifyOtp(cleanMobile, otp);
    if (!otpResult.valid) {
      return NextResponse.json(
        { success: false, message: otpResult.reason || 'Invalid OTP code.' },
        { status: 400 }
      );
    }

    const { hash, salt } = await hashPassword(newPassword);

    // 1. Check the account exists (Postgres first, then scratch file).
    let foundInDb = false;
    if (hasPool) {
      try {
        await ensureProfilesTable();
        const { rows } = await pool!.query(
          `UPDATE profiles
           SET password_hash = $2, password_salt = $3, updated_at = now()
           WHERE mobile_number = $1 OR user_id = $1
           RETURNING user_id`,
          [cleanMobile, hash, salt]
        );
        foundInDb = rows.length > 0;
      } catch (e) {
        console.warn('[ResetPassword] Postgres update failed:', e);
      }
    }

    let foundInFile = false;
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
        const idx = users.findIndex((u: { mobileNumber?: string; profileId?: string }) => {
          const uMobile = u.mobileNumber ? u.mobileNumber.replace(/\D/g, '').slice(-10) : '';
          return uMobile === cleanMobile || u.profileId === cleanMobile;
        });
        if (idx >= 0) {
          users[idx].passwordHash = hash;
          users[idx].passwordSalt = salt;
          users[idx].updatedAt = new Date().toISOString();
          foundInFile = true;
        }
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      }
    } catch (e) {
      console.warn('[ResetPassword] Scratch update failed:', e);
    }

    if (!foundInDb && !foundInFile) {
      return NextResponse.json(
        { success: false, message: 'No account found for this mobile number. Please sign up first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, message: 'Server error resetting password. Please try again.' },
      { status: 500 }
    );
  }
}