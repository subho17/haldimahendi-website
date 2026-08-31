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

describe('membershipStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readFileSync.mockReturnValue('[]');
    mockFs.writeFileSync.mockImplementation(() => {});
  });

  it('defines four plans: free, silver, gold, platinum', async () => {
    const { MEMBERSHIP_PLANS } = await import('@/lib/membershipStore');
    expect(MEMBERSHIP_PLANS).toHaveLength(4);
    const ids = MEMBERSHIP_PLANS.map((p: { id: string }) => p.id);
    expect(ids).toEqual(['free', 'silver', 'gold', 'platinum']);
    expect(MEMBERSHIP_PLANS.find((p: { id: string; price: string }) => p.id === 'silver')?.price).toBe('₹499');
    expect(MEMBERSHIP_PLANS.find((p: { id: string; price: string }) => p.id === 'gold')?.price).toBe('₹999');
    expect(MEMBERSHIP_PLANS.find((p: { id: string; price: string }) => p.id === 'platinum')?.price).toBe('₹1,999');
  });

  it('resolveStatus returns free for unknown tier', async () => {
    const { resolveStatus } = await import('@/lib/membershipStore');
    const s = resolveStatus('unknown', null);
    expect(s.tier).toBe('free');
    expect(s.isPremium).toBe(false);
  });

  it('resolveStatus returns free when expired', async () => {
    const { resolveStatus } = await import('@/lib/membershipStore');
    const past = new Date(Date.now() - 1000).toISOString();
    const s = resolveStatus('gold', past);
    expect(s.tier).toBe('free');
    expect(s.isPremium).toBe(false);
  });

  it('resolveStatus returns premium when active', async () => {
    const { resolveStatus } = await import('@/lib/membershipStore');
    const future = new Date(Date.now() + 86400000).toISOString();
    const s = resolveStatus('gold', future);
    expect(s.tier).toBe('gold');
    expect(s.isPremium).toBe(true);
  });

  it('getMembership returns free for non-existent user', async () => {
    const { getMembership } = await import('@/lib/membershipStore');
    const m = await getMembership('nonexistent');
    expect(m.tier).toBe('free');
    expect(m.isPremium).toBe(false);
  });

  it('upgradeMembership creates free membership then upgrades to gold', async () => {
    const { upgradeMembership } = await import('@/lib/membershipStore');
    const result = await upgradeMembership('user1', 'gold');
    expect(result.success).toBe(true);
    expect(result.membership.tier).toBe('gold');
    expect(result.membership.isPremium).toBe(true);
    expect(result.membership.expiresAt).toBeDefined();
  });

  it('upgradeMembership extends from current expiry when already premium', async () => {
    const { upgradeMembership, getMembership } = await import('@/lib/membershipStore');
    await upgradeMembership('user2', 'gold');
    const before = await getMembership('user2');
    await new Promise((r) => setTimeout(r, 10));
    await upgradeMembership('user2', 'gold');
    const after = await getMembership('user2');
    expect((after.expiresAt || '') >= (before.expiresAt || '')).toBe(true);
  });

  it('downgrade to free sets isPremium false', async () => {
    const { upgradeMembership } = await import('@/lib/membershipStore');
    await upgradeMembership('user3', 'platinum');
    const result = await upgradeMembership('user3', 'free');
    expect(result.success).toBe(true);
    expect(result.membership.tier).toBe('free');
    expect(result.membership.isPremium).toBe(false);
  });
});