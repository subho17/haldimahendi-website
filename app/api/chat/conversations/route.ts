import { NextResponse } from 'next/server';
import { listConversations } from '@/lib/chatStore';
import { buildProfileLookup } from '@/lib/profileLookup';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/chat/conversations?userId=:userId
// Returns all conversations for the user (newest first) enriched with the
// other party's profile and an unread message count.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

    const [conversations, lookup] = await Promise.all([
      listConversations(userId),
      buildProfileLookup(),
    ]);

    return NextResponse.json({
      success: true,
      conversations: conversations.map((c) => ({
        ...c,
        partner: lookup.get(c.userA === userId ? c.userB : c.userA) || null,
      })),
    });
  } catch (e) {
    console.error('Error listing chat conversations:', e);
    return NextResponse.json({ success: false, message: 'Failed to load conversations' }, { status: 500 });
  }
}
