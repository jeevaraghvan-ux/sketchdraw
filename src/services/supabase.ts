import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile, LeaderboardEntry, DrawingSurface } from '../types';
import { INITIAL_LEADERBOARD } from '../data/techniques';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'sketchdraw_user_profile',
  SUPABASE_URL: 'sketchdraw_supabase_url',
  SUPABASE_KEY: 'sketchdraw_supabase_key',
  STREAK_HISTORY: 'sketchdraw_streak_history',
  LEADERBOARD: 'sketchdraw_leaderboard',
};

// Default Supabase publishable key provided by user
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_5OsLIf9_6xmwnGuQiRbgng_VXVzZwZz';

// Check env or localStorage
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || '';

  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';

  return {
    url: localUrl || envUrl || '',
    anonKey: localKey || envKey || DEFAULT_SUPABASE_ANON_KEY
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

// Initial profile storage for session
function getStoredProfile(): UserProfile | null {
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveStoredProfile(profile: UserProfile | null) {
  if (profile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  }
}

// Auth API
export async function getCurrentUser(): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (session?.user) {
        const user = session.user;
        const meta = user.user_metadata || {};
        const stored = getStoredProfile();
        return {
          id: user.id,
          email: user.email,
          name: meta.full_name || meta.name || user.email?.split('@')[0] || 'Artist',
          avatarUrl: meta.avatar_url || meta.picture || '🎨',
          isGuest: false,
          streak: stored?.streak || 1,
          bestStreak: stored?.bestStreak || 1,
          totalDrawings: stored?.totalDrawings || 1,
          lastDrawnDate: stored?.lastDrawnDate || new Date().toISOString().split('T')[0],
          badges: stored?.badges || ['Creative Spark']
        };
      }
    } catch {
      // ignore
    }
  }

  // Fallback to local profile (e.g. Guest mode)
  return getStoredProfile();
}

export async function signInWithGoogle(): Promise<{ error?: string; redirected?: boolean }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      error: 'Supabase Project URL is required to redirect to Google OAuth. Please add VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co to your environment variables or Vercel settings.'
    };
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) return { error: error.message };
    return { redirected: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to initialize Google Auth' };
  }
}

export function signInAsGuest(name: string = 'Creative Guest'): UserProfile {
  const existing = getStoredProfile();
  const profile: UserProfile = existing || {
    id: 'guest-' + Math.random().toString(36).substring(2, 9),
    name: name,
    avatarUrl: '🎨',
    isGuest: true,
    streak: 3,
    bestStreak: 7,
    totalDrawings: 8,
    lastDrawnDate: new Date().toISOString().split('T')[0],
    badges: ['First Stroke', '3-Day Fire', 'Paper Pioneer']
  };
  saveStoredProfile(profile);
  return profile;
}

export async function signOutUser(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut().catch(() => {});
  }
  saveStoredProfile(null);
}

// Streak API
export function recordDailyDrawing(
  title: string = 'Untitled Sketch',
  surface: DrawingSurface = 'whiteboard'
): { updatedProfile: UserProfile; streakIncremented: boolean; message: string } {
  let profile = getStoredProfile();
  if (!profile) {
    profile = signInAsGuest('Creative Artist');
  }

  const today = new Date().toISOString().split('T')[0];
  const lastDrawn = profile.lastDrawnDate;
  let streakIncremented = false;
  let message = 'Drawing saved to your creative streak!';

  if (!lastDrawn) {
    profile.streak = 1;
    profile.bestStreak = Math.max(profile.bestStreak || 0, 1);
    streakIncremented = true;
    message = '🔥 You started a brand new 1-day drawing streak!';
  } else if (lastDrawn === today) {
    // Already drew today
    message = '🎨 Another masterpiece logged for today! Streak is secured.';
  } else {
    // Check if yesterday
    const lastDate = new Date(lastDrawn);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      profile.streak += 1;
      profile.bestStreak = Math.max(profile.bestStreak || 0, profile.streak);
      streakIncremented = true;
      message = `🔥 Streak continued! You are on a ${profile.streak}-day streak!`;
    } else {
      // Streak lapsed
      profile.streak = 1;
      streakIncremented = true;
      message = '🔥 Welcome back! New streak ignited at Day 1.';
    }
  }

  profile.lastDrawnDate = today;
  profile.totalDrawings = (profile.totalDrawings || 0) + 1;

  // Add badges based on streak
  if (profile.streak >= 7 && !profile.badges.includes('Week Warrior')) {
    profile.badges.push('Week Warrior');
  }
  if (profile.streak >= 14 && !profile.badges.includes('Fortnight Flame')) {
    profile.badges.push('Fortnight Flame');
  }
  if (profile.totalDrawings >= 10 && !profile.badges.includes('Prolific Creator')) {
    profile.badges.push('Prolific Creator');
  }

  saveStoredProfile(profile);

  // Store in drawing history
  const historyKey = STORAGE_KEYS.STREAK_HISTORY;
  const historyRaw = localStorage.getItem(historyKey);
  const historyList = historyRaw ? JSON.parse(historyRaw) : [];
  historyList.unshift({
    id: 'draw-' + Date.now(),
    date: today,
    title,
    surface
  });
  localStorage.setItem(historyKey, JSON.stringify(historyList.slice(0, 50)));

  return { updatedProfile: profile, streakIncremented, message };
}

export function getLeaderboard(): { allTime: LeaderboardEntry[]; thisMonth: LeaderboardEntry[] } {
  const profile = getStoredProfile();
  const allTime = [...INITIAL_LEADERBOARD.allTime];
  const thisMonth = [...INITIAL_LEADERBOARD.thisMonth];

  if (profile) {
    const userEntry: LeaderboardEntry = {
      rank: 4,
      id: profile.id,
      name: profile.name + ' (You)',
      avatar: profile.avatarUrl || '🎨',
      streak: profile.streak,
      totalDrawings: profile.totalDrawings,
      badge: profile.streak >= 14 ? 'Flame Master' : 'Dedicated Artist',
      isCurrentUser: true
    };

    // Calculate dynamic rank
    const insertInto = (list: LeaderboardEntry[]) => {
      const filtered = list.filter(item => !item.isCurrentUser);
      filtered.push(userEntry);
      filtered.sort((a, b) => b.streak - a.streak);
      return filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));
    };

    return {
      allTime: insertInto(allTime),
      thisMonth: insertInto(thisMonth)
    };
  }

  return {
    allTime: allTime.map((item, idx) => ({ ...item, rank: idx + 1 })),
    thisMonth: thisMonth.map((item, idx) => ({ ...item, rank: idx + 1 }))
  };
}

export function getDrawingHistory(): any[] {
  const historyRaw = localStorage.getItem(STORAGE_KEYS.STREAK_HISTORY);
  return historyRaw ? JSON.parse(historyRaw) : [];
}
