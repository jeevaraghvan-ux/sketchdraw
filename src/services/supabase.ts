import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  UserProfile,
  LeaderboardEntry,
  LeaderboardResponse,
  DrawingSurface,
  DrawingHistoryItem
} from '../types';

const STORAGE_KEYS = {
  LEGACY_USER_PROFILE: 'sketchdraw_user_profile',
  LEGACY_STREAK_HISTORY: 'sketchdraw_streak_history',
  USER_PROFILE_PREFIX: 'sketchdraw_profile_',
  STREAK_HISTORY_PREFIX: 'sketchdraw_history_',
  SUPABASE_URL: 'sketchdraw_supabase_url',
  SUPABASE_KEY: 'sketchdraw_supabase_key',
};

const DEFAULT_SUPABASE_URL = 'https://qbrqoblmwnuhckcqhzby.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_5OsLIf9_6xmwnGuQiRbgng_VXVzZwZz';

interface ProfileRow {
  id: string;
  username: string;
  avatar: string | null;
  streak: number | null;
  best_streak: number | null;
  total_drawings: number | null;
  last_drawn_date: string | null;
  monthly_streak: number | null;
  monthly_drawings: number | null;
  monthly_key: string | null;
  badges: string[] | null;
  streak_history?: DrawingHistoryItem[] | null;
  created_at?: string | null;
}

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
    '';

  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';

  return {
    url: localUrl || envUrl || DEFAULT_SUPABASE_URL,
    anonKey: localKey || envKey || DEFAULT_SUPABASE_ANON_KEY,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (url && anonKey && (url.startsWith('http://') || url.startsWith('https://'))) {
    if (!supabaseInstance) {
      try {
        supabaseInstance = createClient(url, anonKey);
      } catch (e) {
        console.warn('Failed to initialize Supabase client:', e);
        return null;
      }
    }
    return supabaseInstance;
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && (url.startsWith('http://') || url.startsWith('https://')));
}

export function getInitials(name: string): string {
  const cleaned = name.trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'A';
  const parts = cleaned.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return cleaned.slice(0, Math.min(2, cleaned.length)).toUpperCase();
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthKey(dateKey: string = getLocalDateKey()): string {
  return dateKey.slice(0, 7);
}

export function diffCalendarDays(earlierKey: string, laterKey: string): number {
  const [y1, m1, d1] = earlierKey.split('-').map(Number);
  const [y2, m2, d2] = laterKey.split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return Number.POSITIVE_INFINITY;
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((t2 - t1) / 86400000);
}

/**
 * A user's active streak stays alive only if they drew today or yesterday.
 */
export function computeActiveStreak(streak: number, lastDrawnDate?: string | null): number {
  const safeStreak = Math.max(0, Math.floor(streak || 0));
  if (safeStreak === 0 || !lastDrawnDate) return 0;
  const diff = diffCalendarDays(lastDrawnDate, getLocalDateKey());
  return diff <= 1 ? safeStreak : 0;
}

function computeEarnedBadges(
  streak: number,
  bestStreak: number,
  totalDrawings: number,
  existing: string[] = []
): string[] {
  const set = new Set<string>(existing.length > 0 ? existing : ['Verified Artist']);
  set.add('Verified Artist');
  if (totalDrawings >= 1) set.add('First Stroke');
  if (bestStreak >= 3 || streak >= 3) set.add('3-Day Spark');
  if (bestStreak >= 7 || streak >= 7) set.add('Week Warrior');
  if (bestStreak >= 14 || streak >= 14) set.add('Fortnight Flame');
  if (bestStreak >= 30 || streak >= 30) set.add('Monthly Master');
  if (totalDrawings >= 10) set.add('Prolific Creator');
  return Array.from(set);
}

function getPrimaryBadgeTitle(bestStreak: number, activeStreak: number, totalDrawings: number): string {
  const topStreak = Math.max(bestStreak, activeStreak);
  if (topStreak >= 30) return 'Grandmaster';
  if (topStreak >= 14) return 'Fortnight Flame';
  if (topStreak >= 7) return 'Week Warrior';
  if (topStreak >= 3) return '3-Day Spark';
  if (totalDrawings >= 1 || topStreak >= 1) return 'Active Sketcher';
  return 'Verified Artist';
}

function isTableMissingError(error: { code?: string; message?: string; status?: number } | null): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    error.status === 404 ||
    Boolean(error.message && error.message.toLowerCase().includes('profiles'))
  );
}

