import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock the db module to avoid Postgres connections
vi.mock('@/lib/db', () => ({
  pool: null,
  hasPool: false,
  ensureProfilesTable: vi.fn(),
}));

// Mock the membership store to return known tiers
vi.mock('@/lib/membershipStore', () => ({
  getMembership: vi.fn().mockResolvedValue({ tier: 'free', isPremium: false, plan: null }),
  MEMBERSHIP_PLANS: [
    {
      id: 'free', tier: 'free', interestsPerMonth: 5, shortlistLimit: 10,
      profilePhotos: 3, dailyMatchSuggestions: 5, contactCredits: 0,
    },
    {
      id: 'silver', tier: 'silver', interestsPerMonth: 50, shortlistLimit: 50,
      profilePhotos: 10, dailyMatchSuggestions: 20, contactCredits: 10,
    },
    {
      id: 'gold', tier: 'gold', interestsPerMonth: -1, shortlistLimit: -1,
      profilePhotos: 20, dailyMatchSuggestions: 50, contactCredits: 50,
    },
  ],
}));

const USAGE_FILE = path.join(process.cwd(), 'scratch', 'usage_db.json');

describe('usageStore', () => {
  beforeEach(() => {
    // Clean up test usage file
    try { fs.unlinkSync(USAGE_FILE); } catch {}
  });

  it('should allow interest send within limit', async () => {
    const { canSendInterest } = await import('@/lib/usageStore');
    const result = await canSendInterest('test_user_1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(5);
    expect(result.limit).toBe(5);
  });

  it('should track interest sends', async () => {
    const { canSendInterest, recordInterestSent } = await import('@/lib/usageStore');
    
    // Send 5 interests (free limit)
    for (let i = 0; i < 5; i++) {
      await recordInterestSent('test_user_2');
    }
    
    const result = await canSendInterest('test_user_2');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.upgradeRequired).toBe(true);
  });

  it('should allow shortlist within limit', async () => {
    const { canShortlist } = await import('@/lib/usageStore');
    const result = await canShortlist('test_user_3');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
    expect(result.limit).toBe(10);
  });

  it('should track shortlist usage', async () => {
    const { canShortlist, recordShortlist } = await import('@/lib/usageStore');
    
    // Use 10 shortlists (free limit)
    for (let i = 0; i < 10; i++) {
      await recordShortlist('test_user_4');
    }
    
    const result = await canShortlist('test_user_4');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should allow photo upload within limit', async () => {
    const { canUploadPhoto } = await import('@/lib/usageStore');
    const result = await canUploadPhoto('test_user_5');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
    expect(result.limit).toBe(3);
  });

  it('should track photo uploads', async () => {
    const { canUploadPhoto, recordPhotoUploaded } = await import('@/lib/usageStore');
    
    // Upload 3 photos (free limit)
    for (let i = 0; i < 3; i++) {
      await recordPhotoUploaded('test_user_6');
    }
    
    const result = await canUploadPhoto('test_user_6');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should return usage summary', async () => {
    const { getUsageSummary } = await import('@/lib/usageStore');
    const summary = await getUsageSummary('test_user_7');
    
    expect(summary.tier).toBe('free');
    expect(summary.isPremium).toBe(false);
    expect(summary.interests.limit).toBe(5);
    expect(summary.shortlists.limit).toBe(10);
    expect(summary.photos.limit).toBe(3);
    expect(summary.matches.limit).toBe(5);
  });

  it('should return match limit', async () => {
    const { getMatchLimit } = await import('@/lib/usageStore');
    const result = await getMatchLimit('test_user_8');
    expect(result.limit).toBe(5);
    expect(result.remaining).toBe(5);
  });
});
