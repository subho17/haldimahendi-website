import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SMTP_USER) {
    console.warn('[Email] SMTP not configured, skipping email send');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'HaldiMeHendi'}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

export async function shouldSendEmail(userId: string, emailType: 'interest' | 'messages' | 'matches'): Promise<boolean> {
  // Default to sending emails if preferences not set
  const prefKey = `email_${emailType}`;
  
  try {
    const { pool, hasPool, ensureProfilesTable } = await import('@/lib/db');
    
    if (hasPool) {
      await ensureProfilesTable();
      const { rows } = await pool!.query(
        `SELECT ${prefKey} FROM profiles WHERE user_id = $1 OR mobile_number = $1`,
        [userId]
      );
      if (rows.length > 0) {
        return rows[0][prefKey] !== false;
      }
    }
  } catch (e) {
    console.warn('[Email] Failed to check preferences:', e);
  }
  
  return true; // Default to sending
}

export function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #e91e63, #ff5722); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; color: #333; line-height: 1.6; }
    .btn { display: inline-block; background: #e91e63; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HaldiMeHendi</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>HaldiMeHendi - Finding Your Perfect Match</p>
      <p>You received this email because you have an account on HaldiMeHendi.</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/profile">Manage Email Preferences</a></p>
    </div>
  </div>
</body>
</html>`;
}

export function interestReceivedEmail(actorName: string, actorProfileUrl: string): { subject: string; html: string } {
  return {
    subject: `${actorName} sent you an interest!`,
    html: baseTemplate(`
      <h2>New Interest Received</h2>
      <p>Great news! <strong>${actorName}</strong> has sent you an interest.</p>
      <p>View their profile to learn more about them and respond to their interest.</p>
      <a href="${actorProfileUrl}" class="btn">View Profile</a>
      <p>Don't keep them waiting - respond now!</p>
    `),
  };
}

export function interestAcceptedEmail(actorName: string, chatUrl: string): { subject: string; html: string } {
  return {
    subject: `${actorName} accepted your interest!`,
    html: baseTemplate(`
      <h2>Interest Accepted!</h2>
      <p>Congratulations! <strong>${actorName}</strong> has accepted your interest.</p>
      <p>You can now start chatting with them. Get to know each other better!</p>
      <a href="${chatUrl}" class="btn">Start Chatting</a>
      <p>This is a great step towards finding your perfect match!</p>
    `),
  };
}

export function newMessageEmail(actorName: string, messagePreview: string, chatUrl: string): { subject: string; html: string } {
  return {
    subject: `New message from ${actorName}`,
    html: baseTemplate(`
      <h2>New Message</h2>
      <p><strong>${actorName}</strong> sent you a message:</p>
      <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #e91e63; margin: 15px 0;">
        "${messagePreview}"
      </blockquote>
      <a href="${chatUrl}" class="btn">Reply Now</a>
    `),
  };
}

export function matchSuggestionEmail(matchName: string, matchProfileUrl: string, matchScore: number): { subject: string; html: string } {
  return {
    subject: `New match suggestion: ${matchName}`,
    html: baseTemplate(`
      <h2>New Match Found!</h2>
      <p>We found someone special for you!</p>
      <p><strong>${matchName}</strong> matches your preferences with a <strong>${matchScore}% compatibility score</strong>.</p>
      <p>Check out their profile and see if they could be the one!</p>
      <a href="${matchProfileUrl}" class="btn">View Profile</a>
    `),
  };
}

export function profileViewedEmail(viewerName: string): { subject: string; html: string } {
  return {
    subject: `${viewerName} viewed your profile`,
    html: baseTemplate(`
      <h2>Profile View</h2>
      <p><strong>${viewerName}</strong> viewed your profile.</p>
      <p>They might be interested in you! Check out their profile and consider sending an interest.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/search" class="btn">Find Them</a>
    `),
  };
}
