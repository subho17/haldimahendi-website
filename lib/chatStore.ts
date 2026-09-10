// Chat persistence — Postgres (Supabase) first, with a scratch/ JSON
// file fallback when DATABASE_URL is unset, mirroring the app pattern.
//
// Real-time delivery uses Supabase Realtime broadcast on channel
// `chat-<conversationId>` (see the chat UI). This store is the source
// of truth for messages regardless of realtime connectivity.
import fs from 'fs';
import path from 'path';
import { pool, hasPool, ensureChatTables } from '@/lib/db';

const CHAT_FILE = path.join(process.cwd(), 'scratch', 'chat_db.json');

export interface ChatConversation {
  id: string;
  userA: string;
  userB: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  createdAt?: string | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  voiceUrl?: string | null; // Optional: audio file URL (Supabase Storage or similar)
  voiceDuration?: number | null; // Optional: duration in seconds
  createdAt: string;
  readAt?: string | null;
}

export interface ChatThread {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
}

interface ChatFile {
  conversations: ChatConversation[];
  messages: ChatMessage[];
}

function ensureFile() {
  const dir = path.dirname(CHAT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(CHAT_FILE)) {
    fs.writeFileSync(CHAT_FILE, JSON.stringify({ conversations: [], messages: [] }, null, 2));
  }
}

function readFile(): ChatFile {
  try {
    ensureFile();
    const parsed = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf-8') || '{}');
    return {
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    };
  } catch (e) {
    console.warn('[Chat] Failed to read chat file:', e);
    return { conversations: [], messages: [] };
  }
}

function writeFile(state: ChatFile) {
  try {
    ensureFile();
    fs.writeFileSync(CHAT_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn('[Chat] Failed to write chat file:', e);
  }
}

export function canonicalPair(a: string, b: string): { userA: string; userB: string } {
  return a < b ? { userA: a, userB: b } : { userA: b, userB: a };
}

function pgIso(v: unknown): string {
  if (!v) return '';
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

// ------------------------------------------------------------------
// Conversations
// ------------------------------------------------------------------
export async function getOrCreateConversation(a: string, b: string): Promise<ChatConversation | null> {
  const { userA, userB } = canonicalPair(a, b);
  if (!userA || !userB || userA === userB) return null;

  if (hasPool) {
    try {
      await ensureChatTables();
      await pool!.query(
        `INSERT INTO conversations (user_a, user_b)
         VALUES ($1, $2)
         ON CONFLICT (user_a, user_b) DO NOTHING`,
        [userA, userB]
      );
      const { rows } = await pool!.query(
        `SELECT id, user_a, user_b, last_message, last_message_at, created_at
         FROM conversations WHERE user_a = $1 AND user_b = $2`,
        [userA, userB]
      );
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          userA: r.user_a,
          userB: r.user_b,
          lastMessage: r.last_message,
          lastMessageAt: r.last_message_at ? pgIso(r.last_message_at) : null,
          createdAt: r.created_at ? pgIso(r.created_at) : null,
        };
      }
    } catch (e) {
      console.warn('[Chat] PG conversation create failed, using file:', e);
    }
  }

  const file = readFile();
  let conv = file.conversations.find((c) => c.userA === userA && c.userB === userB);
  if (!conv) {
    conv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userA,
      userB,
      lastMessage: null,
      lastMessageAt: null,
      createdAt: new Date().toISOString(),
    };
    file.conversations.push(conv);
    writeFile(file);
  }
  return conv;
}

export async function getConversationById(id: string): Promise<ChatConversation | null> {
  if (hasPool) {
    try {
      await ensureChatTables();
      const { rows } = await pool!.query(
        `SELECT id, user_a, user_b, last_message, last_message_at, created_at
         FROM conversations WHERE id = $1`,
        [id]
      );
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          userA: r.user_a,
          userB: r.user_b,
          lastMessage: r.last_message,
          lastMessageAt: r.last_message_at ? pgIso(r.last_message_at) : null,
          createdAt: r.created_at ? pgIso(r.created_at) : null,
        };
      }
    } catch (e) {
      console.warn('[Chat] PG conversation lookup failed:', e);
    }
  }
  const file = readFile();
  return file.conversations.find((c) => c.id === id) || null;
}

