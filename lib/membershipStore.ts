import fs from "fs";
import path from "path";
import { pool, hasPool, ensureProfilesTable } from "@/lib/db";

export type MembershipTier = "free" | "premium" | "premium_plus";

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
      "Unlimited matching",
      "Send & accept interests",
      "Real-time chat with connections",
      "Personal profile & photo upload",
      "Basic search",
    ],
    highlight: false,
    badgeLabel: "",
  },
  {
    id: "premium",
    tier: "premium",
    name: "Premium",
    price: "₹999",
    priceLabel: "₹999",
    periodDays: 90,
    periodLabel: "/ 3 months",
    features: [
      "Everything in Free",
      "View member contact details",
      "See who viewed your profile",
      "Chat priority support",
      "Profile highlighted in search",
      "Ad-free experience",
    ],
    highlight: true,
    badgeLabel: "Premium",
  },
  {
    id: "premium_plus",
    tier: "premium_plus",
    name: "Premium Plus",
    price: "₹2,499",
    priceLabel: "₹2,499",
    periodDays: 365,
    periodLabel: "/ 12 months",
    features: [
      "Everything in Premium",
      "Personal matchmaking manager",
      "Advanced astro & kundli matching",
      "Profile boost twice a month",
      "Dedicated support line",
    ],
    highlight: false,
    badgeLabel: "Premium Plus",
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
  return value === "free" || value === "premium" || value === "premium_plus";
}

function badgeLabelFor(tier: MembershipTier): string {
  if (tier === "free") return "";
  const plan = MEMBERSHIP_PLANS.find((p) => p.tier === tier);
  return plan?.badgeLabel || tier.replace("_", " ");
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