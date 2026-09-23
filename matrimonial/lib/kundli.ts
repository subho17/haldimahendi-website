export type Gana = "deva" | "manushya" | "rakshasa";

export interface NakshatraInfo {
  name: string;
  lord: string;
  gana: Gana;
  yoni: string;
  nadi: number;
}

// Classic 27 nakshatras with lord planet, gana, yoni (animal) and nadi.
export const NAKSHATRAS: NakshatraInfo[] = [
  { name: "Ashwini", lord: "Ketu", gana: "deva", yoni: "Horse", nadi: 1 },
  { name: "Bharani", lord: "Venus", gana: "rakshasa", yoni: "Elephant", nadi: 2 },
  { name: "Krittika", lord: "Sun", gana: "manushya", yoni: "Sheep", nadi: 3 },
  { name: "Rohini", lord: "Moon", gana: "manushya", yoni: "Serpent", nadi: 1 },
  { name: "Mrigashira", lord: "Mars", gana: "deva", yoni: "Serpent", nadi: 2 },
  { name: "Ardra", lord: "Rahu", gana: "rakshasa", yoni: "Dog", nadi: 3 },
  { name: "Punarvasu", lord: "Jupiter", gana: "deva", yoni: "Cat", nadi: 1 },
  { name: "Pushya", lord: "Saturn", gana: "deva", yoni: "Sheep", nadi: 2 },
  { name: "Ashlesha", lord: "Mercury", gana: "rakshasa", yoni: "Cat", nadi: 3 },
  { name: "Magha", lord: "Ketu", gana: "rakshasa", yoni: "Rat", nadi: 1 },
  { name: "Purva Phalguni", lord: "Venus", gana: "manushya", yoni: "Rat", nadi: 2 },
  { name: "Uttara Phalguni", lord: "Sun", gana: "manushya", yoni: "Cow", nadi: 3 },
  { name: "Hasta", lord: "Moon", gana: "deva", yoni: "Buffalo", nadi: 1 },
  { name: "Chitra", lord: "Mars", gana: "rakshasa", yoni: "Tiger", nadi: 2 },
  { name: "Swati", lord: "Rahu", gana: "deva", yoni: "Buffalo", nadi: 3 },
  { name: "Vishakha", lord: "Jupiter", gana: "rakshasa", yoni: "Tiger", nadi: 1 },
  { name: "Anuradha", lord: "Saturn", gana: "deva", yoni: "Deer", nadi: 2 },
  { name: "Jyeshtha", lord: "Mercury", gana: "rakshasa", yoni: "Deer", nadi: 3 },
  { name: "Mula", lord: "Ketu", gana: "rakshasa", yoni: "Dog", nadi: 1 },
  { name: "Purva Ashadha", lord: "Venus", gana: "manushya", yoni: "Monkey", nadi: 2 },
  { name: "Uttara Ashadha", lord: "Sun", gana: "manushya", yoni: "Mongoose", nadi: 3 },
  { name: "Shravana", lord: "Moon", gana: "deva", yoni: "Monkey", nadi: 1 },
  { name: "Dhanishta", lord: "Mars", gana: "manushya", yoni: "Lion", nadi: 2 },
  { name: "Shatabhisha", lord: "Rahu", gana: "rakshasa", yoni: "Horse", nadi: 3 },
  { name: "Purva Bhadrapada", lord: "Jupiter", gana: "manushya", yoni: "Lion", nadi: 1 },
  { name: "Uttara Bhadrapada", lord: "Saturn", gana: "manushya", yoni: "Cow", nadi: 2 },
  { name: "Revati", lord: "Mercury", gana: "deva", yoni: "Elephant", nadi: 3 },
];

export const RASHIS = [
  "Aries (Mesha)",
  "Taurus (Vrishabha)",
  "Gemini (Mithuna)",
  "Cancer (Karka)",
  "Leo (Simha)",
  "Virgo (Kanya)",
  "Libra (Tula)",
  "Scorpio (Vrishchika)",
  "Sagittarius (Dhanu)",
  "Capricorn (Makara)",
  "Aquarius (Kumbha)",
  "Pisces (Meena)",
];

