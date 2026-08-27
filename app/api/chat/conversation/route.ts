import { NextResponse } from 'next/server';
import { isAcceptedConnection } from '@/lib/interactionStore';
import { getOrCreateConversation } from '@/lib/chatStore';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/chat/conversation?userId=:userId&otherId=:otherId
// Returns whether the two users are connected (accepted interest in either
// direction) and the existing conversation for the pair, if any.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    const otherId = normalizeId(searchParams.get('otherId'));

    if (!userId || !otherId) {
      return NextResponse.json({ success: false, message: 'Missing userId or otherId' }, { status: 400 });
    }
    if (userId === otherId) {
      return NextResponse.json({ success: false, message: 'Cannot chat with yourself' }, { status: 400 });
    }

    const accepted = await isAcceptedConnection(userId, otherId);
    if (!accepted) {
      return NextResponse.json({ success: true, accepted: false, conversation: null });
    }

    const conversation = await getOrCreateConversation(userId, otherId);
    return NextResponse.json({ success: true, accepted: true, conversation });
  } catch (e) {
    console.error('Error loading chat conversation:', e);
    return NextResponse.json({ success: false, message: 'Failed to load conversation' }, { status: 500 });
  }
}

// POST /api/chat/conversation
// Body: { userId, otherId }
// Creates (or returns) the conversation for the pair, but only when the two
// users are connected via a mutually accepted interest.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = normalizeId(body.userId);
    const otherId = normalizeId(body.otherId);

    if (!userId || !otherId) {
      return NextResponse.json({ success: false, message: 'Missing userId or otherId' }, { status: 400 });
    }
    if (userId === otherId) {
      return NextResponse.json({ success: false, message: 'Cannot chat with yourself' }, { status: 400 });
    }

    const accepted = await isAcceptedConnection(userId, otherId);
    if (!accepted) {
      return NextResponse.json(
        { success: false, message: 'Chat is only available for accepted connections' },
        { status: 403 }
      );
    }

    const conversation = await getOrCreateConversation(userId, otherId);
    return NextResponse.json({ success: true, conversation });
  } catch (e) {
    console.error('Error creating chat conversation:', e);
    return NextResponse.json({ success: false, message: 'Failed to create conversation' }, { status: 500 });
  }
}
