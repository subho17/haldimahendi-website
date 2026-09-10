"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useMounted } from "@/hooks/useMounted";
import { is4DigitId, generateUnique4DigitId } from "@/lib/idGenerator";

export interface UserProfile {
  profileId: string;
  mobileNumber?: string;
  mobile_number?: string;
  email?: string;
  name: string;
  display_name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  provider?: "otp" | "password";
  gender?: string;
  age?: string | number;
  height?: string;
  maritalStatus?: string;
  religion?: string;
  motherTongue?: string;
  mother_tongue?: string;
  education?: string;
  profession?: string;
  city?: string;
  country?: string;
  bio?: string;
  verificationStatus?: string;
  verification_status?: string;
  isVerified?: boolean;
  createdAt?: string;
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

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (userData: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "haldimehendi_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();

  // Read from localStorage synchronously via lazy initializer (client only).
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedUser) return null;
      const parsed = JSON.parse(storedUser) as UserProfile;
      // Normalize alias keys
      const displayName = parsed.display_name || parsed.name || "Haldimehendi Member";
      const avatar = parsed.avatar_url || parsed.avatarUrl || "/images/default-avatar.png";
      const mobile = parsed.mobile_number || parsed.mobileNumber || "";
      const rawPId = parsed.profileId;
      const pId: string = is4DigitId(rawPId) ? rawPId : (rawPId === "9903797850" ? "4829" : generateUnique4DigitId());
      return {
        ...parsed,
        profileId: pId,
        name: displayName,
        display_name: displayName,
        avatarUrl: avatar,
        avatar_url: avatar,
        mobileNumber: mobile,
        mobile_number: mobile,
      };
    } catch (e) {
      console.error("Error reading auth state from localStorage:", e);
      return null;
    }
  });

  const isLoading = !mounted;

  const login = useCallback((userData: Partial<UserProfile>) => {
    const displayName = userData.display_name || userData.name || "Haldimehendi Member";
    const avatar = userData.avatar_url || userData.avatarUrl || "/images/default-avatar.png";
    const mobile = userData.mobile_number || userData.mobileNumber || "";

    const rawId = userData.profileId || user?.profileId;
    const pId: string = is4DigitId(rawId) ? rawId! : (rawId === "9903797850" ? "4829" : generateUnique4DigitId());

    const newUser: UserProfile = {
      ...(user || {}),
      ...userData,
      profileId: pId,
      mobileNumber: mobile,
      mobile_number: mobile,
      email: userData.email ?? user?.email ?? "",
      name: displayName,
      display_name: displayName,
      avatarUrl: avatar,
      avatar_url: avatar,
      provider: userData.provider || user?.provider || "otp",
      gender: userData.gender ?? user?.gender,
      age: userData.age ?? user?.age,
      height: userData.height ?? user?.height,
      maritalStatus: userData.maritalStatus ?? user?.maritalStatus,
      religion: userData.religion ?? user?.religion,
      motherTongue: userData.motherTongue ?? (userData as { mother_tongue?: string })?.mother_tongue ?? user?.motherTongue,
      education: userData.education ?? user?.education,
      profession: userData.profession ?? user?.profession,
      city: userData.city ?? user?.city,
      country: userData.country ?? user?.country ?? "India",
      bio: userData.bio ?? user?.bio,
      verificationStatus: userData.verificationStatus ?? (userData as { verification_status?: string })?.verification_status ?? user?.verificationStatus,
      isVerified: userData.isVerified ?? user?.isVerified,
      createdAt: userData.createdAt || user?.createdAt || new Date().toISOString(),
      dob: userData.dob ?? user?.dob,
      birthTime: userData.birthTime ?? user?.birthTime,
      birthPlace: userData.birthPlace ?? user?.birthPlace,
      rashi: userData.rashi ?? user?.rashi,
      nakshatra: userData.nakshatra ?? user?.nakshatra,
      manglik: userData.manglik ?? user?.manglik,
      gotra: userData.gotra ?? user?.gotra,
      fatherOccupation: userData.fatherOccupation ?? user?.fatherOccupation,
      motherOccupation: userData.motherOccupation ?? user?.motherOccupation,
      siblings: userData.siblings ?? user?.siblings,
      familyType: userData.familyType ?? user?.familyType,
      familyValues: userData.familyValues ?? user?.familyValues,
      diet: userData.diet ?? user?.diet,
      smoking: userData.smoking ?? user?.smoking,
      drinking: userData.drinking ?? user?.drinking,
      disability: userData.disability ?? user?.disability,
    };

    // 1. ALWAYS update React state first so user is immediately authenticated in memory
    setUser(newUser);

    // 2. Safely save to localStorage (with quota error protection for large Base64 images)
    try {
      const storageAvatar =
        avatar.startsWith("data:") && avatar.length > 5000
          ? "/images/default-avatar.png"
          : avatar;
      const userForStorage = {
        ...newUser,
        avatarUrl: storageAvatar,
        avatar_url: storageAvatar,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userForStorage));
    } catch (e) {
      console.warn("Failed to store user in localStorage:", e);
      try {
        const slimUser = { ...newUser, avatarUrl: "/images/default-avatar.png", avatar_url: "/images/default-avatar.png" };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(slimUser));
      } catch (err) {
        console.error("Critical: Could not write to localStorage:", err);
      }
    }

    // 3. Persist user profile to server backend database & Supabase
    fetch("/api/user/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    }).catch((err) => console.warn("Failed to sync user to server:", err));
  }, [user]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (e) {
      console.error("Failed to remove auth state:", e);
    }
  }, []);

  const isAuthenticated = user !== null;

  const value = useMemo(
    () => ({ isAuthenticated, user, isLoading, login, logout }),
    [isAuthenticated, user, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}