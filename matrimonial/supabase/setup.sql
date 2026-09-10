-- Reference schema for production. The app also auto-creates this table
-- on first use when DATABASE_URL is set, so this file is optional.
-- Run in: Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS otp_codes (
  mobile_number   TEXT PRIMARY KEY,
  code            TEXT NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at     TIMESTAMPTZ,
  send_count      INT NOT NULL DEFAULT 0,
  last_sent_at    TIMESTAMPTZ,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ
);

-- If otp_codes already exists, add the security columns (idempotent).
ALTER TABLE otp_codes
  ADD COLUMN IF NOT EXISTS send_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

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
  voice_url       TEXT,
  voice_duration  NUMERIC,
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

-- User-submitted moderation reports against a member.
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL,
  reported_id TEXT NOT NULL,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'open', -- open | resolved | dismissed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blocked members (blocker -> blocked): hidden from feeds, no chat/interests.
CREATE TABLE IF NOT EXISTS blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

-- In-app notifications (interest received, accepted, new message, system).
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL,
  actor_id   TEXT,
  type       TEXT NOT NULL DEFAULT 'system', -- interest | accept | message | system
  title      TEXT,
  message    TEXT NOT NULL,
  data       JSONB,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports (reported_id, status);

-- Member photo/ID verification submissions.
CREATE TABLE IF NOT EXISTS verifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL,
  id_type      TEXT NOT NULL,          -- aadhaar | pan | passport | driving_license | voter_id
  id_number    TEXT NOT NULL,
  selfie_url   TEXT,
  document_url TEXT,
  status       TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verifications_user ON verifications (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications (status, created_at);

-- Mirror the verified verdict onto the member profile (idempotent).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none';

-- Membership tier for premium features (free | premium | premium_plus).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ;

-- Extended profile: astrology & horoscope.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS birth_time TEXT,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS rashi TEXT,
  ADD COLUMN IF NOT EXISTS nakshatra TEXT,
  ADD COLUMN IF NOT EXISTS manglik TEXT,
  ADD COLUMN IF NOT EXISTS gotra TEXT;

-- Extended profile: family details.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS father_occupation TEXT,
  ADD COLUMN IF NOT EXISTS mother_occupation TEXT,
  ADD COLUMN IF NOT EXISTS siblings TEXT,
  ADD COLUMN IF NOT EXISTS family_type TEXT,
  ADD COLUMN IF NOT EXISTS family_values TEXT;

-- Extended profile: lifestyle.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS diet TEXT,
  ADD COLUMN IF NOT EXISTS smoking TEXT,
  ADD COLUMN IF NOT EXISTS drinking TEXT,
  ADD COLUMN IF NOT EXISTS disability TEXT,
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email TEXT;