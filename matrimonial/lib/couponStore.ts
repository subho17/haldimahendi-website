import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';

const COUPONS_FILE = path.join(process.cwd(), 'scratch', 'coupons_db.json');

export type DiscountType = 'percent' | 'flat';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number; // percent: 10 = 10%, flat: 100 = ₹100
  applicablePlans: string[]; // e.g. ['premium', 'premium_plus'], empty = all
  maxUses: number; // total uses across all users
  usedCount: number;
  perUserLimit: number; // max uses per user
  startsAt: string; // ISO
  expiresAt: string; // ISO
  isActive: boolean;
  createdAt: string;
  description?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message: string;
}

interface CouponsFile {
  coupons: Coupon[];
}

function ensureFile() {
  const dir = path.dirname(COUPONS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(COUPONS_FILE)) {
    fs.writeFileSync(COUPONS_FILE, JSON.stringify({ coupons: [] }, null, 2));
  }
}

function readFile(): CouponsFile {
  try {
    ensureFile();
    const parsed = JSON.parse(fs.readFileSync(COUPONS_FILE, 'utf-8') || '{}');
    return { coupons: Array.isArray(parsed.coupons) ? parsed.coupons : [] };
  } catch (e) {
    console.warn('[Coupon] Failed to read file:', e);
    return { coupons: [] };
  }
}

function writeFile(state: CouponsFile) {
  try {
    ensureFile();
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn('[Coupon] Failed to write file:', e);
  }
}

async function readPgCoupons(): Promise<Coupon[]> {
  await ensureProfilesTable(); // reuse existing table ensure
  try {
    const { rows } = await pool!.query(`
      SELECT id, code, discount_type, discount_value, applicable_plans, max_uses, used_count,
             per_user_limit, starts_at, expires_at, is_active, created_at, description
      FROM coupons
      ORDER BY created_at DESC
    `);
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      discountType: r.discount_type,
      discountValue: r.discount_value,
      applicablePlans: r.applicable_plans || [],
      maxUses: r.max_uses,
      usedCount: r.used_count,
      perUserLimit: r.per_user_limit,
      startsAt: r.starts_at,
      expiresAt: r.expires_at,
      isActive: r.is_active,
      createdAt: r.created_at,
      description: r.description,
    }));
  } catch (e) {
    console.warn('[Coupon] PG read failed:', e);
    return [];
  }
}

async function writePgCoupon(c: Coupon, isNew: boolean) {
  await ensureProfilesTable();
  try {
    if (isNew) {
      await pool!.query(`
        INSERT INTO coupons (id, code, discount_type, discount_value, applicable_plans, max_uses, used_count,
                             per_user_limit, starts_at, expires_at, is_active, description, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `, [c.id, c.code, c.discountType, c.discountValue, c.applicablePlans, c.maxUses, c.usedCount,
          c.perUserLimit, c.startsAt, c.expiresAt, c.isActive, c.description || null, c.createdAt]);
    } else {
      await pool!.query(`
        UPDATE coupons SET discount_type=$2, discount_value=$3, applicable_plans=$4, max_uses=$5, used_count=$6,
                           per_user_limit=$7, starts_at=$8, expires_at=$9, is_active=$10, description=$11
        WHERE id=$1
      `, [c.id, c.discountType, c.discountValue, c.applicablePlans, c.maxUses, c.usedCount,
          c.perUserLimit, c.startsAt, c.expiresAt, c.isActive, c.description || null]);
    }
  } catch (e) {
    console.warn('[Coupon] PG write failed:', e);
  }
}

export async function listCoupons(): Promise<Coupon[]> {
  if (hasPool) {
    try {
      return await readPgCoupons();
    } catch (e) {
      console.warn('[Coupon] PG list failed, fallback:', e);
    }
  }
  return readFile().coupons;
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const coupons = await listCoupons();
  const normalized = code.trim().toUpperCase();
  return coupons.find((c) => c.code.toUpperCase() === normalized) || null;
}

