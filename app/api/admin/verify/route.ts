import { NextResponse } from 'next/server';
import crypto from 'crypto';

// POST /api/admin/verify
// Body: { password }  -> validates against ADMIN_KEY (dev default included).
// The client stores the key and sends it as x-admin-key on later admin calls.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body.password || '');

    const expected = (process.env.ADMIN_KEY || 'shaadi-admin-dev').trim();
    if (!expected) {
      return NextResponse.json({ success: false, message: 'Admin access is not configured.' }, { status: 500 });
    }

    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!ok) {
      return NextResponse.json({ success: false, message: 'Invalid admin password.' }, { status: 401 });
    }
    return NextResponse.json({ success: true, key: expected });
  } catch (e) {
    console.error('Error verifying admin password:', e);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
