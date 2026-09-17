import fs from "fs";
import path from "path";
import { pool, hasPool, ensureProfilesTable } from "@/lib/db";

export type MembershipTier = "free" | "silver" | "gold" | "platinum";

export interface MembershipPlan {
  id: string;
  tier: MembershipTier;
  name: string;
  price: string;
  priceLabel: string;
  periodDays: number;
  periodLabel: string;
  features: string[];
  highlight: boolean;
  badgeLabel: string;
  // Limits (-1 = unlimited)
  contactCredits: number;
  interestsPerMonth: number;
  shortlistLimit: number;
  profilePhotos: number;
  profileBoostsPerMonth: number;
  profileViewsPerDay: number;
  messagesPerDay: number;
  canChat: boolean;
  canViewFullProfile: boolean;
  canSeeContactDetails: boolean;
  // Features
  featuredProfile: boolean;
  horoscopeMatching: boolean;
  compatibilityScore: boolean;
  profileVerification: boolean;
  incognitoBrowsing: boolean;
  aiMatchRecommendations: boolean;
  dailyMatchSuggestions: number;
  whatsappEmailAlerts: boolean;
  prioritySupport: boolean;
  dedicatedMatchmaking: boolean;
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "free",
    tier: "free",
    name: "Free",
    price: "₹0",
    priceLabel: "₹0",
    periodDays: 0,
    periodLabel: "forever",
    features: [
      "Create matrimonial profile",
      "Upload up to 3 photos",
      "Browse all profiles",
      "View 10 profiles/day",
      "Receive interests",
      "Send 5 interests/month",
      "Shortlist up to 10 profiles",
      "Basic privacy controls",
      "5 daily match suggestions",
    ],
    highlight: false,
    badgeLabel: "",
    contactCredits: 0,
    interestsPerMonth: 5,
    shortlistLimit: 10,
    profilePhotos: 3,
    profileBoostsPerMonth: 0,
    profileViewsPerDay: 10,
    messagesPerDay: 0,
    canChat: false,
    canViewFullProfile: false,
    canSeeContactDetails: false,
    featuredProfile: false,
    horoscopeMatching: false,
    compatibilityScore: false,
    profileVerification: false,
    incognitoBrowsing: false,
    aiMatchRecommendations: false,
    dailyMatchSuggestions: 5,
    whatsappEmailAlerts: false,
    prioritySupport: false,
    dedicatedMatchmaking: false,
  },
  {
    id: "silver",
    tier: "silver",
    name: "Silver",
    price: "₹499",
    priceLabel: "₹499",
    periodDays: 30,
    periodLabel: "/ month",
    features: [
      "Everything in Free",
      "View 50 profiles/day",
      "Chat with matches",
      "Send 50 interests/month",
      "View contact details (10/month)",
      "Profile verification",
      "See who viewed you",
      "See who shortlisted you",
      "20 daily match suggestions",
      "1 profile boost/month",
      "Email/WhatsApp alerts",
    ],
    highlight: false,
    badgeLabel: "Silver",
    contactCredits: 10,
    interestsPerMonth: 50,
    shortlistLimit: 50,
    profilePhotos: 10,
    profileBoostsPerMonth: 1,
    profileViewsPerDay: 50,
    messagesPerDay: 20,
    canChat: true,
    canViewFullProfile: true,
    canSeeContactDetails: false,
    featuredProfile: false,
    horoscopeMatching: false,
    compatibilityScore: false,
    profileVerification: true,
    incognitoBrowsing: false,
    aiMatchRecommendations: false,
    dailyMatchSuggestions: 20,
    whatsappEmailAlerts: true,
    prioritySupport: false,
    dedicatedMatchmaking: false,
  },
  {
    id: "gold",
    tier: "gold",
    name: "Gold",
    price: "₹999",
    priceLabel: "₹999",
    periodDays: 30,
    periodLabel: "/ month",
    features: [
      "Everything in Silver",
      "View unlimited profiles",
      "Unlimited chat messaging",
      "Unlimited interests",
      "View contact details (50/month)",
      "Horoscope matching",
      "Compatibility score",
      "AI-powered match recommendations",
      "50 daily match suggestions",
      "3 profile boosts/month",
      "Featured profile",
      "Incognito browsing",
      "Unlimited shortlisting",
      "Priority support",
    ],
    highlight: true,
    badgeLabel: "Gold ⭐",
    contactCredits: 50,
    interestsPerMonth: -1,
    shortlistLimit: -1,
    profilePhotos: 20,
    profileBoostsPerMonth: 3,
    profileViewsPerDay: -1,
    messagesPerDay: -1,
    canChat: true,
    canViewFullProfile: true,
    canSeeContactDetails: true,
    featuredProfile: true,
    horoscopeMatching: true,
    compatibilityScore: true,
    profileVerification: true,
    incognitoBrowsing: true,
    aiMatchRecommendations: true,
    dailyMatchSuggestions: 50,
    whatsappEmailAlerts: true,
    prioritySupport: true,
    dedicatedMatchmaking: false,
  },
  {
    id: "platinum",
    tier: "platinum",
    name: "Platinum",
    price: "₹1,999",
    priceLabel: "₹1,999",
    periodDays: 30,
    periodLabel: "/ month",
    features: [
      "Everything in Gold",
      "Unlimited profile views",
      "Unlimited messaging",
      "Unlimited contact views",
      "Unlimited match suggestions",
      "10 profile boosts/month",
      "Top placement in searches",
      "Premium/featured badge",
      "Priority profile verification",
      "Dedicated matchmaking assistance",
      "Personalized match recommendations",
      "Advanced compatibility analysis",
      "Priority customer support",
    ],
    highlight: false,
    badgeLabel: "Platinum 👑",
    contactCredits: -1,
    interestsPerMonth: -1,
    shortlistLimit: -1,
    profilePhotos: -1,
    profileBoostsPerMonth: 10,
    profileViewsPerDay: -1,
    messagesPerDay: -1,
    canChat: true,
    canViewFullProfile: true,
    canSeeContactDetails: true,
    featuredProfile: true,
    horoscopeMatching: true,
    compatibilityScore: true,
    profileVerification: true,
    incognitoBrowsing: true,
    aiMatchRecommendations: true,
    dailyMatchSuggestions: -1,
    whatsappEmailAlerts: true,
    prioritySupport: true,
    dedicatedMatchmaking: true,
  },
];

