"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useMounted } from "@/hooks/useMounted";

export interface UserProfile {
  profileId: string;
  mobileNumber?: string;
  mobile_number?: string;
  email?: string;
  name: string;
  display_name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  provider?: "google" | "facebook" | "otp" | "password";
  gender?: string;
  maritalStatus?: string;
  city?: string;
  createdAt?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (userData: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "shaadi_auth_user";

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
      const displayName = parsed.display_name || parsed.name || "Shaadi Member";
      const avatar = parsed.avatar_url || parsed.avatarUrl || "/images/default-avatar.png";
      const mobile = parsed.mobile_number || parsed.mobileNumber || "";
      return {
        ...parsed,
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
    const displayName = userData.display_name || userData.name || "Shaadi Member";
    const avatar = userData.avatar_url || userData.avatarUrl || "/images/default-avatar.png";
    const mobile = userData.mobile_number || userData.mobileNumber || "";

    const newUser: UserProfile = {
      profileId: userData.profileId || `SH${Math.floor(100000 + Math.random() * 900000)}`,
      mobileNumber: mobile,
      mobile_number: mobile,
      email: userData.email || "",
      name: displayName,
      display_name: displayName,
      avatarUrl: avatar,
      avatar_url: avatar,
      provider: userData.provider || "otp",
      gender: userData.gender,
      maritalStatus: userData.maritalStatus,
      city: userData.city,
      createdAt: userData.createdAt || new Date().toISOString(),
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
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (e) {
      console.error("Failed to remove auth state:", e);
    }
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
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