import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emailRaw = (body.email || body.emailAddress || '').toString();
    const email = emailRaw.trim().toLowerCase();
    const otp = (body.otp || body.code || '').toString();
    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 });
    }
    const result = await verifyOtp(email, otp);
    if (!result.valid) {
      return NextResponse.json({ success: false, message: result.reason || 'Invalid OTP' }, { status: result.locked ? 429 : 400 });
    }
    return NextResponse.json({ success: true, verified: true, message: 'Email verified successfully!' });
  } catch (e) {
    console.error('Failed to verify email OTP:', e);
    return NextResponse.json({ success: false, message: 'Server error verifying OTP' }, { status: 500 });
  }
}