function getStoredProfile(userId?: string): UserProfile | null {
  const keysToCheck = userId
    ? [`${STORAGE_KEYS.USER_PROFILE_PREFIX}${userId}`, STORAGE_KEYS.LEGACY_USER_PROFILE]
    : [STORAGE_KEYS.LEGACY_USER_PROFILE];

  for (const key of keysToCheck) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as UserProfile;
      if (!userId || parsed.id === userId) {
        return parsed;
      }
    } catch {
      // ignore malformed local cache
    }
  }
  return null;
}

export function saveStoredProfile(profile: UserProfile | null) {
  if (profile) {
    localStorage.setItem(`${STORAGE_KEYS.USER_PROFILE_PREFIX}${profile.id}`, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.LEGACY_USER_PROFILE, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEYS.LEGACY_USER_PROFILE);
  }
}

export function getDrawingHistory(userId?: string): DrawingHistoryItem[] {
  const keys = userId
    ? [`${STORAGE_KEYS.STREAK_HISTORY_PREFIX}${userId}`, STORAGE_KEYS.LEGACY_STREAK_HISTORY]
    : [STORAGE_KEYS.LEGACY_STREAK_HISTORY];

  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return [];
}

function saveDrawingHistory(userId: string, history: DrawingHistoryItem[]) {
  const trimmed = history.slice(0, 80);
  localStorage.setItem(`${STORAGE_KEYS.STREAK_HISTORY_PREFIX}${userId}`, JSON.stringify(trimmed));
}

function buildProfileFromSources(
  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  dbRow: ProfileRow | null,
  localCached: UserProfile | null
): UserProfile {
  const meta = authUser.user_metadata || {};
  const fallbackEmailName = authUser.email?.split('@')[0] || 'Artist';
  const name =
    dbRow?.username ||
    (typeof meta.username === 'string' && meta.username.trim()) ||
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    localCached?.name ||
    fallbackEmailName;

  const rawStreak = Math.max(
    dbRow?.streak ?? 0,
    Number(meta.streak) || 0,
    localCached?.streak || 0
  );
  const lastDrawnDate =
    dbRow?.last_drawn_date ||
    (typeof meta.last_drawn_date === 'string' ? meta.last_drawn_date : undefined) ||
    localCached?.lastDrawnDate;

  const activeStreak = computeActiveStreak(rawStreak, lastDrawnDate);
  const bestStreak = Math.max(
    dbRow?.best_streak ?? 0,
    Number(meta.best_streak) || 0,
    localCached?.bestStreak || 0,
    activeStreak
  );
  const totalDrawings = Math.max(
    dbRow?.total_drawings ?? 0,
    Number(meta.total_drawings) || 0,
    localCached?.totalDrawings || 0
  );

  const currentMonth = getMonthKey();
  const rowMonthKey =
    dbRow?.monthly_key ||
    (typeof meta.monthly_key === 'string' ? meta.monthly_key : undefined) ||
    localCached?.monthlyKey;

  const monthlyStreak =
    rowMonthKey === currentMonth
      ? Math.max(
          dbRow?.monthly_streak ?? 0,
          Number(meta.monthly_streak) || 0,
          localCached?.monthlyStreak || 0
        )
      : 0;
  const monthlyDrawings =
    rowMonthKey === currentMonth
      ? Math.max(
          dbRow?.monthly_drawings ?? 0,
          Number(meta.monthly_drawings) || 0,
          localCached?.monthlyDrawings || 0
        )
      : 0;

  const mergedBadges = computeEarnedBadges(activeStreak, bestStreak, totalDrawings, [
    ...(dbRow?.badges || []),
    ...(Array.isArray(meta.badges) ? (meta.badges as string[]) : []),
    ...(localCached?.badges || []),
  ]);

  if (Array.isArray(dbRow?.streak_history) && dbRow.streak_history.length > 0) {
    saveDrawingHistory(authUser.id, dbRow.streak_history);
  } else if (Array.isArray(meta.streak_history) && meta.streak_history.length > 0) {
    saveDrawingHistory(authUser.id, meta.streak_history as DrawingHistoryItem[]);
  }

  return {
    id: authUser.id,
    email: authUser.email,
    name,
    avatarUrl: dbRow?.avatar || getInitials(name),
    isGuest: false,
    streak: activeStreak,
    bestStreak,
    totalDrawings,
    lastDrawnDate: lastDrawnDate || undefined,
    monthlyStreak,
    monthlyDrawings,
    monthlyKey: currentMonth,
    badges: mergedBadges,
  };
}

