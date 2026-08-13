import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { saveProfile, ProfileData } from '@/lib/otpStore';

const USERS_FILE = path.join(process.cwd(), "scratch", "users_db.json");

interface UserRecord {
  profileId?: string;
  name?: string;
  email?: string;
  mobileNumber?: string;
  avatarUrl?: string;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
}

function ensureDbFile() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

export async function POST(req: Request) {
  try {
    const userData = await req.json() as UserRecord;
    ensureDbFile();

    let users: UserRecord[] = [];
    try {
      const fileData = fs.readFileSync(USERS_FILE, "utf-8");
      users = JSON.parse(fileData || "[]");
    } catch {
      users = [];
    }

    // Check if user exists by profileId or email or mobileNumber
    const existingIndex = users.findIndex(
      (u: UserRecord) =>
        (userData.profileId && u.profileId === userData.profileId) ||
        (userData.email && u.email === userData.email) ||
        (userData.mobileNumber && u.mobileNumber === userData.mobileNumber && userData.mobileNumber.length > 5)
    );

    const updatedUser: UserRecord = {
      profileId: userData.profileId || `SH${Math.floor(100000 + Math.random() * 900000)}`,
      name: userData.name || "Member",
      email: userData.email || "",
      mobileNumber: userData.mobileNumber || "",
      avatarUrl: userData.avatarUrl || "/images/default-avatar.png",
      provider: userData.provider || "google",
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...updatedUser };
    } else {
      updatedUser.createdAt = userData.createdAt || new Date().toISOString();
      users.push(updatedUser);
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    // ✅ Also save to Supabase Postgres (profile + photo URL stored)
    try {
      const profileData: ProfileData = {
        userId: userData.mobileNumber || userData.email || 'unknown',
        displayName: userData.name || 'Member',
        mobileNumber: userData.mobileNumber || '',
        avatarUrl: userData.avatarUrl || '/images/default-avatar.png',
        provider: userData.provider as 'otp' | 'google' | 'password' || 'otp',
      };
      await saveProfile(profileData);
    } catch (e) {
      console.warn('Failed to save profile to DB:', e);
    }

    return NextResponse.json({
      success: true,
      message: "User profile stored successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to store user profile" },
      { status: 500 }
    );
  }
}
