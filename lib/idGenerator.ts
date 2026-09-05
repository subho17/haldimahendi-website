// ============================================================
// Matrimonial Member ID & Privacy Utilities
// ============================================================

/**
 * Checks whether a given string is a valid 4-digit numeric ID (e.g. "4829", "1001").
 */
export function is4DigitId(id?: string | null): boolean {
  if (!id) return false;
  return /^\d{4}$/.test(id.toString().trim());
}

/**
 * Generates a unique 4-digit numeric ID (1000 - 9999) that does not conflict
 * with any existing ID in the provided list.
 */
export function generateUnique4DigitId(existingIds: string[] = []): string {
  const existingSet = new Set(
    existingIds
      .filter(Boolean)
      .map((id) => id.toString().trim().toLowerCase())
  );

  // Attempt random selection first
  for (let i = 0; i < 500; i++) {
    const candidate = Math.floor(1000 + Math.random() * 9000).toString();
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Sequential fallback if space is crowded
  for (let num = 1000; num <= 9999; num++) {
    const candidate = num.toString();
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Failsafe timestamp slice
  return Math.floor(1000 + (Date.now() % 9000)).toString();
}

/**
 * Formats a 4-digit ID for UI display (e.g. "4829" -> "#4829").
 */
export function formatDisplayId(id?: string | null): string {
  if (!id) return "#----";
  const clean = id.toString().trim();
  if (clean.startsWith("#")) return clean;
  return `#${clean}`;
}

/**
 * Masks a 10-digit mobile number for non-subscribers
 * (e.g. "9903797850" -> "+91 99037 •••••")
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "+91 ••••• •••••";
  const digits = phone.toString().replace(/\D/g, "");
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    // Show first 5 digits only for demo purposes, full number available to premium
    return `+91 ${last10.slice(0, 5)} •••••`;
  }
  return "+91 ••••• •••••";
}
