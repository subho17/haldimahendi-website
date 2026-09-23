import nodemailer from 'nodemailer';

const SMTP_HOST = (process.env.SMTP_HOST || '').trim();
const SMTP_PORT = parseInt((process.env.SMTP_PORT || '587').trim(), 10);
const SMTP_USER = (process.env.SMTP_USER || '').trim();
const SMTP_PASS = (process.env.SMTP_PASS || '').trim();
const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@haldimehendi.com';
const SMTP_FROM_NAME = (process.env.SMTP_FROM_NAME || 'HaldiMehendi').trim();

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || 587,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in env.' };
  }
  const from = `${SMTP_FROM_NAME} <${SMTP_FROM}>`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <h2 style="color:#d97706;margin:0 0 12px">Your HaldiMehendi OTP</h2>
      <p style="color:#333;font-size:15px">Your verification code is:</p>
      <div style="font-size:32px;letter-spacing:8px;font-weight:800;color:#111;background:#fff7ed;border:2px dashed #d97706;padding:16px 12px;text-align:center;border-radius:12px;margin:16px 0">${otp}</div>
      <p style="color:#666;font-size:13px">It expires in 5 minutes. Do not share it with anyone.</p>
      <p style="color:#999;font-size:11px;margin-top:20px">— Team HaldiMehendi</p>
    </div>
  `;
  try {
    await transporter.sendMail({
      from,
      to,
      subject: `Your HaldiMehendi OTP is ${otp}`,
      text: `Your HaldiMehendi OTP is ${otp}. It expires in 5 minutes. Do not share it.`,
      html,
    });
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to send email';
    console.error('[Email OTP]', msg);
    return { success: false, error: msg };
  }
}