async function syncProfileToSupabase(
  client: SupabaseClient,
  profile: UserProfile,
  history: DrawingHistoryItem[]
): Promise<{ tableMissing: boolean }> {
  const currentMonth = profile.monthlyKey || getMonthKey();
  const payload = {
    id: profile.id,
    username: profile.name,
    avatar: getInitials(profile.name),
    streak: profile.streak,
    best_streak: profile.bestStreak,
    total_drawings: profile.totalDrawings,
    last_drawn_date: profile.lastDrawnDate || null,
    monthly_streak: profile.monthlyStreak ?? 0,
    monthly_drawings: profile.monthlyDrawings ?? 0,
    monthly_key: currentMonth,
    badges: profile.badges,
    streak_history: history.slice(0, 50),
    updated_at: new Date().toISOString(),
  };

  let tableMissing = false;
  const { error: upsertError } = await client
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });

  if (upsertError) {
    if (isTableMissingError(upsertError)) {
      tableMissing = true;
    } else {
      console.warn('Could not sync profile to profiles table:', upsertError.message);
    }
  }

  // Keep user_metadata synchronized as a resilient backup for serverless / multi-device reads
  await client.auth
    .updateUser({
      data: {
        username: profile.name,
        streak: profile.streak,
        best_streak: profile.bestStreak,
        total_drawings: profile.totalDrawings,
        last_drawn_date: profile.lastDrawnDate || null,
        monthly_streak: profile.monthlyStreak ?? 0,
        monthly_drawings: profile.monthlyDrawings ?? 0,
        monthly_key: currentMonth,
        badges: profile.badges,
        streak_history: history.slice(0, 30),
      },
    })
    .catch(() => {});

  return { tableMissing };
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      return null;
    }

    const authUser = session.user;
    const localCached = getStoredProfile(authUser.id);

    const { data: dbRow, error } = await client
      .from('profiles')
      .select(
        'id, username, avatar, streak, best_streak, total_drawings, last_drawn_date, monthly_streak, monthly_drawings, monthly_key, badges, streak_history'
      )
      .eq('id', authUser.id)
      .maybeSingle();

    const profile = buildProfileFromSources(
      authUser,
      !error ? (dbRow as ProfileRow | null) : null,
      localCached
    );

    saveStoredProfile(profile);

    // Ensure profile row exists if table is ready and row was missing or local stats are ahead
    if (!error && (!dbRow || (localCached && localCached.totalDrawings > (dbRow.total_drawings ?? 0)))) {
      await syncProfileToSupabase(client, profile, getDrawingHistory(authUser.id));
    }

    return profile;
  } catch {
    return null;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
): Promise<{ error?: string; user?: unknown; needsVerification?: boolean }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase client is not connected.' };
  }
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim() || cleanEmail.split('@')[0];

    const { data, error } = await client.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
          full_name: cleanUsername,
          name: cleanUsername,
          streak: 0,
          best_streak: 0,
          total_drawings: 0,
        },
      },
    });

    if (error) return { error: error.message };
    return { user: data.user, needsVerification: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Failed to sign up.' };
  }
}

