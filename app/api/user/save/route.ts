import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { saveProfile, ProfileData } from '@/lib/otpStore';
import { hashPassword } from '@/lib/password';

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
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  createdAt?: string;
  updatedAt?: string;
  dob?: string;
  birthTime?: string;
  birthPlace?: string;
  rashi?: string;
  nakshatra?: string;
  manglik?: string;
  gotra?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: string;
  familyType?: string;
  familyValues?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  disability?: string;
}

function ensureDbFile() {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    }
  } catch {
    // Read-only filesystem in serverless environments
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

    // Hash the password (if provided) — never store it in plaintext.
    let passwordHash: string | undefined;
    let passwordSalt: string | undefined;
    if (userData.password && userData.password.length >= 6) {
      const hashed = await hashPassword(userData.password);
      passwordHash = hashed.hash;
      passwordSalt = hashed.salt;
    } else if (userData.password) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

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

    // Store the derived hash/salt alongside the record, then strip them and
    // the plaintext password from what is persisted/sent back to the client.
    const storedRecord: UserRecord = { ...updatedUser, passwordHash, passwordSalt };
    delete updatedUser.password;
    delete storedRecord.password;

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...storedRecord };
    } else {
      storedRecord.createdAt = userData.createdAt || new Date().toISOString();
      users.push(storedRecord);
    }

    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (e) {
      console.warn("Could not write users file (read-only filesystem):", e);
    }

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
        passwordHash,
        passwordSalt,
        dob: userData.dob,
        birthTime: userData.birthTime,
        birthPlace: userData.birthPlace,
        rashi: userData.rashi,
        nakshatra: userData.nakshatra,
        manglik: userData.manglik,
        gotra: userData.gotra,
        fatherOccupation: userData.fatherOccupation,
        motherOccupation: userData.motherOccupation,
        siblings: userData.siblings,
        familyType: userData.familyType,
        familyValues: userData.familyValues,
        diet: userData.diet,
        smoking: userData.smoking,
        drinking: userData.drinking,
        disability: userData.disability,
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
