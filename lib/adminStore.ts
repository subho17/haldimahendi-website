import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';
import { getMembership } from '@/lib/membershipStore';
import { listReports } from '@/lib/reportStore';
import { listVerifications } from '@/lib/verifyStore';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');

const ACTIVE_DAYS = 7;

export interface AdminMember {
  id: string;
  name: string;
  mobile: string;
  email: string;
  avatarUrl: string;
  gender?: string;
  city?: string;
  age?: number;
  provider?: string;
  verified: boolean;
  membership: string;
  isPremium: boolean;
  isSuspended: boolean;
  lastActive?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalMembers: number;
  verifiedMembers: number;
  premiumMembers: number;
  suspendedMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  newThisMonth: number;
  pendingVerifications: number;
  openReports: number;
}

export interface AdminAnalytics {
  signupsByMonth: { label: string; count: number }[];
  genderSplit: { label: string; count: number }[];
  topCities: { label: string; count: number }[];
  ageBuckets: { label: string; count: number }[];
  activeMembers: number;
  inactiveMembers: number;
  newThisMonth: number;
  premiumConversionRate: number;
}

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

function iso(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  try {
    const d = new Date(v as string | number | Date);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString();
  } catch {
    return '';
  }
}

function isActive(lastActive?: string, createdAt?: string): boolean {
  const cutoff = Date.now() - ACTIVE_DAYS * 24 * 60 * 60 * 1000;
  const t = lastActive ? new Date(lastActive).getTime() : 0;
  if (!Number.isNaN(t) && t > cutoff) return true;
  if (t === 0 && createdAt) {
    const c = new Date(createdAt).getTime();
    if (!Number.isNaN(c) && c > cutoff) return true;
  }
  return false;
}

// ------------------------------------------------------------------
// Activity heartbeat
// ------------------------------------------------------------------
export async function touchActivity(userId: string): Promise<void> {
  const id = normalizeId(userId);
  if (!id) return;

  if (hasPool) {
    try {
      await ensureProfilesTable();
      await pool!.query(
        `UPDATE profiles SET last_active_at = now() WHERE user_id = $1 OR mobile_number = $1`,
        [id]
      );
    } catch (e) {
      console.warn('[Admin] DB touchActivity failed, falling back to file:', e);
    }
  }

  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
      const hit = users.find(
        (u: { profileId?: string; mobileNumber?: string; mobile_number?: string; email?: string }) =>
          u.profileId === id || u.mobileNumber === id || u.mobile_number === id || u.email === id
      );
      if (hit) {
        hit.lastActiveAt = new Date().toISOString();
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
      }
    }
  } catch (e) {
    console.warn('[Admin] Scratch touchActivity failed:', e);
  }
}

// ------------------------------------------------------------------
// Suspension
// ------------------------------------------------------------------
export async function setSuspension(userId: string, suspended: boolean): Promise<boolean> {
  const id = normalizeId(userId);
  if (!id) return false;

  if (hasPool) {
    try {
      await ensureProfilesTable();
      await pool!.query(
        `UPDATE profiles SET is_suspended = $2, updated_at = now() WHERE user_id = $1 OR mobile_number = $1`,
        [id, suspended]
      );
    } catch (e) {
      console.warn('[Admin] DB suspension update failed, falling back to file:', e);
    }
  }

  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
      const hit = users.find(
        (u: { profileId?: string; mobileNumber?: string; mobile_number?: string; email?: string }) =>
          u.profileId === id || u.mobileNumber === id || u.mobile_number === id || u.email === id
      );
      if (hit) {
        hit.isSuspended = suspended;
        hit.updatedAt = new Date().toISOString();
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
        return true;
      }
    }
  } catch (e) {
    console.warn('[Admin] Scratch suspension update failed:', e);
  }

  return true;
}

// ------------------------------------------------------------------
// Member list
// ------------------------------------------------------------------
async function readPgMembers(): Promise<AdminMember[]> {
  await ensureProfilesTable();
  const { rows } = await pool!.query(`
    SELECT user_id, display_name, mobile_number, email, avatar_url, gender, age, city,
           provider, verification_status, membership_tier, membership_expires_at, is_suspended, last_active_at, created_at
    FROM profiles
    ORDER BY created_at DESC
  `);
  return rows.map((r) => {
    const premium =
      r.membership_tier &&
      r.membership_tier !== 'free' &&
      (!r.membership_expires_at || new Date(r.membership_expires_at).getTime() > Date.now());
    const lastActive = iso(r.last_active_at);
    const createdAt = iso(r.created_at);
    return {
      id: normalizeId(r.user_id),
      name: r.display_name || 'Member',
      mobile: r.mobile_number || '',
      email: r.email || '',
      avatarUrl: r.avatar_url || '/images/default-avatar.png',
      gender: r.gender,
      city: r.city,
      age: r.age,
      provider: r.provider,
      verified: r.verification_status === 'approved',
      membership: premium ? (r.membership_tier === 'premium_plus' ? 'Premium Plus' : 'Premium') : 'Free',
      isPremium: !!premium,
      isSuspended: !!r.is_suspended,
      lastActive,
      isActive: isActive(lastActive, createdAt),
      createdAt,
    };
  });
}

