import { NextResponse } from 'next/server';
import { isAcceptedConnection } from '@/lib/interactionStore';
import { getConversationById, sendChatMessage } from '@/lib/chatStore';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// POST /api/chat/send
// Body: { conversationId, senderId, recipientId, content }
// Sends a message. Requires the conversation to exist, sender/recipient to
// be its two participants, and the two users to be connected via an
// accepted interest.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conversationId = normalizeId(body.conversationId);
    const senderId = normalizeId(body.senderId);
    const recipientId = normalizeId(body.recipientId);
    const content = String(body.content || '').trim();

    if (!conversationId || !senderId || !recipientId) {
      return NextResponse.json(
        { success: false, message: 'Missing conversationId, senderId or recipientId' },
        { status: 400 }
      );
    }
    if (!content) {
      return NextResponse.json({ success: false, message: 'Message cannot be empty' }, { status: 400 });
    }
    if (senderId === recipientId) {
      return NextResponse.json({ success: false, message: 'Cannot message yourself' }, { status: 400 });
    }

    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 });
    }
    const participants = [conversation.userA, conversation.userB];
    if (!participants.includes(senderId) || !participants.includes(recipientId)) {
      return NextResponse.json({ success: false, message: 'Not a conversation participant' }, { status: 403 });
    }

    const accepted = await isAcceptedConnection(senderId, recipientId);
    if (!accepted) {
      return NextResponse.json(
        { success: false, message: 'Chat is only available for accepted connections' },
        { status: 403 }
      );
    }

    const message = await sendChatMessage(conversationId, senderId, recipientId, content);
    if (!message) {
      return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message });
  } catch (e) {
    console.error('Error sending chat message:', e);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}