export interface MembershipStatus {
  tier: MembershipTier;
  expiresAt: string | null;
  isPremium: boolean;
  plan: MembershipPlan | null;
}

const USERS_FILE = path.join(process.cwd(), "scratch", "users_db.json");

function isTier(value: unknown): value is MembershipTier {
  return value === "free" || value === "silver" || value === "gold" || value === "platinum";
}

function badgeLabelFor(tier: MembershipTier): string {
  if (tier === "free") return "";
  const plan = MEMBERSHIP_PLANS.find((p) => p.tier === tier);
  return plan?.badgeLabel || tier;
}

function normalizeTier(value: unknown): MembershipTier {
  return isTier(value) ? value : "free";
}

// Resolves a stored expiry against "now"; expired tiers downgrade to free.
export function resolveStatus(tier: unknown, expiresAt: unknown): MembershipStatus {
  const t = normalizeTier(tier);
  if (t === "free") {
    return { tier: "free", expiresAt: null, isPremium: false, plan: null };
  }
  const exp = expiresAt instanceof Date ? expiresAt.toISOString() : typeof expiresAt === "string" ? expiresAt : null;
  if (exp && new Date(exp).getTime() <= Date.now()) {
    return { tier: "free", expiresAt: null, isPremium: false, plan: null };
  }
  const plan = MEMBERSHIP_PLANS.find((p) => p.tier === t) || null;
  return { tier: t, expiresAt: exp, isPremium: true, plan };
}

