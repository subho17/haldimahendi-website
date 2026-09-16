import { NextResponse } from 'next/server';
import {
  sendInterest,
  unsendInterest,
  shortlistProfile,
  unshortlistProfile,
  setInterestStatus,
  getSendState,
  getInbox,
  type InterestStatus,
} from '@/lib/interactionStore';
import { buildProfileLookup } from '@/lib/profileLookup';
import { isBlocked } from '@/lib/reportStore';
import { notifyInterestEvent } from '@/lib/notificationStore';
import { expandAllAliases } from '@/lib/userAliases';
import { canSendInterest, recordInterestSent, canShortlist, recordShortlist, getUsageSummary } from '@/lib/usageStore';
import { sendEmail, interestReceivedEmail, interestAcceptedEmail, shouldSendEmail } from '@/lib/emailService';

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

// GET /api/interests?userId=...
// Returns interest/shortlist state plus the inbox lists enriched with
// the other party's profile.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

    const [state, { received, sent }, lookup, usage] = await Promise.all([
      getSendState(userId),
      getInbox(userId),
      buildProfileLookup(),
      getUsageSummary(userId),
    ]);

    const rawAccepted = [
      ...(state.acceptedIds || []),
      ...received.filter((r) => r.status === 'accepted').map((r) => r.senderId),
      ...sent.filter((r) => r.status === 'accepted').map((r) => r.recipientId),
    ];
    const acceptedIds = await expandAllAliases(rawAccepted);

    const enrich = (
      rows: { senderId: string; recipientId: string; status: InterestStatus; createdAt: string }[],
      partnerField: 'senderId' | 'recipientId'
    ) =>
      rows.map((r) => ({
        id: `${r.senderId}->${r.recipientId}`,
        senderId: r.senderId,
        recipientId: r.recipientId,
        status: r.status,
        createdAt: r.createdAt,
        partner: lookup.get(normalizeId(r[partnerField])) || null,
      }));

    return NextResponse.json({
      success: true,
      sentIds: state.sentIds,
      shortlistedIds: state.shortlistedIds,
      acceptedIds: [...new Set(acceptedIds)],
      received: enrich(received, 'senderId'),
      sent: enrich(sent, 'recipientId'),
      usage: {
        interests: usage.interests,
        shortlists: usage.shortlists,
      },
    });
  } catch (e) {
    console.error('Error loading interests:', e);
    return NextResponse.json({ success: false, message: 'Failed to load interests' }, { status: 500 });
  }
}

// POST /api/interests
// Body: { actorId, otherId, action }
//   action: 'interest' | 'unsend' | 'shortlist' | 'unshortlist' | 'accept' | 'decline'
//   - interest/unsend    : actorId sends/withdraws interest to otherId
//   - shortlist/unshortlist : actorId bookmarks/unbookmarks otherId
//   - accept/decline     : actorId responds to an interest sent by otherId
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const actorId = normalizeId(body.actorId);
    const otherId = normalizeId(body.otherId);
    const action = String(body.action || '').trim();

    if (!actorId || !otherId) {
      return NextResponse.json({ success: false, message: 'Missing actorId or otherId' }, { status: 400 });
    }
    if (actorId === otherId) {
      return NextResponse.json({ success: false, message: 'Cannot interact with yourself' }, { status: 400 });
    }
    if (!['interest', 'unsend', 'shortlist', 'unshortlist', 'accept', 'decline'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    // Blocked members cannot send interests or shortlist each other.
    if (action === 'interest' || action === 'shortlist') {
      const [blockedByActor, blockedByOther] = await Promise.all([
        isBlocked(actorId, otherId),
        isBlocked(otherId, actorId),
      ]);
      if (blockedByActor || blockedByOther) {
        return NextResponse.json(
          { success: false, message: 'You cannot interact with this member.' },
          { status: 403 }
        );
      }
    }

    // Enforce membership plan limits for interests and shortlists
    if (action === 'interest') {
      const interestCheck = await canSendInterest(actorId);
      if (!interestCheck.allowed) {
        return NextResponse.json({
          success: false,
          message: `Monthly interest limit reached (${interestCheck.limit} sends/month). Upgrade your plan to send more interests.`,
          limitReached: true,
          limit: interestCheck.limit,
          remaining: interestCheck.remaining,
          upgradeRequired: interestCheck.upgradeRequired,
        }, { status: 403 });
      }
    }

    if (action === 'shortlist') {
      const shortlistCheck = await canShortlist(actorId);
      if (!shortlistCheck.allowed) {
        return NextResponse.json({
          success: false,
          message: `Shortlist limit reached (${shortlistCheck.limit} max). Upgrade your plan for unlimited shortlisting.`,
          limitReached: true,
          limit: shortlistCheck.limit,
          remaining: shortlistCheck.remaining,
          upgradeRequired: shortlistCheck.upgradeRequired,
        }, { status: 403 });
      }
    }

    switch (action) {
      case 'interest':
        await sendInterest(actorId, otherId);
        await recordInterestSent(actorId);
        break;
      case 'unsend':
        await unsendInterest(actorId, otherId);
        break;
      case 'shortlist':
        await shortlistProfile(actorId, otherId);
        await recordShortlist(actorId);
        break;
      case 'unshortlist':
        await unshortlistProfile(actorId, otherId);
        break;
      case 'accept':
        await setInterestStatus(otherId, actorId, 'accepted');
        break;
      case 'decline':
        await setInterestStatus(otherId, actorId, 'declined');
        break;
    }

    // Notify the other party about interest events (best-effort).
    if (action === 'interest' || action === 'accept') {
      try {
        const lookup = await buildProfileLookup();
        const actor = lookup.get(normalizeId(actorId));
        const recipient = lookup.get(normalizeId(otherId));
        await notifyInterestEvent({
          actorId,
          actorName: actor?.name || 'A member',
          recipientId: otherId,
          action: action === 'interest' ? 'interest' : 'accept',
        });

        // Send email notification
        if (recipient?.email) {
          const wantsEmail = await shouldSendEmail(otherId, 'interest');
          if (wantsEmail) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://haldimehendi.com';
            const actorProfileUrl = `${siteUrl}/profile/${actorId}`;
            const chatUrl = `${siteUrl}/chat`;
            
            const emailData = action === 'interest'
              ? interestReceivedEmail(actor?.name || 'A member', actorProfileUrl)
              : interestAcceptedEmail(actor?.name || 'A member', chatUrl);
            
            await sendEmail({
              to: recipient.email,
              subject: emailData.subject,
              html: emailData.html,
            });
          }
        }
      } catch (e) {
        console.warn('[Interests] Failed to create notification:', e);
      }
    }

    const state = await getSendState(actorId);
    return NextResponse.json({ success: true, action, state });
  } catch (e) {
    console.error('Error handling interest action:', e);
    return NextResponse.json({ success: false, message: 'Failed to process action' }, { status: 500 });
  }
}
