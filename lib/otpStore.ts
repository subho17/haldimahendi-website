// In-memory OTP store for development & server runtime
type OtpRecord = {
  code: string;
  expiresAt: number;
};

// Global object to persist store across HMR in Next.js dev server
const globalForOtp = global as unknown as {
  otpStore: Map<string, OtpRecord>;
};

export const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
}

export function saveOtp(mobileNumber: string, code: string, ttlSeconds = 300) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  otpStore.set(mobileNumber.trim(), { code, expiresAt });
}

export function verifyOtp(mobileNumber: string, code: string): { valid: boolean; reason?: string } {
  const cleanMobile = mobileNumber.trim();
  const record = otpStore.get(cleanMobile);

  if (!record) {
    return { valid: false, reason: "No OTP request found for this mobile number." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanMobile);
    return { valid: false, reason: "OTP has expired. Please request a new code." };
  }

  if (record.code !== code.trim()) {
    return { valid: false, reason: "Invalid OTP code. Please check and try again." };
  }

  // Clear OTP after successful verification
  otpStore.delete(cleanMobile);
  return { valid: true };
}
