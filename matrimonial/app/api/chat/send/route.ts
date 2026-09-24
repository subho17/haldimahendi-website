import { NextResponse } from 'next/server';
import { isAcceptedConnection } from '@/lib/interactionStore';
import { getConversationById, sendChatMessage } from '@/lib/chatStore';
import { isBlocked } from '@/lib/reportStore';
import { createNotification } from '@/lib/notificationStore';
import { buildProfileLookup } from '@/lib/profileLookup';
import { sendEmail, newMessageEmail, shouldSendEmail } from '@/lib/emailService';
import { canSendMessage, recordMessageSent, canViewProfile } from '@/lib/usageStore';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// POST /api/chat/send
// Body: { conversationId, senderId, recipientId, content, voiceUrl?, voiceDuration? }
// Sends a message. Requires the conversation to exist, sender/recipient to
// be its two participants, and the two users to be connected via an
// accepted interest.
// content: text message (required if voiceUrl not provided, or can be empty for voice-only)
// voiceUrl: optional audio file URL (Supabase Storage or similar)
// voiceDuration: optional duration in seconds
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conversationId = normalizeId(body.conversationId);
    const senderId = normalizeId(body.senderId);
    const recipientId = normalizeId(body.recipientId);
    const content = String(body.content || '').trim();
    const voiceUrl = String(body.voiceUrl || '').trim();
    const voiceDuration = body.voiceDuration !== undefined ? Number(body.voiceDuration) : undefined;

    if (!conversationId || !senderId || !recipientId) {
      return NextResponse.json(
        { success: false, message: 'Missing conversationId, senderId or recipientId' },
        { status: 400 }
      );
    }

    // Validate: either text content or voice message must be provided
    if (!content && !voiceUrl) {
      return NextResponse.json({ success: false, message: 'Either text or voice message required' }, { status: 400 });
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

    // Free limit also blocks chat
    const viewCheck = await canViewProfile(senderId);
    if (!viewCheck.allowed && viewCheck.upgradeRequired) {
      return NextResponse.json({
        success: false,
        message: 'You have reached your free limit. Wait for 24 hours to view more profiles.',
        limitReached: true,
        limit: viewCheck.limit,
        remaining: 0,
        upgradeRequired: true,
      }, { status: 403 });
    }

    // Check chat permission and daily limit
    const chatCheck = await canSendMessage(senderId);
    if (!chatCheck.canChat) {
      return NextResponse.json(
        { success: false, message: 'Chat is available for Silver plan and above. Upgrade to start messaging.', upgradeRequired: true },
        { status: 403 }
      );
    }
    if (!chatCheck.allowed) {
      return NextResponse.json(
        { success: false, message: 'Daily message limit reached. Upgrade your plan for more messages.', limit: chatCheck.limit, remaining: 0, upgradeRequired: chatCheck.upgradeRequired },
        { status: 403 }
      );
    }

    const message = await sendChatMessage(conversationId, senderId, recipientId, content, voiceUrl, voiceDuration);
    if (!message) {
      return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
    }

    // Record message sent
    await recordMessageSent(senderId);

    // In-app notification for the recipient (best-effort).
    try {
      const lookup = await buildProfileLookup();
      const sender = lookup.get(senderId);
      const recipient = lookup.get(recipientId);
      const preview = voiceUrl ? '(voice message)' : (content.slice(0, 80) || '(no text)');
      await createNotification(recipientId, 'message', `${sender?.name || 'A member'} sent you ${preview}`, {
        actorId: senderId,
        data: { conversationId, profileId: senderId, ...(voiceDuration !== undefined ? { voiceDuration: String(voiceDuration) } : {}) },
      });

      // Send email notification for new message
      if (recipient?.email && content) {
        const wantsEmail = await shouldSendEmail(recipientId, 'messages');
        if (wantsEmail) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com';
          const chatUrl = `${siteUrl}/chat`;
          const emailData = newMessageEmail(sender?.name || 'A member', content.slice(0, 100), chatUrl);
          
          await sendEmail({
            to: recipient.email,
            subject: emailData.subject,
            html: emailData.html,
          });
        }
      }
    } catch (e) {
      console.warn('[Chat] Failed to create message notification:', e);
    }

    return NextResponse.json({ success: true, message });
  } catch (e) {
    console.error('Error sending chat message:', e);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}