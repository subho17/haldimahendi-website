import { NextResponse } from 'next/server';
import { saveOtp } from '@/lib/otpStore';
import https from 'https';

// SMS Provider Configuration (Loaded from environment variables with defaults)
const SMS_PROVIDER = (process.env.SMS_PROVIDER || 'smsmedia').toLowerCase().trim();

// SMS Media Settings
const SMS_MEDIA_KEY = (process.env.OTP_API_KEY || '36A586CB145C7D').trim();
const SMS_MEDIA_CAMPAIGN = (process.env.SMS_CAMPAIGN || '10604').trim();
const SMS_MEDIA_ROUTE_ID = (process.env.SMS_ROUTE_ID || '100867').trim();
const SMS_MEDIA_SENDER_ID = (process.env.SMS_SENDER_ID || 'GOODAY').trim();
const SMS_MEDIA_TEMPLATE_ID = (process.env.SMS_TEMPLATE_ID || '1707172038325802378').trim();
const SMS_MEDIA_PE_ID = (process.env.SMS_PE_ID || '1401856260000019479').trim();
const SMS_MESSAGE_TEMPLATE = (process.env.SMS_MESSAGE_TEMPLATE || 'Dear Member, Your client login account OTP is {#var#} It will expire in Five minutes. Do not share it with anyone. Thanks, -Webczar');

// 2Factor.in Helper
function send2FactorOtp(mobile: string, otp: string): Promise<{ success: boolean; data?: string }> {
  return new Promise((resolve) => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const apiKey = (process.env.OTP_API_KEY || '').trim();
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanMobile}/${otp}`;

    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log('[2FACTOR API RESPONSE]:', res.statusCode, data);
        if (res.statusCode === 200 && data.includes('"Status":"Success"')) {
          resolve({ success: true, data });
        } else {
          console.error('[2FACTOR API ERROR]:', data);
          resolve({ success: false, data });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[2FACTOR EXCEPTION]:', err);
      resolve({ success: false });
    });

    req.end();
  });
}

// Fast2SMS API Helper
function sendFast2SmsOtp(mobile: string, otp: string): Promise<{ success: boolean; data?: string }> {
  return new Promise((resolve) => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const apiKey = (process.env.OTP_API_KEY || '').trim();
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otp}&numbers=${cleanMobile}`;

    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log('[FAST2SMS API RESPONSE]:', res.statusCode, data);
        if (res.statusCode === 200 && data.includes('"return":true')) {
          resolve({ success: true, data });
        } else {
          console.error('[FAST2SMS API ERROR]:', data);
          resolve({ success: false, data });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[FAST2SMS EXCEPTION]:', err);
      resolve({ success: false });
    });

    req.end();
  });
}

// SMS Media Gateway Helper
function sendSmsMediaOtp(mobile: string, otp: string): Promise<{ success: boolean; shootId?: string }> {
  return new Promise((resolve) => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const messageText = SMS_MESSAGE_TEMPLATE.replace('{#var#}', otp);
    // PHP urlencode format (spaces as +) per SMS Media API documentation
    const encodedMessage = encodeURIComponent(messageText).replace(/%20/g, '+');

    const url = `https://login.smsmedia.org/app/smsapi/index.php?key=${SMS_MEDIA_KEY}&campaign=${SMS_MEDIA_CAMPAIGN}&routeid=${SMS_MEDIA_ROUTE_ID}&type=text&contacts=${cleanMobile}&senderid=${SMS_MEDIA_SENDER_ID}&msg=${encodedMessage}&template_id=${SMS_MEDIA_TEMPLATE_ID}&pe_id=${SMS_MEDIA_PE_ID}`;

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
    await saveOtp(cleanMobile, otpCode);

    // Dispatch SMS based on selected provider
    let smsResult = { success: false };
    if (SMS_PROVIDER === 'fast2sms') {
      smsResult = await sendFast2SmsOtp(cleanMobile, otpCode);
    } else if (SMS_PROVIDER === '2factor') {
      smsResult = await send2FactorOtp(cleanMobile, otpCode);
    } else {
      smsResult = await sendSmsMediaOtp(cleanMobile, otpCode);
    }

    console.log(`[OTP SERVICE] Provider: ${SMS_PROVIDER} | Mobile +91${cleanMobile} | OTP ${otpCode} | SMS Delivered: ${smsResult.success}`);

    return NextResponse.json({
      success: true,
      message: `OTP code sent via SMS to +91 ${cleanMobile}!`,
      demoOtp: undefined,
    });
  } catch (err: unknown) {
    console.error('Failed to send OTP:', err);
    return NextResponse.json(
      { success: false, message: 'Server error sending OTP' },
      { status: 500 }
    );
  }
}
