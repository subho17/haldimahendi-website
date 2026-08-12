"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore } from "react";

export interface UserProfile {
  profileId: string;
  mobileNumber: string;
  name: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (userData: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "shaadi_auth_user";

// Cached snapshots — must return stable references to avoid React infinite loops
let cachedUser: UserProfile | null = null;
const serverSnapshot: UserProfile | null = null;

function readFromStorage(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as UserProfile) : null;
  } catch {
    return null;
  }
}

function refreshCache() {
  cachedUser = readFromStorage();
  return cachedUser;
}

function readStoredUser(): UserProfile | null {
  return cachedUser;
}

function subscribe(onStoreChange: () => void) {
  refreshCache();
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, readStoredUser, () => serverSnapshot);
  const isAuthenticated = user !== null;

  const login = useCallback((userData: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      profileId: userData.profileId || `SH${Math.floor(100000 + Math.random() * 900000)}`,
      mobileNumber: userData.mobileNumber || "9876543210",
      name: userData.name || "Shaadi Member",
      avatarUrl: userData.avatarUrl || "/images/default-avatar.png",
    };
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      refreshCache();
      notify();
    } catch (e) {
      console.error("Failed to save auth state:", e);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      refreshCache();
      notify();
    } catch (e) {
      console.error("Failed to remove auth state:", e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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