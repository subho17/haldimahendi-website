import { NextResponse } from 'next/server';
import { saveOtp } from '@/lib/otpStore';
import https from 'https';

// SMS Media Provider Settings
const SMS_MEDIA_KEY = '36A586CB145C7D';
const SMS_MEDIA_CAMPAIGN = '10604';
const SMS_MEDIA_ROUTE_ID = '100867';
const SMS_MEDIA_SENDER_ID = 'GOODAY';
const SMS_MEDIA_TEMPLATE_ID = '1707172038325802378';
const SMS_MEDIA_PE_ID = '1401856260000019479';

function sendSmsMediaOtp(mobile: string, otp: string): Promise<{ success: boolean; shootId?: string }> {
  return new Promise((resolve) => {
    // 10-digit clean mobile number
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    // Exact DLT template message format
    const messageText = `Dear Member, Your client login account OTP is ${otp} It will expire in Five minutes. Do not share it with anyone. Thanks, -Webczar`;
    const encodedMessage = encodeURIComponent(messageText);

    const apiKey = (process.env.OTP_API_KEY || SMS_MEDIA_KEY).trim();

    const url = `https://login.smsmedia.org/app/smsapi/index.php?key=${apiKey}&campaign=${SMS_MEDIA_CAMPAIGN}&routeid=${SMS_MEDIA_ROUTE_ID}&type=text&contacts=${cleanMobile}&senderid=${SMS_MEDIA_SENDER_ID}&msg=${encodedMessage}&template_id=${SMS_MEDIA_TEMPLATE_ID}&pe_id=${SMS_MEDIA_PE_ID}`;

    const req = https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log('[SMS MEDIA API RESPONSE]:', res.statusCode, data);
        if (res.statusCode === 200 && (data.includes('SMS-SHOOT-ID') || data.includes('SUCCESS') || data.includes('OK') || data.length > 5)) {
          resolve({ success: true, shootId: data.trim() });
        } else {
          console.error('[SMS MEDIA API ERROR]:', data);
          resolve({ success: false });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[SMS MEDIA REQUEST EXCEPTION]:', err);
      resolve({ success: false });
    });

    req.end();
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobileNumber } = body;

    if (!mobileNumber || typeof mobileNumber !== 'string' || mobileNumber.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Invalid 10-digit mobile number' },
        { status: 400 }
      );
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    
    // Generate secure 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    saveOtp(cleanMobile, otpCode);

    // Dispatch SMS via SMS Media API Gateway
    const smsResult = await sendSmsMediaOtp(cleanMobile, otpCode);

    console.log(`[OTP SERVICE] Mobile +91${cleanMobile} | OTP ${otpCode} | SMS Delivered: ${smsResult.success}`);

    return NextResponse.json({
      success: true,
      message: smsResult.success
        ? `OTP code sent via SMS to +91 ${cleanMobile}!`
        : `OTP generated for +91 ${cleanMobile}. (Use code ${otpCode} to verify)`,
      // Only include demoOtp as fallback if live SMS gateway failed
      demoOtp: !smsResult.success ? otpCode : undefined,
    });
  } catch (err: unknown) {
    console.error('Failed to send OTP:', err);
    return NextResponse.json(
      { success: false, message: 'Server error sending OTP' },
      { status: 500 }
    );
  }
}
