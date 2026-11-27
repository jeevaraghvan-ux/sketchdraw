-- SketchDraw Real User Profiles & Top Streaks Leaderboard Schema
-- Run this once in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qbrqoblmwnuhckcqhzby/sql/new

-- 1. Create public profiles table linked 1-to-1 with verified Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  avatar text NOT NULL DEFAULT 'A',
  streak integer NOT NULL DEFAULT 0 CHECK (streak >= 0),
  best_streak integer NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  total_drawings integer NOT NULL DEFAULT 0 CHECK (total_drawings >= 0),
  last_drawn_date text,
  monthly_streak integer NOT NULL DEFAULT 0 CHECK (monthly_streak >= 0),
  monthly_drawings integer NOT NULL DEFAULT 0 CHECK (monthly_drawings >= 0),
  monthly_key text,
  badges text[] NOT NULL DEFAULT ARRAY['Verified Artist']::text[],
  streak_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast leaderboard sorting by highest win streak
CREATE INDEX IF NOT EXISTS profiles_leaderboard_idx
  ON public.profiles (best_streak DESC, streak DESC, total_drawings DESC);

-- 2. Enable Row Level Security (no emails or secrets stored in public.profiles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public leaderboard profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public leaderboard profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Helper to derive clean 1-2 character monogram initials
CREATE OR REPLACE FUNCTION public.compute_initials(display_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cleaned text := regexp_replace(coalesce(trim(display_name), ''), '\s+', ' ', 'g');
  parts text[];
BEGIN
  IF cleaned = '' THEN
    RETURN 'A';
  END IF;
  parts := string_to_array(cleaned, ' ');
  IF array_length(parts, 1) >= 2 THEN
    RETURN upper(substr(parts[1], 1, 1) || substr(parts[2], 1, 1));
  END IF;
  RETURN upper(substr(parts[1], 1, LEAST(2, length(parts[1]))));
END;
$$;

-- 4. Automatically create/update profile row whenever a user confirms their email
CREATE OR REPLACE FUNCTION public.handle_verified_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username text;
BEGIN
  IF NEW.email_confirmed_at IS NULL AND NEW.confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  v_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    'Artist'
  );

  INSERT INTO public.profiles (
    id,
    username,
    avatar,
    streak,
    best_streak,
    total_drawings,
    last_drawn_date,
    monthly_streak,
    monthly_drawings,
    monthly_key,
    badges,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_username,
    public.compute_initials(v_username),
    GREATEST(COALESCE(NULLIF(NEW.raw_user_meta_data->>'streak', '')::integer, 0), 0),
    GREATEST(COALESCE(NULLIF(NEW.raw_user_meta_data->>'best_streak', '')::integer, 0), 0),
    GREATEST(COALESCE(NULLIF(NEW.raw_user_meta_data->>'total_drawings', '')::integer, 0), 0),
    NULLIF(NEW.raw_user_meta_data->>'last_drawn_date', ''),
    GREATEST(COALESCE(NULLIF(NEW.raw_user_meta_data->>'monthly_streak', '')::integer, 0), 0),
    GREATEST(COALESCE(NULLIF(NEW.raw_user_meta_data->>'monthly_drawings', '')::integer, 0), 0),
    NULLIF(NEW.raw_user_meta_data->>'monthly_key', ''),
    ARRAY['Verified Artist']::text[],
    COALESCE(NEW.created_at, now()),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_verified_user();

-- 5. Backfill all existing signed-up and verified users right now
INSERT INTO public.profiles (
  id,
  username,
  avatar,
  streak,
  best_streak,
  total_drawings,
  last_drawn_date,
  monthly_streak,
  monthly_drawings,
  monthly_key,
  badges,
  created_at,
  updated_at
)
SELECT
  u.id,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'username'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
    NULLIF(SPLIT_PART(COALESCE(u.email, ''), '@', 1), ''),
    'Artist'
  ) AS username,
  public.compute_initials(
    COALESCE(
      NULLIF(TRIM(u.raw_user_meta_data->>'username'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
      NULLIF(SPLIT_PART(COALESCE(u.email, ''), '@', 1), ''),
      'Artist'
    )
  ) AS avatar,
  GREATEST(COALESCE(NULLIF(u.raw_user_meta_data->>'streak', '')::integer, 0), 0) AS streak,
  GREATEST(COALESCE(NULLIF(u.raw_user_meta_data->>'best_streak', '')::integer, 0), 0) AS best_streak,
  GREATEST(COALESCE(NULLIF(u.raw_user_meta_data->>'total_drawings', '')::integer, 0), 0) AS total_drawings,
  NULLIF(u.raw_user_meta_data->>'last_drawn_date', '') AS last_drawn_date,
  GREATEST(COALESCE(NULLIF(u.raw_user_meta_data->>'monthly_streak', '')::integer, 0), 0) AS monthly_streak,
  GREATEST(COALESCE(NULLIF(u.raw_user_meta_data->>'monthly_drawings', '')::integer, 0), 0) AS monthly_drawings,
  NULLIF(u.raw_user_meta_data->>'monthly_key', '') AS monthly_key,
  ARRAY['Verified Artist']::text[] AS badges,
  COALESCE(u.created_at, now()) AS created_at,
  now() AS updated_at
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL OR u.confirmed_at IS NOT NULL
ON CONFLICT (id) DO NOTHING;