function readScratchMembers(): AdminMember[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
  return users
    .map((u: {
      profileId?: string;
      display_name?: string;
      name?: string;
      mobileNumber?: string;
      mobile_number?: string;
      email?: string;
      avatar_url?: string;
      avatarUrl?: string;
      gender?: string;
      age?: number;
      city?: string;
      provider?: string;
      verificationStatus?: string;
      membershipTier?: string;
      membershipExpiresAt?: string;
      isSuspended?: boolean;
      lastActiveAt?: string;
      createdAt?: string;
    }) => {
      const premium =
        u.membershipTier &&
        u.membershipTier !== 'free' &&
        (!u.membershipExpiresAt || new Date(u.membershipExpiresAt).getTime() > Date.now());
      const lastActive = u.lastActiveAt || '';
      const createdAt = u.createdAt || '';
      return {
        id: normalizeId(u.profileId || u.mobileNumber || u.mobile_number || u.email),
        name: u.display_name || u.name || 'Member',
        mobile: u.mobileNumber || u.mobile_number || '',
        email: u.email || '',
        avatarUrl: u.avatar_url || u.avatarUrl || '/images/default-avatar.png',
        gender: u.gender,
        city: u.city,
        age: u.age,
        provider: u.provider,
        verified: u.verificationStatus === 'approved',
        membership: premium ? (u.membershipTier === 'premium_plus' ? 'Premium Plus' : 'Premium') : 'Free',
        isPremium: !!premium,
        isSuspended: !!u.isSuspended,
        lastActive,
        isActive: isActive(lastActive, createdAt),
        createdAt,
      };
    })
    .filter((m: AdminMember) => m.id);
}

export async function listMembers(query?: string): Promise<AdminMember[]> {
  let members: AdminMember[] = [];

  if (hasPool) {
    try {
      members = await readPgMembers();
    } catch (e) {
      console.warn('[Admin] PG member list failed, falling back to file:', e);
      members = [];
    }
  }
  if (members.length === 0) {
    members = readScratchMembers();
  }

  const q = (query || '').toString().trim().toLowerCase();
  if (q) {
    members = members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.city || '').toLowerCase().includes(q)
    );
  }

  return members;
}

// ------------------------------------------------------------------
// Stats + analytics
// ------------------------------------------------------------------
export async function getAdminStats(): Promise<AdminStats> {
  const members = await listMembers();
  const reports = await listReports('open');
  let pendingVerifications = 0;
  try {
    pendingVerifications = (await listVerifications('pending')).length;
  } catch (e) {
    console.warn('[Admin] Could not count pending verifications:', e);
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartMs = monthStart.getTime();

  return {
    totalMembers: members.length,
    verifiedMembers: members.filter((m) => m.verified).length,
    premiumMembers: members.filter((m) => m.isPremium).length,
    suspendedMembers: members.filter((m) => m.isSuspended).length,
    activeMembers: members.filter((m) => m.isActive && !m.isSuspended).length,
    inactiveMembers: members.filter((m) => !m.isActive).length,
    newThisMonth: members.filter((m) => {
      const t = new Date(m.createdAt).getTime();
      return !Number.isNaN(t) && t >= monthStartMs;
    }).length,
    pendingVerifications,
    openReports: reports.length,
  };
}

function bucketMonth(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
}

export async function getAnalytics(): Promise<AdminAnalytics> {
  const members = await listMembers();

  // Last 6 months signups
  const months: { ms: number; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - i);
    months.push({ ms: d.getTime(), label: bucketMonth(d.getTime()) });
  }
  const signupsByMonth = months.map((m) => ({
    label: m.label,
    count: members.filter((mb) => {
      const t = new Date(mb.createdAt).getTime();
      if (Number.isNaN(t)) return false;
      const d = new Date(t);
      return d.getMonth() === new Date(m.ms).getMonth() && d.getFullYear() === new Date(m.ms).getFullYear();
    }).length,
  }));

  const genderMap = new Map<string, number>();
  for (const m of members) {
    const g = m.gender && m.gender !== 'other' ? m.gender : 'Not set';
    genderMap.set(g, (genderMap.get(g) || 0) + 1);
  }
  const genderSplit = [...genderMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const cityMap = new Map<string, number>();
  for (const m of members) {
    const c = m.city || 'Unknown';
    cityMap.set(c, (cityMap.get(c) || 0) + 1);
  }
  const topCities = [...cityMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const buckets: { label: string; min: number; max: number }[] = [
    { label: 'Under 25', min: 0, max: 24 },
    { label: '25–30', min: 25, max: 30 },
    { label: '31–35', min: 31, max: 35 },
    { label: '36–40', min: 36, max: 40 },
    { label: '40+', min: 41, max: 999 },
  ];
  const ageBuckets = buckets.map((b) => ({
    label: b.label,
    count: members.filter((m) => typeof m.age === 'number' && m.age >= b.min && m.age <= b.max).length,
  }));

  const active = members.filter((m) => m.isActive && !m.isSuspended).length;
  const inactive = members.filter((m) => !m.isActive).length;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const newThisMonth = members.filter((m) => {
    const t = new Date(m.createdAt).getTime();
    return !Number.isNaN(t) && t >= monthStart.getTime();
  }).length;

  return {
    signupsByMonth,
    genderSplit,
    topCities,
    ageBuckets,
    activeMembers: active,
    inactiveMembers: inactive,
    newThisMonth,
    premiumConversionRate: members.length > 0 ? Math.round((members.filter((m) => m.isPremium).length / members.length) * 100) : 0,
  };
}

export { getMembership };