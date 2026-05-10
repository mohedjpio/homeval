-- ================================================================
--  HomeVal v2 — Full Database Schema
--  Custom Auth (NO Supabase Auth dependency)
--  Run in: https://ekvoujikbybjvfinsack.supabase.co SQL Editor
-- ================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users table (our own auth, no auth.users dependency) ─────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  groq_api_key  TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Sessions table (JWT refresh tokens) ─────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Predictions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS predictions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_sqm             NUMERIC NOT NULL,
  rooms                INT NOT NULL DEFAULT 0,
  bathrooms            INT NOT NULL DEFAULT 0,
  location             TEXT NOT NULL,
  condition            TEXT,
  finishing            TEXT,
  furnishing           TEXT,
  floor                INT NOT NULL DEFAULT 0,
  has_elevator         BOOLEAN NOT NULL DEFAULT FALSE,
  has_parking          BOOLEAN NOT NULL DEFAULT FALSE,
  has_garden           BOOLEAN NOT NULL DEFAULT FALSE,
  has_pool             BOOLEAN NOT NULL DEFAULT FALSE,
  view_type            TEXT,
  property_type        TEXT,
  predicted_price_egp  NUMERIC NOT NULL,
  predicted_price_usd  NUMERIC,
  confidence_low       NUMERIC,
  confidence_high      NUMERIC,
  price_per_sqm        NUMERIC,
  location_percentile  INT,
  model_version        TEXT DEFAULT '1.0.0',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chat sessions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chat messages ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user        ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token       ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires     ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_predictions_user     ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_location ON predictions(location);
CREATE INDEX IF NOT EXISTS idx_predictions_created  ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user   ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sess   ON chat_messages(session_id);

-- ── RLS (service role bypasses, anon key blocked) ────────────────
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Block ALL anon access — backend uses service key only
CREATE POLICY "deny_anon_users"         ON users         FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_sessions"      ON sessions      FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_predictions"   ON predictions   FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_chat_sessions" ON chat_sessions FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_chat_messages" ON chat_messages FOR ALL TO anon USING (false);

-- Service role (backend) has full access — no RLS restriction needed
-- (service_role bypasses RLS by default in Supabase)

SELECT 'HomeVal v2 schema created successfully!' as status;