export async function createCoupon(data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon> {
  const coupon: Coupon = {
    ...data,
    id: `coup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (hasPool) {
    try {
      await writePgCoupon(coupon, true);
    } catch (e) {
      console.warn('[Coupon] PG create failed, fallback:', e);
    }
  }

  const file = readFile();
  file.coupons.unshift(coupon);
  writeFile(file);

  return coupon;
}

export async function updateCoupon(id: string, patch: Partial<Coupon>): Promise<Coupon | null> {
  const coupons = await listCoupons();
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const updated = { ...coupons[idx], ...patch };
  coupons[idx] = updated;

  if (hasPool) {
    try {
      await writePgCoupon(updated, false);
    } catch (e) {
      console.warn('[Coupon] PG update failed:', e);
    }
  }

  const file = readFile();
  const fidx = file.coupons.findIndex((c) => c.id === id);
  if (fidx !== -1) file.coupons[fidx] = updated;
  writeFile(file);

  return updated;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  if (hasPool) {
    try {
      await ensureProfilesTable();
      await pool!.query('DELETE FROM coupons WHERE id = $1', [id]);
    } catch (e) {
      console.warn('[Coupon] PG delete failed:', e);
    }
  }
  const file = readFile();
  file.coupons = file.coupons.filter((c) => c.id !== id);
  writeFile(file);
  return true;
}

export async function validateCoupon(code: string, planId: string, userId: string): Promise<CouponValidationResult> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return { valid: false, message: 'Invalid coupon code' };
  if (!coupon.isActive) return { valid: false, message: 'Coupon is inactive' };
  const now = new Date();
  if (new Date(coupon.startsAt) > now) return { valid: false, message: 'Coupon not yet valid' };
  if (new Date(coupon.expiresAt) < now) return { valid: false, message: 'Coupon has expired' };
  if (coupon.usedCount >= coupon.maxUses) return { valid: false, message: 'Coupon usage limit reached' };
  if (coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(planId)) {
    return { valid: false, message: 'Coupon not applicable to this plan' };
  }

  // Check per-user usage (simple: count in scratch usage log)
  const userUsage = await getUserCouponUsage(userId, coupon.id);
  if (userUsage >= coupon.perUserLimit) {
    return { valid: false, message: 'You have already used this coupon the maximum allowed times' };
  }

  return { valid: true, coupon, message: 'Coupon applied' };
}

async function getUserCouponUsage(userId: string, couponId: string): Promise<number> {
  // Simple per-user usage tracking in scratch
  const usageFile = path.join(process.cwd(), 'scratch', 'coupon_usage_db.json');
  if (!fs.existsSync(usageFile)) return 0;
  try {
    const data = JSON.parse(fs.readFileSync(usageFile, 'utf-8') || '{}');
    return data[`${userId}:${couponId}`] || 0;
  } catch {
    return 0;
  }
}

export async function recordCouponUsage(userId: string, couponId: string): Promise<void> {
  // Increment usedCount on coupon
  const coupon = (await listCoupons()).find((c) => c.id === couponId);
  if (coupon) {
    coupon.usedCount += 1;
    await updateCoupon(coupon.id, { usedCount: coupon.usedCount });
  }

  // Track per-user usage
  const usageFile = path.join(process.cwd(), 'scratch', 'coupon_usage_db.json');
  let data: Record<string, number> = {};
  if (fs.existsSync(usageFile)) {
    try { data = JSON.parse(fs.readFileSync(usageFile, 'utf-8') || '{}'); } catch {}
  }
  const key = `${userId}:${couponId}`;
  data[key] = (data[key] || 0) + 1;
  const dir = path.dirname(usageFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(usageFile, JSON.stringify(data, null, 2));
}

export function calculateDiscount(coupon: Coupon, planPrice: number): number {
  if (coupon.discountType === 'percent') {
    return Math.round(planPrice * (coupon.discountValue / 100));
  }
  return Math.min(coupon.discountValue, planPrice);
}