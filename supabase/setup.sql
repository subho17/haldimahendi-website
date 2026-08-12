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