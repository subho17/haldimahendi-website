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

// --- MVP 15 Templates ---

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: `Welcome to HaldiMeHendi, ${name}!`,
    html: baseTemplate(`
      <h2>Welcome, ${name}!</h2>
      <p>Your HaldiMeHendi account has been created. We’re excited to help you find your perfect match.</p>
      <p>Complete your profile, add photos, and set partner preferences to get 3× more interests.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/profile" class="btn">Complete Profile</a>
    `),
  };
}

export function emailOtpEmail(otp: string): { subject: string; html: string } {
  return {
    subject: `Your HaldiMeHendi OTP is ${otp}`,
    html: baseTemplate(`
      <h2>Email Verification</h2>
      <p>Your OTP to verify your email is <strong style="font-size:22px;letter-spacing:4px">${otp}</strong></p>
      <p>This code expires in 10 minutes. Do not share it with anyone.</p>
    `),
  };
}

export function forgotPasswordOtpEmail(otp: string): { subject: string; html: string } {
  return {
    subject: `Reset your password — OTP ${otp}`,
    html: baseTemplate(`
      <h2>Password Reset</h2>
      <p>Your OTP to reset your password is <strong style="font-size:22px;letter-spacing:4px">${otp}</strong></p>
      <p>Expires in 10 minutes. If you didn’t request this, ignore this email.</p>
    `),
  };
}

export function passwordChangedEmail(): { subject: string; html: string } {
  return {
    subject: `Your password was changed`,
    html: baseTemplate(`
      <h2>Password Changed</h2>
      <p>Your HaldiMeHendi password was changed successfully.</p>
      <p>If this wasn’t you, reset your password immediately and contact support.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/auth/login" class="btn">Secure Account</a>
    `),
  };
}

export function newLoginAlertEmail(city?: string): { subject: string; html: string } {
  return {
    subject: `New login to your account`,
    html: baseTemplate(`
      <h2>New Login Alert</h2>
      <p>We detected a new login to your HaldiMeHendi account${city ? ` from <strong>${city}</strong>` : ''}.</p>
      <p>If this was you, ignore this email. If not, change your password now.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/settings" class="btn">Review Security</a>
    `),
  };
}

export function profileApprovedEmail(): { subject: string; html: string } {
  return {
    subject: `Your profile is now live!`,
    html: baseTemplate(`
      <h2>Profile Approved</h2>
      <p>Great news! Your HaldiMeHendi profile has been approved and is now visible to matches.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/matches" class="btn">View Matches</a>
    `),
  };
}

export function profileRejectedEmail(reason?: string): { subject: string; html: string } {
  return {
    subject: `Action needed on your profile`,
    html: baseTemplate(`
      <h2>Profile Needs Changes</h2>
      <p>Your profile was not approved${reason ? `: <strong>${reason}</strong>` : ''}.</p>
      <p>Please update your profile and resubmit for verification.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/profile" class="btn">Update Profile</a>
    `),
  };
}

export function newMatchEmail(count: number): { subject: string; html: string } {
  return {
    subject: `You have ${count} new match${count > 1 ? 'es' : ''} today`,
    html: baseTemplate(`
      <h2>New Matches</h2>
      <p>We found <strong>${count} new match${count > 1 ? 'es' : ''}</strong> for you today based on your preferences.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/matches" class="btn">View Matches</a>
    `),
  };
}

export function paymentSuccessEmail(planName: string, amount: string): { subject: string; html: string } {
  return {
    subject: `Payment successful — ${planName} ${amount}`,
    html: baseTemplate(`
      <h2>Payment Successful</h2>
      <p>Your <strong>${planName}</strong> subscription for <strong>${amount}</strong> is confirmed.</p>
      <p>Enjoy premium features: unlimited chats, contact views, and priority matching.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/membership" class="btn">Manage Membership</a>
    `),
  };
}

export function subscriptionExpiryEmail(planName: string, daysLeft: number): { subject: string; html: string } {
  return {
    subject: `Your ${planName} expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
    html: baseTemplate(`
      <h2>Subscription Expiring Soon</h2>
      <p>Your <strong>${planName}</strong> plan expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.</p>
      <p>Renew now to keep chatting, viewing contacts, and staying boosted.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com'}/membership" class="btn">Renew Now</a>
    `),
  };
}

export function accountDeactivatedEmail(): { subject: string; html: string } {
  return {
    subject: `Your account has been deactivated`,
    html: baseTemplate(`
      <h2>Account Deactivated</h2>
      <p>Your HaldiMeHendi account has been deactivated as requested.</p>
      <p>You can reactivate within 30 days by logging in again. Contact support if this was a mistake.</p>
    `),
  };
}
