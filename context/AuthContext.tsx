"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserProfile {
  profileId: string;
  mobileNumber?: string;
  email?: string;
  name: string;
  avatarUrl?: string;
  provider?: "google" | "facebook" | "otp" | "password";
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Read localStorage ONLY after component mounts on client side to prevent hydration mismatch
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser) as UserProfile);
      }
    } catch (e) {
      console.error("Error reading auth state from localStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      profileId: userData.profileId || `SH${Math.floor(100000 + Math.random() * 900000)}`,
      mobileNumber: userData.mobileNumber || "",
      email: userData.email || "",
      name: userData.name || "Shaadi Member",
      avatarUrl: userData.avatarUrl || "/images/default-avatar.png",
      provider: userData.provider || "google",
      createdAt: userData.createdAt || new Date().toISOString(),
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);

      // Persist user profile to server backend database
      fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      }).catch((err) => console.warn("Failed to sync user to server:", err));
    } catch (e) {
      console.error("Failed to save auth state:", e);
    }
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