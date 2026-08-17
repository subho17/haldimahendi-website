// ============================================================
// MATCHMAKING ENGINE
// ------------------------------------------------------------
// Two stages:
//  1. ELIGIBILITY  - hard/deal-breaker filters decide if a
//     candidate can be shown at all (gender, age, religion,
//     mother tongue, marital status).
//  2. SCORING      - soft criteria rank eligible candidates with
//     a weighted 0-100 score. Dimensions the user did not
//     specify are skipped (never punished).
// ============================================================

export interface MatchPreferences {
  userId?: string;
  partnerGender?: string; // 'Woman' | 'Man' | 'Any'
  ageMin?: number | null;
  ageMax?: number | null;
  heightMin?: string | null; // e.g. "5'0\""
  heightMax?: string | null; // e.g. "5'8\""
  religion?: string | null; // 'Any' means don't care
  motherTongue?: string | null; // comma-separated list
  maritalStatus?: string | null; // e.g. 'Never Married'
  city?: string | null;
  education?: string | null;
}

export interface MatchCandidate {
  id: string;
  name: string;
  age?: number | null;
  height?: string | null;
  religion?: string | null;
  motherTongue?: string | null;
  education?: string | null;
  profession?: string | null;
  city?: string | null;
  country?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | number | Date | null;
}

export interface MatchResult {
  profile: MatchCandidate;
  score: number;
  isEligible: boolean;
  isNew: boolean;
  breakdown: Record<string, number>;
}

// ------------------------------------------------------------------
// Dimension weights (total = 100). Tunable per business rules.
// ------------------------------------------------------------------
const WEIGHTS = {
  religion: 20,
  motherTongue: 15,
  maritalStatus: 10,
  age: 15,
  height: 15,
  city: 10,
  education: 10,
  profession: 5,
} as const;

// ------------------------------------------------------------------
// Gender normalization
// ------------------------------------------------------------------
function genderBucket(g?: string | null): 'male' | 'female' | 'unknown' {
  const s = (g || '').toString().trim().toLowerCase();
  if (['bride', 'woman', 'female', 'girl', 'women', 'ladies'].includes(s)) return 'female';
  if (['groom', 'man', 'male', 'boy', 'men', 'gents'].includes(s)) return 'male';
  return 'unknown';
}

export function genderMatches(preferred: string, candidate: string | null | undefined): boolean {
  const want = genderBucket(preferred);
  if (want === 'unknown') return true;
  const got = genderBucket(candidate);
  if (got === 'unknown') return true; // can't verify, don't exclude
  return want === got;
}