export async function verifyEmailCode(
  email: string,
  token: string
): Promise<{ error?: string; profile?: UserProfile }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase client is not connected.' };
  }
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    let { data, error } = await client.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'signup',
    });

    if (error) {
      const retry = await client.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });
      if (retry.error) {
        return { error: retry.error.message || error.message };
      }
      data = retry.data;
    }

    if (data?.user) {
      const meta = data.user.user_metadata || {};
      const name =
        (typeof meta.username === 'string' && meta.username.trim()) ||
        (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
        (typeof meta.name === 'string' && meta.name.trim()) ||
        cleanEmail.split('@')[0];

      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        name,
        avatarUrl: getInitials(name),
        isGuest: false,
        streak: 0,
        bestStreak: 0,
        totalDrawings: 0,
        monthlyStreak: 0,
        monthlyDrawings: 0,
        monthlyKey: getMonthKey(),
        badges: ['Verified Artist'],
      };

      saveStoredProfile(profile);
      await syncProfileToSupabase(client, profile, []);
      return { profile };
    }
    return { error: 'Verification failed. Please check the code and try again.' };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Failed to verify code.' };
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ error?: string; profile?: UserProfile }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase client is not connected.' };
  }
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) return { error: error.message };

    if (data?.user) {
      const { data: dbRow, error: dbErr } = await client
        .from('profiles')
        .select(
          'id, username, avatar, streak, best_streak, total_drawings, last_drawn_date, monthly_streak, monthly_drawings, monthly_key, badges, streak_history'
        )
        .eq('id', data.user.id)
        .maybeSingle();

      const profile = buildProfileFromSources(
        data.user,
        !dbErr ? (dbRow as ProfileRow | null) : null,
        getStoredProfile(data.user.id)
      );

      saveStoredProfile(profile);
      if (!dbErr && !dbRow) {
        await syncProfileToSupabase(client, profile, getDrawingHistory(data.user.id));
      }
      return { profile };
    }
    return { error: 'Unable to sign in. Please check your credentials.' };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Sign in failed.' };
  }
}

export async function resendVerificationCode(
  email: string
): Promise<{ error?: string; success?: boolean }> {
  const client = getSupabaseClient();
  if (!client) return { error: 'Supabase not connected' };
  try {
    const { error } = await client.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Failed to resend code' };
  }
}

export async function signOutUser(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut().catch(() => {});
  }
  saveStoredProfile(null);
}