export async function getMembership(userId: string): Promise<MembershipStatus> {
  const id = (userId || "").toString().trim();
  if (!id) return resolveStatus("free", null);

  // 1. Postgres profiles
  if (hasPool) {
    try {
      await ensureProfilesTable();
      const { rows } = await pool!.query(
        `SELECT membership_tier, membership_expires_at
         FROM profiles
         WHERE user_id = $1 OR mobile_number = $1`,
        [id]
      );
      if (rows.length > 0) {
        return resolveStatus(rows[0].membership_tier, rows[0].membership_expires_at);
      }
    } catch (e) {
      console.warn("Error querying membership from Postgres:", e);
    }
  }

  // 2. Scratch users file
  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8") || "[]");
      const hit = users.find(
        (u: { profileId?: string; mobileNumber?: string; email?: string }) =>
          u.profileId === id || u.mobileNumber === id || u.email === id
      );
      if (hit) {
        return resolveStatus(hit.membershipTier, hit.membershipExpiresAt);
      }
    }
  } catch (e) {
    console.warn("Error reading scratch membership:", e);
  }

  return resolveStatus("free", null);
}

export async function upgradeMembership(
  userId: string,
  planId: string
): Promise<{ success: boolean; membership: MembershipStatus; message: string }> {
  const id = (userId || "").toString().trim();
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
  if (!id) {
    return { success: false, membership: resolveStatus("free", null), message: "Missing user id" };
  }
  if (!plan) {
    return { success: false, membership: resolveStatus("free", null), message: "Invalid plan" };
  }

  const tier = plan.tier;

  // Downgrade to free clears the membership.
  if (tier === "free") {
    if (hasPool) {
      try {
        await ensureProfilesTable();
        await pool!.query(
          `UPDATE profiles
           SET membership_tier = 'free', membership_expires_at = NULL
           WHERE user_id = $1 OR mobile_number = $1`,
        [id]
        );
      } catch (e) {
        console.warn("Error downgrading membership in Postgres:", e);
      }
    }
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8") || "[]");
        const hit = users.find(
          (u: { profileId?: string; mobileNumber?: string; email?: string }) =>
            u.profileId === id || u.mobileNumber === id || u.email === id
        );
        if (hit) {
          hit.membershipTier = "free";
          hit.membershipExpiresAt = null;
          hit.updatedAt = new Date().toISOString();
          fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
        }
      }
    } catch (e) {
      console.warn("Error downgrading membership in scratch:", e);
    }
    return { success: true, membership: resolveStatus("free", null), message: "Downgraded to Free plan" };
  }

  // Upgrade: extend from max(now, current expiry).
  const current = await getMembership(id);
  const base = current.isPremium && current.expiresAt ? new Date(current.expiresAt).getTime() : Date.now();
  const expiresAt = new Date(base + plan.periodDays * 24 * 60 * 60 * 1000).toISOString();

  if (hasPool) {
    try {
      await ensureProfilesTable();
      await pool!.query(
        `UPDATE profiles
         SET membership_tier = $2, membership_expires_at = $3
         WHERE user_id = $1 OR mobile_number = $1`,
      [id, tier, expiresAt]
      );
    } catch (e) {
      console.warn("Error upgrading membership in Postgres:", e);
    }
  }

  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8") || "[]");
      const hit = users.find(
        (u: { profileId?: string; mobileNumber?: string; email?: string }) =>
          u.profileId === id || u.mobileNumber === id || u.email === id
      );
      if (hit) {
        hit.membershipTier = tier;
        hit.membershipExpiresAt = expiresAt;
        hit.updatedAt = new Date().toISOString();
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
      }
    }
  } catch (e) {
    console.warn("Error upgrading membership in scratch:", e);
  }

  return { success: true, membership: resolveStatus(tier, expiresAt), message: `Upgraded to ${plan.name}` };
}

export function premiumLabel(tier: MembershipTier): string {
  return badgeLabelFor(tier);
}