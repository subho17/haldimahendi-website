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

export async function sendWelcomeEmail(to: string, name: string): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter || !to) return { success: false, error: 'Email not configured or missing' };
  const from = `${SMTP_FROM_NAME} <${SMTP_FROM}>`;
  const firstName = (name || 'Member').split(' ')[0];
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;border:1px solid #fde68a;border-radius:16px;background:#fffbeb">
      <h2 style="color:#d97706;margin:0 0 8px">Welcome to HaldiMehendi, ${firstName}! 🎉</h2>
      <p style="color:#444;font-size:14px;line-height:1.6">Your matrimonial profile is now live. Verified members are already discovering you — complete your photos and preferences to get 3x more matches.</p>
      <div style="margin:20px 0;padding:16px;background:#fff;border:1px solid #fde68a;border-radius:12px">
        <p style="margin:0;color:#92400e;font-size:13px;font-weight:700">Next steps:</p>
        <ul style="margin:8px 0 0 18px;color:#444;font-size:13px;line-height:1.7">
          <li>Add 3+ clear photos</li>
          <li>Complete Partner Preferences</li>
          <li>Explore your daily matches</li>
        </ul>
      </div>
      <a href="https://haldimehendi.com/dashboard" style="display:inline-block;background:#d97706;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:800;font-size:13px">Go to Dashboard →</a>
      <p style="color:#999;font-size:11px;margin-top:20px">Need help? Reply to this email or visit haldimehendi.com/help</p>
      <p style="color:#999;font-size:11px">— Team HaldiMehendi</p>
    </div>
  `;
  try {
    await transporter.sendMail({ from, to, subject: `Welcome to HaldiMehendi, ${firstName}!`, text: `Welcome ${firstName}! Your HaldiMehendi profile is live. Visit https://haldimehendi.com/dashboard`, html });
    console.log(`[Welcome Email] Sent to ${to}`);
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to send welcome email';
    console.error('[Welcome Email]', msg);
    return { success: false, error: msg };
  }
}

export async function sendPremiumEmail(to: string, name: string, planName: string, expiresAt: string | null): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter || !to) return { success: false, error: 'Email not configured or missing' };
  const from = `${SMTP_FROM_NAME} <${SMTP_FROM}>`;
  const firstName = (name || 'Member').split(' ')[0];
  const expiryText = expiresAt ? `Valid till ${new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : '';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;border:1px solid #fde68a;border-radius:16px;background:#fffbeb">
      <h2 style="color:#d97706;margin:0 0 8px">You're Premium now, ${firstName}! ⭐</h2>
      <p style="color:#444;font-size:14px;line-height:1.6">Your <b>${planName}</b> membership is active. You now unlock unlimited chats, contact views, and priority matching.</p>
      <div style="margin:18px 0;padding:14px;background:#fff;border:1px dashed #d97706;border-radius:12px;text-align:center">
        <div style="font-size:18px;font-weight:800;color:#d97706">${planName}</div>
        <div style="font-size:12px;color:#999;margin-top:4px">${expiryText}</div>
      </div>
      <a href="https://haldimehendi.com/membership" style="display:inline-block;background:#d97706;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:800;font-size:13px">Explore Premium Benefits →</a>
      <p style="color:#999;font-size:11px;margin-top:20px">Questions? Reply to this email.</p>
      <p style="color:#999;font-size:11px">— Team HaldiMehendi</p>
    </div>
  `;
  try {
    await transporter.sendMail({ from, to, subject: `Your ${planName} is active!`, text: `Hi ${firstName}, your ${planName} membership is active. ${expiryText}`, html });
    console.log(`[Premium Email] ${planName} sent to ${to}`);
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to send premium email';
    console.error('[Premium Email]', msg);
    return { success: false, error: msg };
  }
}
