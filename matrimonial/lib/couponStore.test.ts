import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  hasPool: false,
  pool: null,
  ensureProfilesTable: vi.fn().mockResolvedValue(undefined),
}));

const mockFs = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('fs', () => ({
  default: mockFs,
  existsSync: mockFs.existsSync,
  readFileSync: mockFs.readFileSync,
  writeFileSync: mockFs.writeFileSync,
  mkdirSync: mockFs.mkdirSync,
}));

vi.mock('path', () => ({
  default: {
    join: (...args: string[]) => args.join('/'),
    dirname: (p: string) => p.split('/').slice(0, -1).join('/'),
  },
  join: (...args: string[]) => args.join('/'),
  dirname: (p: string) => p.split('/').slice(0, -1).join('/'),
}));

import {
  listCoupons,
  getCouponByCode,
  validateCoupon,
  createCoupon,
} from './couponStore';

const sampleCoupons = [
  {
    id: 'coup_1',
    code: 'FREEGOLD',
    discountType: 'percent' as const,
    discountValue: 100,
    applicablePlans: ['gold'],
    maxUses: 50,
    usedCount: 0,
    perUserLimit: 1,
    startsAt: '2025-01-01T00:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    description: 'Free Gold upgrade',
  },
  {
    id: 'coup_2',
    code: 'SAVE50',
    discountType: 'percent' as const,
    discountValue: 50,
    applicablePlans: [],
    maxUses: 100,
    usedCount: 0,
    perUserLimit: 2,
    startsAt: '2025-01-01T00:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    description: '50% off',
  },
  {
    id: 'coup_3',
    code: 'EXPIRED',
    discountType: 'flat' as const,
    discountValue: 200,
    applicablePlans: [],
    maxUses: 10,
    usedCount: 0,
    perUserLimit: 1,
    startsAt: '2025-01-01T00:00:00Z',
    expiresAt: '2025-06-01T00:00:00Z',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    description: 'Expired coupon',
  },
  {
    id: 'coup_4',
    code: 'INACTIVE',
    discountType: 'percent' as const,
    discountValue: 30,
    applicablePlans: [],
    maxUses: 10,
    usedCount: 0,
    perUserLimit: 1,
    startsAt: '2025-01-01T00:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    isActive: false,
    createdAt: '2025-01-01T00:00:00Z',
    description: 'Inactive coupon',
  },
  {
    id: 'coup_5',
    code: 'MAXEDOUT',
    discountType: 'percent' as const,
    discountValue: 25,
    applicablePlans: [],
    maxUses: 2,
    usedCount: 2,
    perUserLimit: 1,
    startsAt: '2025-01-01T00:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    description: 'Fully used coupon',
  },
];

function setupFs(coupons: typeof sampleCoupons = sampleCoupons) {
  mockFs.existsSync.mockReturnValue(true);
  mockFs.readFileSync.mockReturnValue(JSON.stringify({ coupons }));
  mockFs.writeFileSync.mockImplementation(() => {});
  mockFs.mkdirSync.mockImplementation(() => {});
}

describe('couponStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listCoupons', () => {
    it('returns all coupons from file', async () => {
      setupFs();
      const coupons = await listCoupons();
      expect(coupons).toHaveLength(5);
      expect(coupons[0].code).toBe('FREEGOLD');
    });

    it('returns empty array when no coupons file', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.readFileSync.mockReturnValue('{}');
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.mkdirSync.mockImplementation(() => {});
      const coupons = await listCoupons();
      expect(coupons).toHaveLength(0);
    });
  });

  describe('getCouponByCode', () => {
    it('finds coupon by code (case-insensitive)', async () => {
      setupFs();
      const coupon = await getCouponByCode('freegold');
      expect(coupon).toBeTruthy();
      expect(coupon!.code).toBe('FREEGOLD');
    });

    it('returns null for unknown code', async () => {
      setupFs();
      const coupon = await getCouponByCode('INVALID');
      expect(coupon).toBeNull();
    });

    it('trims whitespace from code', async () => {
      setupFs();
      const coupon = await getCouponByCode('  SAVE50  ');
      expect(coupon).toBeTruthy();
      expect(coupon!.code).toBe('SAVE50');
    });
  });

  describe('validateCoupon', () => {
    it('validates a valid coupon for applicable plan', async () => {
      setupFs();
      const result = await validateCoupon('FREEGOLD', 'gold', 'user1');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Coupon applied');
      expect(result.coupon!.code).toBe('FREEGOLD');
    });

    it('rejects invalid coupon code', async () => {
      setupFs();
      const result = await validateCoupon('NONEXISTENT', 'gold', 'user1');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid coupon code');
    });

    it('rejects inactive coupon', async () => {
      setupFs();
      const result = await validateCoupon('INACTIVE', 'gold', 'user1');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon is inactive');
    });

    it('rejects expired coupon', async () => {
      setupFs();
      const result = await validateCoupon('EXPIRED', 'gold', 'user1');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon has expired');
    });

    it('rejects coupon with max uses reached', async () => {
      setupFs();
      const result = await validateCoupon('MAXEDOUT', 'gold', 'user1');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon usage limit reached');
    });

    it('rejects coupon not applicable to plan', async () => {
      setupFs();
      const result = await validateCoupon('FREEGOLD', 'silver', 'user1');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Coupon not applicable to this plan');
    });

    it('validates coupon with empty applicablePlans (all plans)', async () => {
      setupFs();
      const result = await validateCoupon('SAVE50', 'platinum', 'user1');
      expect(result.valid).toBe(true);
    });

    it('calculates discount amount for percent coupon', async () => {
      setupFs();
      const result = await validateCoupon('SAVE50', 'gold', 'user1');
      expect(result.valid).toBe(true);
      expect(result.coupon!.discountType).toBe('percent');
      expect(result.coupon!.discountValue).toBe(50);
    });
  });

  describe('createCoupon', () => {
    it('creates a new coupon with generated id', async () => {
      setupFs([]);
      const coupon = await createCoupon({
        code: 'NEWCODE',
        discountType: 'flat',
        discountValue: 100,
        applicablePlans: [],
        maxUses: 10,
        perUserLimit: 1,
        startsAt: '2025-01-01T00:00:00Z',
        expiresAt: '2026-12-31T23:59:59Z',
        isActive: true,
        description: 'Test',
      });
      expect(coupon.id).toMatch(/^coup_/);
      expect(coupon.code).toBe('NEWCODE');
      expect(coupon.usedCount).toBe(0);
    });
  });
});