export async function recordDailyDrawing(
  title: string = 'Untitled Sketch',
  surface: DrawingSurface = 'whiteboard'
): Promise<{
  requiresAuth?: boolean;
  error?: string;
  updatedProfile?: UserProfile;
  streakIncremented: boolean;
  message: string;
}> {
  const profile = await getCurrentUser();
  if (!profile) {
    return {
      requiresAuth: true,
      streakIncremented: false,
      message: 'Sign in or create an account to save your streak to the leaderboard.',
    };
  }

  const today = getLocalDateKey();
  const currentMonth = getMonthKey(today);
  const lastDrawn = profile.lastDrawnDate;

  let streakIncremented = false;
  let message = 'Drawing saved to your creative streak!';
  let nextStreak = profile.streak;

  if (!lastDrawn) {
    nextStreak = 1;
    streakIncremented = true;
    message = 'You started a brand new 1-day drawing streak!';
  } else {
    const diffDays = diffCalendarDays(lastDrawn, today);
    if (diffDays <= 0) {
      nextStreak = Math.max(profile.streak, 1);
      message = 'Another sketch logged for today. Streak is secured.';
    } else if (diffDays === 1) {
      nextStreak = Math.max(profile.streak, 0) + 1;
      streakIncremented = true;
      message = `Streak continued. You are on a ${nextStreak}-day win streak.`;
    } else {
      nextStreak = 1;
      streakIncremented = true;
      message = 'Welcome back. New streak ignited at Day 1.';
    }
  }

  const nextBestStreak = Math.max(profile.bestStreak || 0, nextStreak);
  const nextTotalDrawings = (profile.totalDrawings || 0) + 1;

  const sameMonth = profile.monthlyKey === currentMonth;
  const nextMonthlyDrawings = (sameMonth ? profile.monthlyDrawings || 0 : 0) + 1;
  let nextMonthlyStreak = sameMonth ? profile.monthlyStreak || 0 : 0;
  if (!sameMonth || !lastDrawn) {
    nextMonthlyStreak = 1;
  } else {
    const diffDays = diffCalendarDays(lastDrawn, today);
    if (diffDays === 1) {
      nextMonthlyStreak = nextMonthlyStreak + 1;
    } else if (diffDays > 1) {
      nextMonthlyStreak = 1;
    } else {
      nextMonthlyStreak = Math.max(nextMonthlyStreak, 1);
    }
  }

  const updatedProfile: UserProfile = {
    ...profile,
    streak: nextStreak,
    bestStreak: nextBestStreak,
    totalDrawings: nextTotalDrawings,
    lastDrawnDate: today,
    monthlyStreak: nextMonthlyStreak,
    monthlyDrawings: nextMonthlyDrawings,
    monthlyKey: currentMonth,
    badges: computeEarnedBadges(nextStreak, nextBestStreak, nextTotalDrawings, profile.badges),
  };

  const existingHistory = getDrawingHistory(profile.id);
  const nextHistory: DrawingHistoryItem[] = [
    {
      id: 'draw-' + Date.now(),
      date: today,
      title,
      surface,
    },
    ...existingHistory,
  ];

  saveStoredProfile(updatedProfile);
  saveDrawingHistory(profile.id, nextHistory);

  const client = getSupabaseClient();
  if (client) {
    await syncProfileToSupabase(client, updatedProfile, nextHistory);
  }

  return {
    updatedProfile,
    streakIncremented,
    message,
  };
}

function mapRowsToLeaderboard(
  rows: ProfileRow[],
  currentUserId?: string
): { allTime: LeaderboardEntry[]; thisMonth: LeaderboardEntry[] } {
  const currentMonth = getMonthKey();

  const entries: LeaderboardEntry[] = rows.map((row) => {
    const name = row.username?.trim() || 'Artist';
    const activeStreak = computeActiveStreak(row.streak ?? 0, row.last_drawn_date);
    const bestStreak = Math.max(row.best_streak ?? 0, activeStreak);
    const totalDrawings = Math.max(0, row.total_drawings ?? 0);
    const inCurrentMonth = row.monthly_key === currentMonth;
    const monthlyStreak = inCurrentMonth
      ? Math.max(0, computeActiveStreak(row.monthly_streak ?? activeStreak, row.last_drawn_date))
      : 0;
    const monthlyDrawings = inCurrentMonth ? Math.max(0, row.monthly_drawings ?? 0) : 0;

    return {
      rank: 0,
      id: row.id,
      name,
      avatar: row.avatar || getInitials(name),
      streak: activeStreak,
      bestStreak,
      totalDrawings,
      monthlyStreak,
      monthlyDrawings,
      lastDrawnDate: row.last_drawn_date || undefined,
      badge: getPrimaryBadgeTitle(bestStreak, activeStreak, totalDrawings),
      isCurrentUser: Boolean(currentUserId && row.id === currentUserId),
      joinedAt: row.created_at || undefined,
    };
  });

  const allTime = [...entries]
    .sort(
      (a, b) =>
        b.bestStreak - a.bestStreak ||
        b.streak - a.streak ||
        b.totalDrawings - a.totalDrawings ||
        a.name.localeCompare(b.name)
    )
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const thisMonth = [...entries]
    .sort(
      (a, b) =>
        b.monthlyStreak - a.monthlyStreak ||
        b.monthlyDrawings - a.monthlyDrawings ||
        b.streak - a.streak ||
        b.bestStreak - a.bestStreak ||
        a.name.localeCompare(b.name)
    )
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return { allTime, thisMonth };
}

