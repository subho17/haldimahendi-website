import { NextResponse } from 'next/server';
import { isAcceptedConnection } from '@/lib/interactionStore';
import { getConversationById, sendChatMessage } from '@/lib/chatStore';
import { isBlocked } from '@/lib/reportStore';
import { createNotification } from '@/lib/notificationStore';
import { buildProfileLookup } from '@/lib/profileLookup';

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

    // Blocked members cannot message each other in either direction.
    const [blockedBySender, blockedByRecipient] = await Promise.all([
      isBlocked(senderId, recipientId),
      isBlocked(recipientId, senderId),
    ]);
    if (blockedBySender || blockedByRecipient) {
      return NextResponse.json(
        { success: false, message: 'You cannot message this member.' },
        { status: 403 }
      );
    }

    const message = await sendChatMessage(conversationId, senderId, recipientId, content);
    if (!message) {
      return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
    }

    // In-app notification for the recipient (best-effort).
    try {
      const lookup = await buildProfileLookup();
      const sender = lookup.get(senderId);
      await createNotification(recipientId, 'message', `${sender?.name || 'A member'} sent you a message: "${content.slice(0, 80)}"`, {
        actorId: senderId,
        title: 'New Message',
        data: { conversationId, profileId: senderId },
      });
    } catch (e) {
      console.warn('[Chat] Failed to create message notification:', e);
    }

    return NextResponse.json({ success: true, message });
  } catch (e) {
    console.error('Error sending chat message:', e);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}