import { NextResponse } from 'next/server';
import { saveOtp, checkSendAllowed, recordSend } from '@/lib/otpStore';
import https from 'https';

// SMS Provider Configuration
const SMS_PROVIDER = (process.env.SMS_PROVIDER || 'smsmedia').toLowerCase().trim();

// SMS Media Settings
const SMS_MEDIA_KEY = (process.env.OTP_API_KEY || '36A586CB145C7D').trim();
const SMS_MEDIA_CAMPAIGN = (process.env.SMS_CAMPAIGN || '10604').trim();
const SMS_MEDIA_ROUTE_ID = (process.env.SMS_ROUTE_ID || '100867').trim();
const SMS_MEDIA_SENDER_ID = (process.env.SMS_SENDER_ID || 'GOODAY').trim();
const SMS_MEDIA_TEMPLATE_ID = (process.env.SMS_TEMPLATE_ID || '1707172038325802378').trim();
const SMS_MEDIA_PE_ID = (process.env.SMS_PE_ID || '1401856260000019479').trim();
const SMS_MESSAGE_TEMPLATE = (process.env.SMS_MESSAGE_TEMPLATE || 'Dear Member, Your client login account OTP is {#var#} It will expire in Five minutes. Do not share it with anyone. Thanks, -Webczar');

const SMS_TIMEOUT = 15000;

// Helper: https.get with timeout + retry + rejectUnauthorized:false (required for SMS Media gateway SSL)
function httpsGet(url: string, retries = 1): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve) => {
    let attempt = 0;

    const makeRequest = () => {
      const req = https.get(url, { rejectUnauthorized: false, timeout: SMS_TIMEOUT }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({ ok: res.statusCode === 200, status: res.statusCode || 0, body: data });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        console.error(`[SMS TIMEOUT] attempt=${attempt + 1}`);
        if (attempt < retries) {
          attempt++;
          setTimeout(makeRequest, 1500);
        } else {
          resolve({ ok: false, status: 0, body: '' });
        }
      });

      req.on('error', (err) => {
        console.error(`[SMS ERROR] attempt=${attempt + 1}:`, err.message);
        if (attempt < retries && (err.message.includes('ECONNRESET') || err.message.includes('socket hang up'))) {
          attempt++;
          setTimeout(makeRequest, 1500);
        } else {
          resolve({ ok: false, status: 0, body: '' });
        }
      });

      req.end();
    };

    makeRequest();
  });
}

// 2Factor.in Helper
async function send2FactorOtp(mobile: string, otp: string): Promise<{ success: boolean; data?: string }> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const apiKey = (process.env.OTP_API_KEY || '').trim();
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanMobile}/${otp}`;
  const res = await httpsGet(url);
  console.log('[2FACTOR API RESPONSE]:', res.status, res.body);
  if (res.ok && res.body.includes('"Status":"Success"')) {
    return { success: true, data: res.body };
  }
  return { success: false, data: res.body };
}

// Fast2SMS API Helper
async function sendFast2SmsOtp(mobile: string, otp: string): Promise<{ success: boolean; data?: string }> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const apiKey = (process.env.OTP_API_KEY || '').trim();
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otp}&numbers=${cleanMobile}`;
  const res = await httpsGet(url);
  console.log('[FAST2SMS API RESPONSE]:', res.status, res.body);
  if (res.ok && res.body.includes('"return":true')) {
    return { success: true, data: res.body };
  }
  return { success: false, data: res.body };
}

// SMS Media Gateway Helper
async function sendSmsMediaOtp(mobile: string, otp: string): Promise<{ success: boolean; shootId?: string }> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const messageText = SMS_MESSAGE_TEMPLATE.replace('{#var#}', otp);
  const encodedMessage = encodeURIComponent(messageText).replace(/%20/g, '+');

  const url = `https://login.smsmedia.org/app/smsapi/index.php?key=${SMS_MEDIA_KEY}&campaign=${SMS_MEDIA_CAMPAIGN}&routeid=${SMS_MEDIA_ROUTE_ID}&type=text&contacts=${cleanMobile}&senderid=${SMS_MEDIA_SENDER_ID}&msg=${encodedMessage}&template_id=${SMS_MEDIA_TEMPLATE_ID}&pe_id=${SMS_MEDIA_PE_ID}`;

  const res = await httpsGet(url, 2);
  console.log('[SMS MEDIA API RESPONSE]:', res.status, res.body);
  if (res.ok && (res.body.includes('SMS-SHOOT-ID') || res.body.includes('SUCCESS') || res.body.includes('OK') || res.body.length > 5)) {
    return { success: true, shootId: res.body.trim() };
  }
  return { success: false };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobileNumber } = body;

    if (!mobileNumber || typeof mobileNumber !== 'string' || mobileNumber.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Invalid 10-digit mobile number' },
        { status: 400 }
      );
    }

    // Rate limit + cooldown enforcement (server-side)
    const sendCheck = await checkSendAllowed(cleanMobile);
    if (!sendCheck.allowed) {
      const message =
        sendCheck.reason === 'locked'
          ? 'Too many OTP requests. Your number is temporarily blocked. Please try again later.'
          : sendCheck.reason === 'cooldown'
            ? `Please wait ${sendCheck.retryAfterSeconds}s before requesting another OTP.`
            : 'Too many OTP requests. Please try again in a few minutes.';
      return NextResponse.json({ success: false, message }, { status: 429 });
    }

    // Generate secure 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await saveOtp(cleanMobile, otpCode);
    await recordSend(cleanMobile);

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

    if (!smsResult.success) {
      console.error(`[OTP] SMS delivery FAILED for +91${cleanMobile}`);
      return NextResponse.json({
        success: false,
        message: 'Failed to send OTP via SMS. Please try again.',
      });
    }

    return NextResponse.json({
      success: true,
      message: `OTP code sent via SMS to +91 ${cleanMobile}!`,
    });
  } catch (err: unknown) {
    console.error('Failed to send OTP:', err);
    return NextResponse.json(
      { success: false, message: 'Server error sending OTP' },
      { status: 500 }
    );
  }
}