export const SUN_RASHIS = [
  "Aries (Mesha) - Sun",
  "Taurus (Vrishabha) - Sun",
  "Gemini (Mithuna) - Sun",
  "Cancer (Karka) - Sun",
  "Leo (Simha) - Sun",
  "Virgo (Kanya) - Sun",
  "Libra (Tula) - Sun",
  "Scorpio (Vrishchika) - Sun",
  "Sagittarius (Dhanu) - Sun",
  "Capricorn (Makara) - Sun",
  "Aquarius (Kumbha) - Sun",
  "Pisces (Meena) - Sun",
];

const PLANET_FRIENDS: Record<string, string[]> = {
  sun: ["moon", "mars", "jupiter"],
  moon: ["sun", "mercury"],
  mars: ["sun", "moon", "jupiter"],
  mercury: ["sun", "venus"],
  jupiter: ["sun", "moon", "mars"],
  venus: ["mercury", "saturn"],
  saturn: ["mercury", "venus"],
  ketu: ["ketu"],
  rahu: ["rahu"],
};

const PLANET_ENEMIES: Record<string, string[]> = {
  sun: ["venus", "saturn"],
  moon: [],
  mars: ["mercury"],
  mercury: ["moon"],
  jupiter: ["mercury", "venus"],
  venus: ["sun", "moon"],
  saturn: ["sun", "moon", "mars"],
};

function planetRel(a: string, b: string): "friend" | "enemy" | "neutral" {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  if (PLANET_FRIENDS[la]?.includes(lb)) return "friend";
  if (PLANET_ENEMIES[la]?.includes(lb)) return "enemy";
  return "neutral";
}

function ganaRel(a: Gana, b: Gana): "same" | "adjacent" | "opposite" {
  if (a === b) return "same";
  const set = new Set([a, b]);
  if (set.has("deva") && set.has("manushya")) return "adjacent";
  return "opposite";
}

export function getNakshatra(name?: string | null): NakshatraInfo | null {
  if (!name) return null;
  const q = name.toString().trim().toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " ");
  if (!q) return null;
  return (
    NAKSHATRAS.find((n) => n.name.toLowerCase() === q) ||
    NAKSHATRAS.find((n) => n.name.toLowerCase().includes(q) || q.includes(n.name.toLowerCase())) ||
    null
  );
}

// Simplified Ashtakoota — 36 guna points across four dimensions.
export function computeKundliGunas(
  a?: string | null,
  b?: string | null
): { gunas: number; max: number; breakdown: { gana: number; nadi: number; yoni: number; maithri: number } } | null {
  const na = getNakshatra(a);
  const nb = getNakshatra(b);
  if (!na || !nb) return null;

  let gana = 0;
  const gr = ganaRel(na.gana, nb.gana);
  if (gr === "same") gana = 6;
  else if (gr === "adjacent") gana = 3;

  const nadi = na.nadi === nb.nadi ? 8 : 0;
  const yoni = na.yoni === nb.yoni ? 4 : 0;

  let maithri = 0;
  const rel = planetRel(na.lord, nb.lord);
  if (rel === "friend") maithri = 5;
  else if (rel === "neutral") maithri = 2;

  return { gunas: gana + nadi + yoni + maithri, max: 23, breakdown: { gana, nadi, yoni, maithri } };
}

// Manglik rule: same status (both manglik or both non-manglik) is fully
// compatible; a manglik + non-manglik pairing is a mild mismatch.
export function manglikScore(v: string | boolean | null | undefined, c: string | boolean | null | undefined): number | null {
  const toBool = (x: string | boolean | null | undefined): boolean | null => {
    if (typeof x === "boolean") return x;
    const s = (x || "").toString().trim().toLowerCase();
    if (["yes", "true", "manglik", "1"].includes(s)) return true;
    if (["no", "false", "non-manglik", "non manglik", "0"].includes(s)) return false;
    return null;
  };
  const vv = toBool(v);
  const cc = toBool(c);
  if (vv === null || cc === null) return null;
  return vv === cc ? 1 : 0.5;
}

export function gunaLabel(gunas: number): string {
  if (gunas >= 26) return "Excellent";
  if (gunas >= 18) return "Good";
  if (gunas >= 12) return "Average";
  return "Low";
}