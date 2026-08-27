import { describe, it, expect } from 'vitest';

describe('kundli', () => {
  it('has 27 nakshatras with required fields', async () => {
    const { NAKSHATRAS } = await import('@/lib/kundli');
    expect(NAKSHATRAS).toHaveLength(27);
    for (const n of NAKSHATRAS) {
      expect(n).toHaveProperty('name');
      expect(n).toHaveProperty('lord');
      expect(n).toHaveProperty('gana');
      expect(n).toHaveProperty('yoni');
      expect(n).toHaveProperty('nadi');
    }
  });

  it('has 12 rashis as strings', async () => {
    const { RASHIS } = await import('@/lib/kundli');
    expect(RASHIS).toHaveLength(12);
    expect(RASHIS).toContain('Aries (Mesha)');
    expect(RASHIS).toContain('Taurus (Vrishabha)');
  });

  it('getNakshatra finds by name', async () => {
    const { getNakshatra } = await import('@/lib/kundli');
    const ashwini = getNakshatra('Ashwini');
    expect(ashwini).not.toBeNull();
    expect(ashwini?.name).toBe('Ashwini');
    const bharani = getNakshatra('Bharani');
    expect(bharani?.name).toBe('Bharani');
    expect(getNakshatra('unknown')).toBeNull();
  });

  it('computeKundliGunas returns 23 for identical charts', async () => {
    const { computeKundliGunas } = await import('@/lib/kundli');
    const g = computeKundliGunas('Ashwini', 'Ashwini');
    expect(g).not.toBeNull();
    expect(g?.gunas).toBe(23);
    expect(g?.max).toBe(23);
    expect(g?.breakdown.gana).toBe(6);
    expect(g?.breakdown.nadi).toBe(8);
    expect(g?.breakdown.yoni).toBe(4);
    expect(g?.breakdown.maithri).toBe(5);
  });

  it('computeKundliGunas returns lower for different nakshatras', async () => {
    const { computeKundliGunas } = await import('@/lib/kundli');
    const g = computeKundliGunas('Ashwini', 'Bharani');
    expect(g).not.toBeNull();
    expect(g?.gunas).toBeLessThan(36);
    expect(g?.gunas).toBeGreaterThanOrEqual(0);
  });

  it('computeKundliGunas returns null for unknown nakshatra', async () => {
    const { computeKundliGunas } = await import('@/lib/kundli');
    const g = computeKundliGunas('unknown', 'Ashwini');
    expect(g).toBeNull();
  });

  it('manglikScore returns 1 for same status', async () => {
    const { manglikScore } = await import('@/lib/kundli');
    expect(manglikScore('yes', 'yes')).toBe(1);
    expect(manglikScore('no', 'no')).toBe(1);
    expect(manglikScore(true, true)).toBe(1);
    expect(manglikScore(false, false)).toBe(1);
  });

  it('manglikScore returns 0.5 for different status', async () => {
    const { manglikScore } = await import('@/lib/kundli');
    expect(manglikScore('yes', 'no')).toBe(0.5);
    expect(manglikScore(true, false)).toBe(0.5);
  });

  it('manglikScore returns null for unknown', async () => {
    const { manglikScore } = await import('@/lib/kundli');
    expect(manglikScore('unknown', 'yes')).toBeNull();
    expect(manglikScore(null, 'yes')).toBeNull();
  });

  it('gunaLabel classifies scores correctly', async () => {
    const { gunaLabel } = await import('@/lib/kundli');
    expect(gunaLabel(32)).toBe('Excellent');
    expect(gunaLabel(24)).toBe('Good');
    expect(gunaLabel(18)).toBe('Good');
    expect(gunaLabel(15)).toBe('Average');
    expect(gunaLabel(10)).toBe('Low');
  });
});