// ------------------------------------------------------------------
// Height helpers (normalize to inches for comparison)
// ------------------------------------------------------------------
export function parseHeightToInches(height?: string | null): number | null {
  if (!height) return null;
  const s = height.toString().trim().toLowerCase().replace(/\s+/g, '');

  // 5'5" / 5' 5" / 5'5
  let m = s.match(/^(\d+)\s*['′]\s*(\d*)\s*(?:\"|″|in)?$/);
  if (m) {
    const feet = parseInt(m[1], 10);
    const inches = m[2] ? parseInt(m[2], 10) : 0;
    return feet * 12 + inches;
  }

  // 5ft5in / 5ft / 5feet5
  m = s.match(/^(\d+)\s*(?:ft|feet)\s*(\d*)\s*(?:in|inch)?$/);
  if (m) {
    const feet = parseInt(m[1], 10);
    const inches = m[2] ? parseInt(m[2], 10) : 0;
    return feet * 12 + inches;
  }

  // 165cm / 165 cms
  if (s.endsWith('cm')) {
    const v = parseFloat(s.replace('cm', ''));
    return isNaN(v) ? null : Math.round(v / 2.54);
  }

  // 1.65m
  if (s.endsWith('m')) {
    const v = parseFloat(s.replace('m', ''));
    return isNaN(v) ? null : Math.round(v * 39.3701);
  }

  // Bare number: cm if 100-200, inches if 50-80, feet if <= 8
  if (/^\d+(\.\d+)?$/.test(s)) {
    const v = parseFloat(s);
    if (v >= 100 && v <= 200) return Math.round(v / 2.54);
    if (v >= 50 && v <= 80) return Math.round(v);
    if (v > 0 && v <= 8) return Math.round(v * 12);
  }

  return null;
}

export function parseHeightFromRange(value?: string | null): { min: number; max: number } | null {
  if (!value) return null;
  const parts = value.split('-').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) {
    const h = parseHeightToInches(parts[0]);
    if (h === null) return null;
    return { min: h, max: h };
  }
  if (parts.length === 2) {
    const min = parseHeightToInches(parts[0]);
    const max = parseHeightToInches(parts[1]);
    if (min === null || max === null) return null;
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }
  return null;
}

// ------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------
function toLower(v?: string | null): string {
  return (v || '').toString().trim().toLowerCase();
}

function isUnset(v: string | null | undefined): boolean {
  const s = (v || '').toString().trim();
  return !s || s.toLowerCase() === 'any' || s.toLowerCase() === 'none' || s.toLowerCase() === 'no preference';
}

function parseAgeRange(p: MatchPreferences): [number, number] {
  const min = p.ageMin ? Math.max(18, Number(p.ageMin)) : 18;
  const max = p.ageMax ? Math.max(18, Number(p.ageMax)) : 70;
  return [Math.min(min, max), Math.max(min, max)];
}

function isWithinDays(date: string | number | Date | null | undefined, days: number): boolean {
  if (!date) return false;
  const t = date instanceof Date ? date.getTime() : typeof date === 'number' ? date : Date.parse(date);
  if (isNaN(t)) return false;
  return Date.now() - t < days * 24 * 60 * 60 * 1000;
}

// ------------------------------------------------------------------
// STAGE 1 — Eligibility (hard filters)
// ------------------------------------------------------------------
export function isEligible(p: MatchPreferences, candidate: MatchCandidate): boolean {
  // Gender
  if (!isUnset(p.partnerGender)) {
    if (!genderMatches(p.partnerGender!, candidate.gender)) return false;
  }

  // Age
  const [minA, maxA] = parseAgeRange(p);
  if (candidate.age != null && !isNaN(Number(candidate.age))) {
    const age = Number(candidate.age);
    if (age < minA || age > maxA) return false;
  }

  // Religion
  if (!isUnset(p.religion) && candidate.religion) {
    if (toLower(candidate.religion) !== toLower(p.religion)) return false;
  }

  // Mother tongue (comma-separated list of acceptable options)
  if (!isUnset(p.motherTongue)) {
    const allowed = p.motherTongue!.split(',').map((s) => toLower(s)).filter(Boolean);
    if (candidate.motherTongue && allowed.length > 0) {
      if (!allowed.includes(toLower(candidate.motherTongue))) return false;
    }
  }

  // Marital status
  if (!isUnset(p.maritalStatus) && candidate.maritalStatus) {
    if (toLower(candidate.maritalStatus) !== toLower(p.maritalStatus)) return false;
  }

  return true;
}

// ------------------------------------------------------------------
// STAGE 2 — Scoring (soft criteria, weighted, 0-100)
// ------------------------------------------------------------------
function scoreReligion(p: MatchPreferences, c: MatchCandidate): number {
  if (isUnset(p.religion) || !c.religion) return 1;
  return toLower(c.religion) === toLower(p.religion) ? 1 : 0;
}

function scoreMotherTongue(p: MatchPreferences, c: MatchCandidate): number {
  if (isUnset(p.motherTongue) || !c.motherTongue) return 1;
  const allowed = p.motherTongue!.split(',').map((s) => toLower(s)).filter(Boolean);
  if (allowed.length === 0) return 1;
  return allowed.includes(toLower(c.motherTongue)) ? 1 : 0;
}

function scoreMaritalStatus(p: MatchPreferences, c: MatchCandidate): number {
  if (isUnset(p.maritalStatus) || !c.maritalStatus) return 1;
  return toLower(c.maritalStatus) === toLower(p.maritalStatus) ? 1 : 0;
}

function scoreAge(p: MatchPreferences, c: MatchCandidate): number {
  const age = Number(c.age);
  if (isNaN(age)) return isUnset(String(p.ageMin ?? '')) && isUnset(String(p.ageMax ?? '')) ? 1 : 0;
  const [min, max] = parseAgeRange(p);
  const mid = (min + max) / 2;
  const spread = Math.max(1, max - min);
  // Closer to the middle of the preferred range scores higher.
  return Math.max(0, 1 - Math.abs(age - mid) / (spread + 4));
}

function scoreHeight(p: MatchPreferences, c: MatchCandidate): number {
  if (isUnset(p.heightMin) && isUnset(p.heightMax)) return 1;
  const minIn = p.heightMin ? parseHeightToInches(p.heightMin) : null;
  const maxIn = p.heightMax ? parseHeightToInches(p.heightMax) : null;
  if (minIn === null && maxIn === null) return 1;

  const cIn = parseHeightToInches(c.height);
  if (cIn === null) return 0;
  if (minIn !== null && maxIn !== null && cIn >= minIn && cIn <= maxIn) return 1;
  if (minIn !== null && maxIn === null && cIn >= minIn) return 1;
  if (minIn === null && maxIn !== null && cIn <= maxIn) return 1;

  // Slightly outside the requested range still earns partial credit.
  const nearest = Math.min(...[minIn, maxIn].filter((v): v is number => v !== null).map((v) => Math.abs(cIn - v)));
  return nearest <= 2 ? 0.4 : 0;
}

function scoreCity(p: MatchPreferences, c: MatchCandidate): number {
  if (isUnset(p.city) || !c.city) return isUnset(p.city) ? 1 : 0.25;
  const want = toLower(p.city);
  const got = toLower(c.city);
  if (got === want) return 1;
  if (got.includes(want) || want.includes(got)) return 0.5;
  return 0;
}

function scoreEducation(p: MatchPreferences, c: MatchCandidate): number {
  if (isUnset(p.education)) return 1;
  if (!c.education) return 0.3;
  const want = toLower(p.education);
  const got = toLower(c.education);
  if (want.split(',').some((t) => t && (got.includes(t.trim()) || t.trim().includes(got)))) return 1;
  return 0.6;
}

function scoreProfession(_p: MatchPreferences, c: MatchCandidate): number {
  return c.profession && c.profession.trim().length > 0 ? 1 : 0.5;
}

function scoreMatchInternal(p: MatchPreferences, c: MatchCandidate): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let score = 0;

  const apply = (key: keyof typeof WEIGHTS, value: number) => {
    breakdown[key] = Math.round(value * WEIGHTS[key]);
    score += value * WEIGHTS[key];
  };

  apply('religion', scoreReligion(p, c));
  apply('motherTongue', scoreMotherTongue(p, c));
  apply('maritalStatus', scoreMaritalStatus(p, c));
  apply('age', scoreAge(p, c));
  apply('height', scoreHeight(p, c));
  apply('city', scoreCity(p, c));
  apply('education', scoreEducation(p, c));
  apply('profession', scoreProfession(p, c));

  return { score: Math.round(score), breakdown };
}

