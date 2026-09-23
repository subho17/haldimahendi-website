import { NextResponse } from 'next/server';
import { saveOtp, checkSendAllowed, recordSend } from '@/lib/otpStore';
import { sendOtpEmail } from '@/lib/email';

function normalizeEmail(e: string) {
  return e.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emailRaw = (body.email || body.emailAddress || '').toString();
    const email = normalizeEmail(emailRaw);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address' }, { status: 400 });
    }
    const check = await checkSendAllowed(email);
    if (!check.allowed) {
      const msg = check.reason === 'locked' ? 'Too many OTP requests. Try later.' : check.reason === 'cooldown' ? `Please wait ${check.retryAfterSeconds}s before retrying.` : 'Too many requests.';
      return NextResponse.json({ success: false, message: msg, retryAfterSeconds: check.retryAfterSeconds }, { status: 429 });
    }
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await saveOtp(email, otpCode);
    await recordSend(email);
    const result = await sendOtpEmail(email, otpCode);
    console.log(`[OTP EMAIL] To: ${email} | OTP ${otpCode} | Delivered: ${result.success}`);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Failed to send OTP email. Check SMTP config.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: `OTP sent to ${email}` });
  } catch (e) {
    console.error('Failed to send email OTP:', e);
    return NextResponse.json({ success: false, message: 'Server error sending OTP' }, { status: 500 });
  }
}
