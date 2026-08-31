import { NextRequest, NextResponse } from 'next/server';
import { pool, hasPool, ensureProfilesTable } from '@/lib/db';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

const CREDIT_PACKAGES = {
  5: { price: 199, label: '5 contacts' },
  15: { price: 499, label: '15 contacts' },
  50: { price: 999, label: '50 contacts' },
};

async function getCredits(userId: string) {
  if (!hasPool) return { credits: 0, expiresAt: null, source: null };

  try {
    await pool!.query(`CREATE TABLE IF NOT EXISTS contact_credits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      credits INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ,
      purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      source TEXT,
      UNIQUE (user_id)
    )`);

    const { rows } = await pool!.query(
      `SELECT credits, expires_at, source FROM contact_credits WHERE user_id = $1`,
      [userId]
    );
    const credits = rows[0] || { credits: 0, expires_at: null, source: null };

    let membershipCredits = 0;
    try {
      const { rows: profileRows } = await pool!.query(
        `SELECT contact_credits FROM profiles WHERE user_id = $1 OR mobile_number = $1`,
        [userId]
      );
      if (profileRows.length > 0) {
        membershipCredits = profileRows[0].contact_credits || 0;
      }
    } catch (e) {
      console.warn('[Contact Credits] Membership credits check failed:', e);
    }

    return {
      credits: credits.credits + membershipCredits,
      expiresAt: credits.expires_at,
      source: credits.source,
    };
  } catch (e) {
    console.warn('[Contact Credits] DB query failed:', e);
    return { credits: 0, expiresAt: null, source: null };
  }
}

async function addCredits(userId: string, packageSize: number, expiresAt: string) {
  if (!hasPool) return { success: false, message: 'Database not available' };

  try {
    await pool!.query(`CREATE TABLE IF NOT EXISTS contact_credits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      credits INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ,
      purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      source TEXT,
      UNIQUE (user_id)
    )`);

    await pool!.query(
      `INSERT INTO contact_credits (user_id, credits, expires_at, purchased_at, source)
       VALUES ($1, $2, $3, now(), 'purchase')
       ON CONFLICT (user_id) DO UPDATE SET
         credits = contact_credits.credits + EXCLUDED.credits,
         expires_at = GREATEST(contact_credits.expires_at, EXCLUDED.expires_at),
         purchased_at = now(),
         source = 'purchase'`,
      [userId, packageSize, expiresAt]
    );

    await pool!.query(
      `UPDATE profiles SET contact_credits = COALESCE(contact_credits, 0) + $2, updated_at = now()
       WHERE user_id = $1 OR mobile_number = $1`,
      [userId, packageSize]
    );
  } catch (e) {
    console.warn('[Contact Credits] DB insert failed:', e);
    throw e;
  }
}

async function consumeCredits(userId: string, credits: number) {
  if (!hasPool) return;

  try {
    await pool!.query(
      `UPDATE contact_credits SET credits = GREATEST(credits - $2, 0) WHERE user_id = $1`,
      [userId, credits]
    );

    await pool!.query(
      `UPDATE profiles SET contact_credits = GREATEST(COALESCE(contact_credits, 0) - $2, 0), updated_at = now()
       WHERE user_id = $1 OR mobile_number = $1`,
      [userId, credits]
    );
  } catch (e) {
    console.warn('[Contact Credits] Consume failed:', e);
    throw e;
  }
}

async function handleGET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    const result = await getCredits(userId);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error('Error fetching contact credits:', e);
    return NextResponse.json({ success: false, message: 'Failed to fetch credits' }, { status: 500 });
  }
}

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    const userId = normalizeId(body.userId);
    const packageSize = body.package;

    if (!userId || !packageSize) {
      return NextResponse.json({ success: false, message: 'Missing userId or package' }, { status: 400 });
    }
    if (!CREDIT_PACKAGES[packageSize as keyof typeof CREDIT_PACKAGES]) {
      return NextResponse.json({ success: false, message: 'Invalid package' }, { status: 400 });
    }

    const pack = CREDIT_PACKAGES[packageSize as keyof typeof CREDIT_PACKAGES];
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    await addCredits(userId, packageSize, expiresAt);

    // Update scratch file
    const fs = require('fs');
    const path = require('path');
    const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
        const idx = users.findIndex((u: any) =>
          u.profileId === userId || u.mobileNumber === userId || u.mobile_number === userId || u.email === userId
        );
        if (idx >= 0) {
          users[idx].contact_credits = (users[idx].contact_credits || 0) + packageSize;
          users[idx].updatedAt = new Date().toISOString();
          fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }
      }
    } catch (e) {
      console.warn('[Contact Credits] Scratch update failed:', e);
    }

    return NextResponse.json({ success: true, creditsAdded: packageSize, totalCost: CREDIT_PACKAGES[packageSize as keyof typeof CREDIT_PACKAGES].price });
  } catch (e) {
    console.error('Error purchasing contact credits:', e);
    return NextResponse.json({ success: false, message: 'Failed to purchase credits' }, { status: 500 });
  }
}

async function handleDELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    const credits = parseInt(searchParams.get('credits') || '1', 10);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    await consumeCredits(userId, credits);

    // Update scratch
    const fs = require('fs');
    const path = require('path');
    const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');
    try {
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
        const idx = users.findIndex((u: any) =>
          u.profileId === userId || u.mobileNumber === userId || u.mobile_number === userId || u.email === userId
        );
        if (idx >= 0) {
          users[idx].contact_credits = Math.max((users[idx].contact_credits || 0) - credits, 0);
          users[idx].updatedAt = new Date().toISOString();
          fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }
      }
    } catch (e) {
      console.warn('[Contact Credits] Scratch consume failed:', e);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error consuming contact credits:', e);
    return NextResponse.json({ success: false, message: 'Failed to consume credits' }, { status: 500 });
  }
}

export const GET = handleGET;
export const POST = handlePOST;
export const DELETE = handleDELETE;