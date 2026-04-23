-- =========================================================
--  HomeVal — Supabase Database Migration
--  Run via: supabase db push  OR paste in Supabase SQL editor
-- =========================================================

-- ── Extensions ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── User profiles (extends Supabase Auth) ─────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT,
  groq_api_key     TEXT,       -- stored encrypted; never returned raw to frontend
  plan             TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  predictions_count INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Predictions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS predictions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Input features
  area_sqm             NUMERIC NOT NULL CHECK (area_sqm > 0),
  rooms                INT     NOT NULL DEFAULT 0,
  bathrooms            INT     NOT NULL DEFAULT 0,
  location             TEXT    NOT NULL,
  condition            TEXT,
  finishing            TEXT,
  furnishing           TEXT,
  floor                INT     NOT NULL DEFAULT 0,
  has_elevator         BOOLEAN NOT NULL DEFAULT FALSE,
  has_parking          BOOLEAN NOT NULL DEFAULT FALSE,
  has_garden           BOOLEAN NOT NULL DEFAULT FALSE,
  has_pool             BOOLEAN NOT NULL DEFAULT FALSE,
  view_type            TEXT,
  property_type        TEXT,

  -- Outputs
  predicted_price_egp  NUMERIC NOT NULL,
  predicted_price_usd  NUMERIC,
  confidence_low       NUMERIC,
  confidence_high      NUMERIC,
  price_per_sqm        NUMERIC,
  location_percentile  INT,
  model_version        TEXT DEFAULT '1.0.0',

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chat sessions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chat messages ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Location stats cache ───────────────────────────────────
CREATE TABLE IF NOT EXISTS location_stats (
  id           SERIAL PRIMARY KEY,
  location     TEXT UNIQUE NOT NULL,
  mean_price   NUMERIC,
  median_price NUMERIC,
  std_price    NUMERIC,
  count        INT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_predictions_user_id    ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_location   ON predictions(location);
CREATE INDEX IF NOT EXISTS idx_predictions_created    ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user     ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated  ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session  ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created  ON chat_messages(created_at);

-- ── Row Level Security ─────────────────────────────────────
ALTER TABLE user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_stats  ENABLE ROW LEVEL SECURITY;

-- user_profiles
CREATE POLICY "users_own_profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- predictions
CREATE POLICY "users_own_predictions"
  ON predictions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- chat_sessions
CREATE POLICY "users_own_sessions"
  ON chat_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- chat_messages (via session ownership)
CREATE POLICY "users_own_messages"
  ON chat_messages FOR ALL
  USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- location_stats — readable by all authenticated users (read-only)
CREATE POLICY "auth_read_location_stats"
  ON location_stats FOR SELECT
  USING (auth.role() = 'authenticated');
