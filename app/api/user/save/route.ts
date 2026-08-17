import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { saveProfile, ProfileData } from '@/lib/otpStore';

const USERS_FILE = path.join(process.cwd(), "scratch", "users_db.json");

interface UserRecord {
  profileId?: string;
  name?: string;
  display_name?: string;
  email?: string;
  mobileNumber?: string;
  mobile_number?: string;
  avatarUrl?: string;
  avatar_url?: string;
  provider?: string;
  gender?: string;
  age?: number;
  height?: string;
  maritalStatus?: string;
  religion?: string;
  motherTongue?: string;
  education?: string;
  profession?: string;
  city?: string;
  bio?: string;
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
        (userData.email && u.email && u.email === userData.email) ||
        (userData.mobileNumber && u.mobileNumber && u.mobileNumber === userData.mobileNumber && userData.mobileNumber.length > 5)
    );

    const displayName = userData.name || userData.display_name || "Member";
    const avatar = userData.avatarUrl || userData.avatar_url || "/images/default-avatar.png";
    const mobile = userData.mobileNumber || userData.mobile_number || "";

    const updatedUser: UserRecord = {
      ...userData,
      profileId: userData.profileId || `SH${Math.floor(100000 + Math.random() * 900000)}`,
      name: displayName,
      display_name: displayName,
      email: userData.email || "",
      mobileNumber: mobile,
      mobile_number: mobile,
      avatarUrl: avatar,
      avatar_url: avatar,
      provider: userData.provider || "otp",
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...updatedUser };
    } else {
      updatedUser.createdAt = userData.createdAt || new Date().toISOString();
      users.push(updatedUser);
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    // ✅ Also save to Supabase Postgres (profile + matrimonial details)
    try {
      const profileData: ProfileData = {
        userId: mobile || userData.email || updatedUser.profileId || 'unknown',
        displayName,
        mobileNumber: mobile,
        avatarUrl: avatar,
        provider: (userData.provider as 'otp' | 'google' | 'password') || 'otp',
        gender: userData.gender,
        age: userData.age ? Number(userData.age) : undefined,
        height: userData.height,
        maritalStatus: userData.maritalStatus,
        religion: userData.religion,
        motherTongue: userData.motherTongue,
        education: userData.education,
        profession: userData.profession,
        city: userData.city,
        bio: userData.bio,
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
