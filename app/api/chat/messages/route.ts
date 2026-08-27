import { NextResponse } from 'next/server';
import { getThread, markConversationRead } from '@/lib/chatStore';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/chat/messages?userId=:userId&conversationId=:conversationId
// Returns the message thread; only participants may read it. Also marks
// messages from the other party as read.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    const conversationId = normalizeId(searchParams.get('conversationId'));

    if (!userId || !conversationId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId or conversationId' },
        { status: 400 }
      );
    }

    const thread = await getThread(conversationId, userId);
    if (!thread.conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found or not accessible' },
        { status: 403 }
      );
    }

    await markConversationRead(conversationId, userId);

    return NextResponse.json({ success: true, ...thread });
  } catch (e) {
    console.error('Error loading chat thread:', e);
    return NextResponse.json({ success: false, message: 'Failed to load messages' }, { status: 500 });
  }
}
