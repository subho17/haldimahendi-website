import fs from "fs";
import path from "path";
import { pool, hasPool, ensureProfilesTable } from "@/lib/db";
import { getMembership, MEMBERSHIP_PLANS, type MembershipTier } from "@/lib/membershipStore";

const USAGE_FILE = path.join(process.cwd(), "scratch", "usage_db.json");

export interface UsageRecord {
  userId: string;
  interestsSent: number;
  interestsResetAt: string;
  shortlistsUsed: number;
  shortlistsResetAt: string;
  photosUploaded: number;
  matchesReturnedToday: number;
  matchesResetDate: string;
}

interface UsageDb {
  [userId: string]: UsageRecord;
}

function readUsageDb(): UsageDb {
  try {
    if (fs.existsSync(USAGE_FILE)) {
      return JSON.parse(fs.readFileSync(USAGE_FILE, "utf-8") || "{}");
    }
  } catch {}
  return {};
}

function writeUsageDb(db: UsageDb): void {
  const dir = path.dirname(USAGE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(USAGE_FILE, JSON.stringify(db, null, 2));
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function ensureRecord(db: UsageDb, userId: string): UsageRecord {
  const monthKey = getMonthKey();
  const dayKey = getDayKey();

  if (!db[userId]) {
    db[userId] = {
      userId,
      interestsSent: 0,
      interestsResetAt: monthKey,
      shortlistsUsed: 0,
      shortlistsResetAt: monthKey,
      photosUploaded: 0,
      matchesReturnedToday: 0,
      matchesResetDate: dayKey,
    };
  }

  const rec = db[userId];
  if (rec.interestsResetAt !== monthKey) {
    rec.interestsSent = 0;
    rec.interestsResetAt = monthKey;
  }
  if (rec.shortlistsResetAt !== monthKey) {
    rec.shortlistsUsed = 0;
    rec.shortlistsResetAt = monthKey;
  }
  if (rec.matchesResetDate !== dayKey) {
    rec.matchesReturnedToday = 0;
    rec.matchesResetDate = dayKey;
  }

  return rec;
}

function getPlanLimits(tier: MembershipTier) {
  const plan = MEMBERSHIP_PLANS.find((p) => p.tier === tier);
  if (!plan) return { interestsPerMonth: 5, shortlistLimit: 10, profilePhotos: 3, dailyMatchSuggestions: 5 };
  return {
    interestsPerMonth: plan.interestsPerMonth,
    shortlistLimit: plan.shortlistLimit,
    profilePhotos: plan.profilePhotos,
    dailyMatchSuggestions: plan.dailyMatchSuggestions,
  };
}

function isUnlimited(val: number): boolean {
  return val === -1 || val === 0;
}

export async function canSendInterest(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; upgradeRequired: boolean }> {
  const { tier } = await getMembership(userId);
  const limits = getPlanLimits(tier);

  if (isUnlimited(limits.interestsPerMonth)) {
    return { allowed: true, remaining: -1, limit: -1, upgradeRequired: false };
  }

  const db = readUsageDb();
  const rec = ensureRecord(db, userId);
  writeUsageDb(db);

  const remaining = limits.interestsPerMonth - rec.interestsSent;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: limits.interestsPerMonth,
    upgradeRequired: remaining <= 0 && tier === "free",
  };
}

export async function recordInterestSent(userId: string): Promise<void> {
  const db = readUsageDb();
  const rec = ensureRecord(db, userId);
  rec.interestsSent += 1;
  writeUsageDb(db);
}

export async function canShortlist(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; upgradeRequired: boolean }> {
  const { tier } = await getMembership(userId);
  const limits = getPlanLimits(tier);

  if (isUnlimited(limits.shortlistLimit)) {
    return { allowed: true, remaining: -1, limit: -1, upgradeRequired: false };
  }

  const db = readUsageDb();
  const rec = ensureRecord(db, userId);
  writeUsageDb(db);

  const remaining = limits.shortlistLimit - rec.shortlistsUsed;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: limits.shortlistLimit,
    upgradeRequired: remaining <= 0 && tier === "free",
  };
}

export async function recordShortlist(userId: string): Promise<void> {
  const db = readUsageDb();
  const rec = ensureRecord(db, userId);
  rec.shortlistsUsed += 1;
  writeUsageDb(db);
}

export async function canUploadPhoto(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; upgradeRequired: boolean }> {
  const { tier } = await getMembership(userId);
  const limits = getPlanLimits(tier);

  if (isUnlimited(limits.profilePhotos)) {
    return { allowed: true, remaining: -1, limit: -1, upgradeRequired: false };
  }

  const db = readUsageDb();
  const rec = ensureRecord(db, userId);
  writeUsageDb(db);

  const remaining = limits.profilePhotos - rec.photosUploaded;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: limits.profilePhotos,
    upgradeRequired: remaining <= 0 && tier === "free",
  };
}

export async function recordPhotoUploaded(userId: string): Promise<void> {
  const db = readUsageDb();
  const rec = ensureRecord(db, userId);
  rec.photosUploaded += 1;
  writeUsageDb(db);
}

export async function getMatchLimit(userId: string): Promise<{ limit: number; remaining: number }> {
  const { tier } = await getMembership(userId);
  const limits = getPlanLimits(tier);

  if (isUnlimited(limits.dailyMatchSuggestions)) {
    return { limit: -1, remaining: -1 };
  }

  const db = readUsageDb();
  const rec = ensureRecord(db, userId);
  writeUsageDb(db);

  return {
    limit: limits.dailyMatchSuggestions,
    remaining: Math.max(0, limits.dailyMatchSuggestions - rec.matchesReturnedToday),
  };
}

export async function recordMatchesReturned(userId: string, count: number): Promise<void> {
  const db = readUsageDb();
  const rec = ensureRecord(db, userId);
  rec.matchesReturnedToday += count;
  writeUsageDb(db);
}

export async function getUsageSummary(userId: string) {
  const { tier, isPremium } = await getMembership(userId);
  const limits = getPlanLimits(tier);
  const db = readUsageDb();
  const rec = ensureRecord(db, userId);
  writeUsageDb(db);

  return {
    tier,
    isPremium,
    interests: {
      used: rec.interestsSent,
      limit: limits.interestsPerMonth,
      remaining: isUnlimited(limits.interestsPerMonth) ? -1 : Math.max(0, limits.interestsPerMonth - rec.interestsSent),
    },
    shortlists: {
      used: rec.shortlistsUsed,
      limit: limits.shortlistLimit,
      remaining: isUnlimited(limits.shortlistLimit) ? -1 : Math.max(0, limits.shortlistLimit - rec.shortlistsUsed),
    },
    photos: {
      used: rec.photosUploaded,
      limit: limits.profilePhotos,
      remaining: isUnlimited(limits.profilePhotos) ? -1 : Math.max(0, limits.profilePhotos - rec.photosUploaded),
    },
    matches: {
      used: rec.matchesReturnedToday,
      limit: limits.dailyMatchSuggestions,
      remaining: isUnlimited(limits.dailyMatchSuggestions) ? -1 : Math.max(0, limits.dailyMatchSuggestions - rec.matchesReturnedToday),
    },
  };
}