// ------------------------------------------------------------------
// Main entrypoint
// ------------------------------------------------------------------
export function findMatches(
  prefs: MatchPreferences,
  candidates: MatchCandidate[],
  opts?: { viewer?: Pick<MatchCandidate, 'id' | 'gender'> }
): MatchResult[] {
  const viewerId = opts?.viewer?.id;
  const viewerGender = genderBucket(opts?.viewer?.gender);

  // If the user didn't say who they're looking for and we know their
  // own gender, default to the opposite gender and exclude candidates
  // of the same gender.
  const effectivePrefs: MatchPreferences = { ...prefs };
  if (isUnset(effectivePrefs.partnerGender) && viewerGender !== 'unknown') {
    effectivePrefs.partnerGender = viewerGender === 'male' ? 'Woman' : 'Man';
  }

  const results: MatchResult[] = [];
  for (const candidate of candidates) {
    if (!candidate || !candidate.name) continue;
    if (viewerId && candidate.id && candidate.id === viewerId) continue;

    const eligible = isEligible(effectivePrefs, candidate);
    const { score, breakdown } = scoreMatchInternal(effectivePrefs, candidate);

    results.push({
      profile: candidate,
      score,
      isEligible: eligible,
      isNew: isWithinDays(candidate.createdAt, 7),
      breakdown,
    });
  }

  // Eligible first, then best scored.
  return results.sort((a, b) => {
    if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return Number(a.profile.age ?? 99) - Number(b.profile.age ?? 99);
  });
}