// ------------------------------------------------------------------
// Messages
// ------------------------------------------------------------------
export async function getThread(conversationId: string, requesterId: string): Promise<ChatThread> {
  const conversation = await getConversationById(conversationId);
  if (!conversation) return { conversation: null, messages: [] };
  if (conversation.userA !== requesterId && conversation.userB !== requesterId) {
    return { conversation: null, messages: [] };
  }

  if (hasPool) {
    try {
      await ensureChatTables();
      const { rows } = await pool!.query(
        `SELECT id, conversation_id, sender_id, recipient_id, content, voice_url, voice_duration, created_at, read_at
         FROM chat_messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC`,
        [conversationId]
      );
      return {
        conversation,
        messages: rows.map((m) => ({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          recipientId: m.recipient_id,
          content: m.content,
          voiceUrl: m.voice_url,
          voiceDuration: m.voice_duration,
          createdAt: pgIso(m.created_at),
          readAt: m.read_at ? pgIso(m.read_at) : null,
        })),
      };
    } catch (e) {
      console.warn('[Chat] PG messages read failed, using file:', e);
    }
  }

  const file = readFile();
  return {
    conversation,
    messages: file.messages.filter((m) => m.conversationId === conversationId).sort((x, y) => x.createdAt.localeCompare(y.createdAt)),
  };
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  content: string,
  voiceUrl?: string,
  voiceDuration?: number
): Promise<ChatMessage | null> {
  const cleanContent = (content || '').trim();
  if (!conversationId || !senderId || !recipientId || (!cleanContent && !voiceUrl)) return null;

  if (hasPool) {
    try {
      await ensureChatTables();
      const { rows } = await pool!.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, recipient_id, content, voice_url, voice_duration)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, conversation_id, sender_id, recipient_id, content, voice_url, voice_duration, created_at, read_at`,
        [conversationId, senderId, recipientId, cleanContent, voiceUrl, voiceDuration]
      );
      await pool!.query(
        `UPDATE conversations SET last_message = $2, last_message_at = now() WHERE id = $1`,
        [conversationId, cleanContent || (voiceUrl ? 'Voice message' : '')]
      );
      const m = rows[0];
      return {
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        recipientId: m.recipient_id,
        content: m.content,
        voiceUrl: m.voice_url,
        voiceDuration: m.voice_duration,
        createdAt: pgIso(m.created_at),
        readAt: m.read_at ? pgIso(m.read_at) : null,
      };
    } catch (e) {
      console.warn('[Chat] PG message send failed, using file:', e);
    }
  }

  const file = readFile();
  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    conversationId,
    senderId,
    recipientId,
    content: cleanContent,
    voiceUrl,
    voiceDuration,
    createdAt: new Date().toISOString(),
    readAt: null,
  };
  file.messages.push(message);
  const conv = file.conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = cleanContent;
    conv.lastMessageAt = message.createdAt;
  }
  writeFile(file);
  return message;
}

export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  if (hasPool) {
    try {
      await ensureChatTables();
      await pool!.query(
        `UPDATE chat_messages SET read_at = COALESCE(read_at, now())
         WHERE conversation_id = $1 AND recipient_id = $2 AND read_at IS NULL`,
        [conversationId, userId]
      );
    } catch (e) {
      console.warn('[Chat] PG mark read failed:', e);
    }
  }
  const file = readFile();
  file.messages.forEach((m) => {
    if (m.conversationId === conversationId && m.recipientId === userId && !m.readAt) {
      m.readAt = new Date().toISOString();
    }
  });
  writeFile(file);
}

// ------------------------------------------------------------------
// Conversation lists
// ------------------------------------------------------------------
export async function listConversations(
  userId: string
): Promise<(ChatConversation & { unread: number })[]> {
  if (hasPool) {
    try {
      await ensureChatTables();
      const { rows } = await pool!.query(
        `SELECT c.id, c.user_a, c.user_b, c.last_message, c.last_message_at, c.created_at,
                (SELECT count(*) FROM chat_messages m
                  WHERE m.conversation_id = c.id AND m.recipient_id = $1 AND m.read_at IS NULL) AS unread
         FROM conversations c
         WHERE c.user_a = $1 OR c.user_b = $1
         ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
        [userId]
      );
      return rows.map((r) => ({
        id: r.id,
        userA: r.user_a,
        userB: r.user_b,
        lastMessage: r.last_message,
        lastMessageAt: r.last_message_at ? pgIso(r.last_message_at) : null,
        createdAt: r.created_at ? pgIso(r.created_at) : null,
        unread: Number(r.unread || 0),
      }));
    } catch (e) {
      console.warn('[Chat] PG list conversations failed, using file:', e);
    }
  }

  const file = readFile();
  return file.conversations
    .filter((c) => c.userA === userId || c.userB === userId)
    .map((c) => ({
      ...c,
      unread: file.messages.filter((m) => m.conversationId === c.id && m.recipientId === userId && !m.readAt).length,
    }))
    .sort((x, y) => (y.lastMessageAt || y.createdAt || '').localeCompare(x.lastMessageAt || x.createdAt || ''));
}