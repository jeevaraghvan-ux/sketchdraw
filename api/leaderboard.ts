// Optional Vercel Serverless fallback endpoint for fetching verified users
// from Supabase Auth Admin API when SUPABASE_SECRET_KEY or
// SUPABASE_SERVICE_ROLE_KEY is configured in Vercel environment variables.
// Note: No secrets are stored in this file; when env vars are unset it returns 503.

interface SupabaseAdminUser {
  id: string;
  email?: string;
  confirmed_at?: string | null;
  email_confirmed_at?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}

function getInitials(name: string): string {
  const cleaned = name.trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'A';
  const parts = cleaned.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return cleaned.slice(0, Math.min(2, cleaned.length)).toUpperCase();
}

function toInt(val: unknown): number {
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
}

export async function GET(): Promise<Response> {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://qbrqoblmwnuhckcqhzby.supabase.co';
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return Response.json(
      { error: 'Server-side Supabase key not configured' },
      { status: 503 }
    );
  }

  try {
    const users: SupabaseAdminUser[] = [];
    let page = 1;
    const perPage = 200;

    while (page <= 10) {
      const res = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        }
      );

      if (!res.ok) {
        return Response.json(
          { error: `Supabase admin query failed (${res.status})` },
          { status: 502 }
        );
      }

      const payload = (await res.json()) as { users?: SupabaseAdminUser[] };
      const batch = Array.isArray(payload.users) ? payload.users : [];
      users.push(...batch);
      if (batch.length < perPage) break;
      page += 1;
    }

    const confirmedUsers = users
      .filter((u) => Boolean(u.email_confirmed_at || u.confirmed_at))
      .map((u) => {
        const meta = u.user_metadata || {};
        const fallbackName =
          typeof u.email === 'string' && u.email.includes('@')
            ? u.email.split('@')[0]
            : 'Artist';
        const username =
          (typeof meta.username === 'string' && meta.username.trim()) ||
          (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
          (typeof meta.name === 'string' && meta.name.trim()) ||
          fallbackName;

        const streak = toInt(meta.streak);
        const bestStreak = Math.max(toInt(meta.best_streak), streak);
        const totalDrawings = toInt(meta.total_drawings);

        return {
          id: u.id,
          username,
          avatar: getInitials(username),
          streak,
          best_streak: bestStreak,
          total_drawings: totalDrawings,
          last_drawn_date:
            typeof meta.last_drawn_date === 'string' ? meta.last_drawn_date : null,
          monthly_streak: toInt(meta.monthly_streak),
          monthly_drawings: toInt(meta.monthly_drawings),
          monthly_key:
            typeof meta.monthly_key === 'string' ? meta.monthly_key : null,
          badges: Array.isArray(meta.badges)
            ? meta.badges.filter((b): b is string => typeof b === 'string')
            : ['Verified Artist'],
          created_at: u.created_at || new Date().toISOString(),
        };
      });

    return Response.json(
      { profiles: confirmedUsers },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
