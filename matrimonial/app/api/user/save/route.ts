import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { saveProfile, ProfileData } from '@/lib/otpStore';
import { hashPassword } from '@/lib/password';
import { generateUnique4DigitId, is4DigitId } from "@/lib/idGenerator";
import { savePreferences, loadPreferences } from '@/lib/prefsStore';
import { invalidateCache } from '@/lib/cache';
import { sendWelcomeEmail } from '@/lib/email';

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
    const cleanMobile = (userData.mobileNumber || userData.mobile_number || "").replace(/\D/g, "");
    const cleanEmail = (userData.email || "").toLowerCase().trim();

    const existingIndex = users.findIndex(
      (u: UserRecord) =>
        (userData.profileId && u.profileId === userData.profileId) ||
        (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) ||
        (cleanMobile && cleanMobile.length >= 10 && (
          (u.mobileNumber && u.mobileNumber.replace(/\D/g, "") === cleanMobile) ||
          (u.mobile_number && u.mobile_number.replace(/\D/g, "") === cleanMobile)
        ))
    );

    const existingProfileId = existingIndex >= 0 ? users[existingIndex].profileId : undefined;
    let finalProfileId = userData.profileId || existingProfileId;
    if (!is4DigitId(finalProfileId)) {
      const allExistingIds = users.map((u) => u.profileId).filter(Boolean) as string[];
      finalProfileId = generateUnique4DigitId(allExistingIds);
    }

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
      profileId: finalProfileId,
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
        userId: updatedUser.profileId || 'unknown',
        displayName,
        mobileNumber: mobile,
        email: cleanEmail || userData.email || undefined,
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

    // Ensure partner preferences align with the updated profile gender in DB
    try {
      const pId = updatedUser.profileId;
      if (pId && userData.gender) {
        const isGroom = ['groom', 'man', 'male'].includes(userData.gender.toLowerCase());
        const expectedPartnerGender = isGroom ? 'Woman' : 'Man';
        const existingPrefs = await loadPreferences(pId);

        // Update partner preferences so matching immediately reflects the updated gender role
        await savePreferences({
          ...(existingPrefs || {}),
          userId: pId,
          partnerGender: expectedPartnerGender,
          ageMin: existingPrefs?.ageMin ?? (isGroom ? 18 : 21),
          ageMax: existingPrefs?.ageMax ?? (isGroom ? 35 : 40),
        });

        // Invalidate feed cache for this user so fresh opposite-gender matches appear immediately
        invalidateCache(`feed:${pId}`);
        if (pId) invalidateCache(`feed:${pId.toLowerCase()}`);
        if (userData.mobileNumber) invalidateCache(`feed:${userData.mobileNumber.replace(/\D/g, '')}`);
        if (userData.email) invalidateCache(`feed:${userData.email.toLowerCase()}`);
      }
    } catch (prefErr) {
      console.warn('Failed to update partner preferences on gender change:', prefErr);
    }

    // Send welcome email on new profile creation (fire-and-forget)
    const isNewProfile = existingIndex < 0;
    if (isNewProfile && updatedUser.email) {
      sendWelcomeEmail(updatedUser.email, updatedUser.name || updatedUser.display_name || 'Member').catch((e) => console.warn('[Welcome Email] async failed:', e));
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
