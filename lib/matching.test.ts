import { describe, it, expect } from 'vitest';

describe('matching', () => {
  it('genderMatches normalizes and compares', async () => {
    const { genderMatches } = await import('@/lib/matching');
    expect(genderMatches('Woman', 'woman')).toBe(true);
    expect(genderMatches('Man', 'male')).toBe(true);
    expect(genderMatches('Any', 'woman')).toBe(true);
    expect(genderMatches('Woman', 'man')).toBe(false);
  });

  it('parseHeightToInches parses common formats', async () => {
    const { parseHeightToInches } = await import('@/lib/matching');
    expect(parseHeightToInches("5'5\"")).toBe(65);
    expect(parseHeightToInches("5' 5\"")).toBe(65);
    expect(parseHeightToInches("5ft5in")).toBe(65);
    expect(parseHeightToInches("165cm")).toBe(65);
    expect(parseHeightToInches("1.65m")).toBe(65);
    expect(parseHeightToInches(null)).toBeNull();
  });

  it('parseHeightFromRange handles single and range', async () => {
    const { parseHeightFromRange } = await import('@/lib/matching');
    expect(parseHeightFromRange("5'5\"")).toEqual({ min: 65, max: 65 });
    expect(parseHeightFromRange("5'2\"-5'6\"")).toEqual({ min: 62, max: 66 });
    expect(parseHeightFromRange(null)).toBeNull();
  });

  it('isEligible applies hard filters', async () => {
    const { isEligible } = await import('@/lib/matching');
    const prefs = { partnerGender: 'Woman', ageMin: 25, ageMax: 30, religion: 'Hindu', motherTongue: 'Hindi', maritalStatus: 'Never Married' };
    const candidate = { id: '1', name: 'Test', age: 28, religion: 'Hindu', motherTongue: 'Hindi', maritalStatus: 'Never Married', gender: 'Woman' };
    expect(isEligible(prefs, candidate)).toBe(true);
    expect(isEligible({ ...prefs, religion: 'Muslim' }, candidate)).toBe(false);
    expect(isEligible({ ...prefs, ageMin: 35 }, candidate)).toBe(false);
  });

  it('findMatches returns eligible sorted by score', async () => {
    const { findMatches } = await import('@/lib/matching');
    const prefs = { partnerGender: 'Woman', ageMin: 20, ageMax: 35 };
    const candidates = [
      { id: '1', name: 'A', age: 25, gender: 'Woman', religion: 'Hindu' },
      { id: '2', name: 'B', age: 30, gender: 'Woman', religion: 'Muslim' },
      { id: '3', name: 'C', age: 22, gender: 'Man', religion: 'Hindu' }, // wrong gender
    ];
    const results = findMatches(prefs, candidates);
    expect(results.length).toBe(3);
    expect(results[0].isEligible).toBe(true);
    expect(results[1].isEligible).toBe(true);
    expect(results[2].isEligible).toBe(false);
  });
});