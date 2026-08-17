-- Reference schema for production. The app also auto-creates this table
-- on first use when DATABASE_URL is set, so this file is optional.
-- Run in: Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS otp_codes (
  mobile_number  TEXT PRIMARY KEY,
  code           TEXT NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at    TIMESTAMPTZ
);

-- Partner preferences that power the matchmaking engine.
CREATE TABLE IF NOT EXISTS partner_preferences (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT NOT NULL UNIQUE,
  partner_gender TEXT,
  age_min        INT,
  age_max        INT,
  height_min     TEXT,
  height_max     TEXT,
  religion       TEXT,
  mother_tongue  TEXT,
  marital_status TEXT,
  city           TEXT,
  education      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Interest sent between two users (sender -> recipient).
CREATE TABLE IF NOT EXISTS interests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | declined
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sender_id, recipient_id)
);

-- User bookmarks of profiles.
CREATE TABLE IF NOT EXISTS shortlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, profile_id)
);

-- Chat: one thread per connected pair (user_a < user_b, enforced by the app).
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a          TEXT NOT NULL,
  user_b          TEXT NOT NULL,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_a, user_b)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL,
  recipient_id    TEXT NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages (conversation_id, created_at);

-- Required for Supabase Realtime seconds to stream INSERTs to browsers.
-- The app's client subscribes to postgres_changes on chat_messages; without
-- the table in this publication the client falls back to polling every 4s.
-- NOTE: if you ALTER an existing table here, settings.NOTIFY applies to new
-- subscriptions; changing the publication does NOT apply retroactively. Run
-- these to add the table if it was created at runtime instead of by this file:
--   ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
-- Then enable Realtime for the table: Dashboard > Database > Replication >
-- enable replication for public.chat_messages.