export async function getLeaderboard(
  currentUser?: UserProfile | null
): Promise<LeaderboardResponse> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('profiles')
        .select(
          'id, username, avatar, streak, best_streak, total_drawings, last_drawn_date, monthly_streak, monthly_drawings, monthly_key, badges, created_at'
        )
        .order('best_streak', { ascending: false })
        .order('streak', { ascending: false })
        .order('total_drawings', { ascending: false })
        .limit(100);

      if (!error && Array.isArray(data)) {
        const rows = data as ProfileRow[];
        // Ensure signed-in user is always represented if their row hasn't finished syncing
        if (currentUser && !rows.some((r) => r.id === currentUser.id)) {
          rows.push({
            id: currentUser.id,
            username: currentUser.name,
            avatar: currentUser.avatarUrl || getInitials(currentUser.name),
            streak: currentUser.streak,
            best_streak: currentUser.bestStreak,
            total_drawings: currentUser.totalDrawings,
            last_drawn_date: currentUser.lastDrawnDate || null,
            monthly_streak: currentUser.monthlyStreak ?? 0,
            monthly_drawings: currentUser.monthlyDrawings ?? 0,
            monthly_key: currentUser.monthlyKey || getMonthKey(),
            badges: currentUser.badges,
          });
        }
        const ranked = mapRowsToLeaderboard(rows, currentUser?.id);
        return { ...ranked, source: 'supabase' };
      }

      // If profiles table is not created yet, check optional Vercel serverless fallback
      if (isTableMissingError(error)) {
        try {
          const apiRes = await fetch('/api/leaderboard', { cache: 'no-store' });
          if (apiRes.ok) {
            const payload = (await apiRes.json()) as { profiles?: ProfileRow[] };
            if (Array.isArray(payload.profiles)) {
              const ranked = mapRowsToLeaderboard(payload.profiles, currentUser?.id);
              return { ...ranked, source: 'api' };
            }
          }
        } catch {
          // API route unavailable locally or not configured
        }

        const localOnly: ProfileRow[] = currentUser
          ? [
              {
                id: currentUser.id,
                username: currentUser.name,
                avatar: currentUser.avatarUrl || getInitials(currentUser.name),
                streak: currentUser.streak,
                best_streak: currentUser.bestStreak,
                total_drawings: currentUser.totalDrawings,
                last_drawn_date: currentUser.lastDrawnDate || null,
                monthly_streak: currentUser.monthlyStreak ?? 0,
                monthly_drawings: currentUser.monthlyDrawings ?? 0,
                monthly_key: currentUser.monthlyKey || getMonthKey(),
                badges: currentUser.badges,
              },
            ]
          : [];

        const ranked = mapRowsToLeaderboard(localOnly, currentUser?.id);
        return {
          ...ranked,
          source: 'local',
          needsTableSetup: true,
        };
      }

      return {
        allTime: [],
        thisMonth: [],
        source: 'local',
        error: error?.message || 'Unable to load leaderboard.',
      };
    } catch (err: unknown) {
      return {
        allTime: [],
        thisMonth: [],
        source: 'local',
        error: err instanceof Error ? err.message : 'Unable to load leaderboard.',
      };
    }
  }

  return {
    allTime: [],
    thisMonth: [],
    source: 'local',
    error: 'Supabase is not configured.',
  };
}
