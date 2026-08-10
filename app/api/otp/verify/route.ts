import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobileNumber, otp } = body;

    if (!mobileNumber || !otp) {
      return NextResponse.json(
        { success: false, message: 'Mobile number and OTP code are required' },
        { status: 400 }
      );
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    const result = verifyOtp(cleanMobile, otp);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, message: result.reason || 'Invalid OTP code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Mobile number verified successfully!',
    });
  } catch (err: unknown) {
    console.error('Failed to verify OTP:', err);
    return NextResponse.json(
      { success: false, message: 'Server error verifying OTP' },
      { status: 500 }
    );
  }
}
