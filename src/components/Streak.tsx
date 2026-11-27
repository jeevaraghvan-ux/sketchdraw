import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Calendar,
  Award,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  PenTool,
  User,
  RefreshCw,
  Database
} from 'lucide-react';
import type { UserProfile, LeaderboardResponse } from '../types';
import {
  getLeaderboard,
  getDrawingHistory,
  getLocalDateKey
} from '../services/supabase';
import { DAILY_PROMPTS_POOL } from '../data/techniques';

interface StreakProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLaunchPadWithPrompt: (promptTitle: string) => void;
}

export const Streak: React.FC<StreakProps> = ({
  user,
  onOpenAuth,
  onLaunchPadWithPrompt
}) => {
  const [leaderboardTab, setLeaderboardTab] = useState<'allTime' | 'thisMonth'>('allTime');
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse>({
    allTime: [],
    thisMonth: [],
    source: 'supabase',
  });
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(true);

  const loadLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    const result = await getLeaderboard(user);
    setLeaderboard(result);
    setLoadingLeaderboard(false);
  }, [user]);

  useEffect(() => {
    let active = true;
    getLeaderboard(user).then((result) => {
      if (!active) return;
      setLeaderboard(result);
      setLoadingLeaderboard(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const today = getLocalDateKey();
  const hasDrawnToday = user?.lastDrawnDate === today;
  const currentLeaderboard =
    leaderboardTab === 'allTime' ? leaderboard.allTime : leaderboard.thisMonth;
  const todayPrompt = DAILY_PROMPTS_POOL[0];

  const activeDateSet = useMemo(() => {
    const dates = new Set<string>();
    if (!user) return dates;
    const history = getDrawingHistory(user.id);
    for (const item of history) {
      if (item?.date) dates.add(item.date);
    }
    if (user.lastDrawnDate) {
      dates.add(user.lastDrawnDate);
    }
    return dates;
  }, [user]);

  // Signed-out gate
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#20242E] border border-slate-700 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-xl bg-[#B85333]/15 border border-[#B85333]/40 flex items-center justify-center text-[#B85333]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#16181F] border border-slate-700 font-mono text-xs text-[#B59A57]">
              <Flame className="w-3.5 h-3.5 text-[#B85333]" />
              <span>ATELIER STREAK LEDGER</span>
            </div>
            <h2 className="text-3xl font-normal text-white font-serif italic">
              Sign In to Unlock Your Streak
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track how many consecutive days you have drawn, save your daily artwork progress, and compete on the real member leaderboard.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto py-3 px-8 rounded-lg bg-[#B85333] hover:bg-[#a6482a] text-white font-mono font-medium text-xs uppercase tracking-wider riso-stamp active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In or Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-700 text-left">
            <div className="p-4 rounded-xl bg-[#16181F] border border-slate-700/80">
              <Flame className="w-5 h-5 text-[#B85333] mb-2" />
              <h4 className="text-xs font-semibold text-white">Daily Flame Counter</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Logs your consecutive drawing days directly to your verified account.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#16181F] border border-slate-700/80">
              <Calendar className="w-5 h-5 text-[#5294A6] mb-2" />
              <h4 className="text-xs font-semibold text-white">Activity Heatmap</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Visual grid tracking every real day you put pen to digital paper.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#16181F] border border-slate-700/80">
              <Trophy className="w-5 h-5 text-[#B59A57] mb-2" />
              <h4 className="text-xs font-semibold text-white">Member Leaderboard</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Live rankings of real signed-up SketchDraw members ordered by win streak.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Real 70-day activity heatmap from user's drawing history
  const heatmapDays = Array.from({ length: 70 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (69 - i));
    const dateStr = getLocalDateKey(d);
    const isToday = dateStr === today;
    const active = activeDateSet.has(dateStr);
    return {
      date: dateStr,
      active,
      isToday,
    };
  });

  const getDisplayedStreak = (entry: { streak: number; bestStreak: number; monthlyStreak: number }) =>
    leaderboardTab === 'allTime' ? entry.bestStreak : entry.monthlyStreak;

  const podiumGridClass =
    currentLeaderboard.length === 1
      ? 'grid-cols-1 max-w-sm mx-auto'
      : currentLeaderboard.length === 2
      ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
      : 'grid-cols-1 sm:grid-cols-3';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner: User Streak Flame */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#20242E] border border-[#B85333]/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-[#16181F] border-2 border-[#B85333] flex items-center justify-center">
                <Flame className="w-10 h-10 text-[#B85333]" />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded bg-[#B85333] text-white font-mono font-semibold text-xs shadow">
                {user.streak}d
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-normal text-white font-serif italic">
                {user.streak} Day Drawing Streak
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                {hasDrawnToday ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    You drew today. Your streak is secured.
                  </span>
                ) : (
                  <span className="text-[#B59A57] font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Save a drawing in The Pad today to extend your win streak.
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Member: <strong className="text-white">{user.name}</strong> • Best Win Streak:{' '}
                <strong className="text-[#B59A57]">{user.bestStreak} days</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onLaunchPadWithPrompt(todayPrompt.title)}
              className="py-3 px-6 rounded-lg bg-[#B85333] hover:bg-[#a6482a] text-white font-mono font-medium text-xs uppercase tracking-wider riso-stamp active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>{hasDrawnToday ? 'Draw Another Sketch' : 'Draw Today to Keep Streak'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#20242E] border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-[#B85333]" />
          </div>
          <div className="text-2xl font-semibold text-white font-mono">
            {user.streak} <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {user.streak > 0 ? 'Active streak' : 'Start today'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#20242E] border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Best Win Streak</span>
            <Trophy className="w-4 h-4 text-[#B59A57]" />
          </div>
          <div className="text-2xl font-semibold text-white font-mono">
            {user.bestStreak} <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Personal record</div>
        </div>

        <div className="p-4 rounded-xl bg-[#20242E] border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Sketches</span>
            <PenTool className="w-4 h-4 text-[#5294A6]" />
          </div>
          <div className="text-2xl font-semibold text-white font-mono">
            {user.totalDrawings} <span className="text-xs font-normal text-slate-400">Works</span>
          </div>
          <div className="text-[11px] text-[#5294A6] font-medium">Saved on SketchDraw</div>
        </div>

        <div className="p-4 rounded-xl bg-[#20242E] border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Artist Badges</span>
            <Award className="w-4 h-4 text-[#B59A57]" />
          </div>
          <div className="text-2xl font-semibold text-white font-mono">
            {user.badges.length} <span className="text-xs font-normal text-slate-400">Unlocked</span>
          </div>
          <div className="text-[11px] text-[#B59A57] font-medium truncate">
            {user.badges[user.badges.length - 1] || 'Verified Artist'}
          </div>
        </div>
      </div>

      {/* Main Row: Activity Heatmap & Daily Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-xl bg-[#20242E] border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5294A6]" />
              <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Drawing Activity Heatmap
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Past 10 Weeks</span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1.5 min-w-[500px]">
              {heatmapDays.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date}: ${day.active ? 'Saved sketch' : 'No drawing logged'}`}
                  className={`w-3.5 h-3.5 rounded-sm transition-all ${
                    day.isToday
                      ? day.active
                        ? 'bg-[#B85333] ring-2 ring-[#B85333] ring-offset-1 ring-offset-[#1A1D24]'
                        : 'bg-slate-700 ring-2 ring-[#B59A57]'
                      : day.active
                      ? 'bg-[#5294A6] hover:bg-[#5294A6]/80'
                      : 'bg-[#16181F] hover:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700 font-mono">
            <div className="flex items-center gap-2">
              <span>Inactive</span>
              <span className="w-3 h-3 rounded-sm bg-[#16181F] border border-slate-700 inline-block"></span>
              <span className="w-3 h-3 rounded-sm bg-[#5294A6] inline-block"></span>
              <span className="w-3 h-3 rounded-sm bg-[#B85333] inline-block"></span>
              <span>Logged</span>
            </div>
            <span>Synced from your real drawing history</span>
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-xl bg-[#20242E] border border-slate-700 space-y-4 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#5294A6]/15 text-[#5294A6] border border-[#5294A6]/30 uppercase tracking-wider">
                Daily Prompt
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Today
              </span>
            </div>

            <h3 className="text-lg font-normal text-white font-serif italic">
              {todayPrompt.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {todayPrompt.description}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
              {todayPrompt.suggestedTools.map((t: string) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#16181F] text-slate-300 border border-slate-700 capitalize"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => onLaunchPadWithPrompt(todayPrompt.title)}
            className="w-full py-2.5 px-4 rounded-lg bg-[#5294A6] hover:bg-[#468293] text-white font-mono font-medium text-xs transition-all flex items-center justify-center gap-2"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw Today's Prompt</span>
          </button>
        </div>
      </div>

      {/* LEADERBOARD (Real Signed-Up Members) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#20242E] border border-slate-700 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#B59A57] uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Verified Members // {currentLeaderboard.length} Signed Up</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal text-white font-serif italic">
              Top Streaks Leaderboard
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadLeaderboard}
              disabled={loadingLeaderboard}
              title="Refresh leaderboard"
              className="p-2 rounded-lg bg-[#16181F] hover:bg-[#282C38] border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLeaderboard ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex p-1 bg-[#16181F] rounded-lg border border-slate-700 text-xs font-mono">
              <button
                onClick={() => setLeaderboardTab('allTime')}
                className={`px-3 py-1.5 rounded transition-all ${
                  leaderboardTab === 'allTime'
                    ? 'bg-[#B59A57] text-[#14161C] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setLeaderboardTab('thisMonth')}
                className={`px-3 py-1.5 rounded transition-all ${
                  leaderboardTab === 'thisMonth'
                    ? 'bg-[#B59A57] text-[#14161C] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        {/* Notice if profiles table SQL hasn't been executed in Supabase yet */}
        {leaderboard.needsTableSetup && (
          <div className="p-4 rounded-xl bg-[#16181F] border border-[#B59A57]/40 flex items-start gap-3 text-xs text-slate-300">
            <Database className="w-4 h-4 text-[#B59A57] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                Shared leaderboard table needs one-time setup in Supabase
              </p>
              <p className="text-slate-400 leading-relaxed">
                Your own signed-in streak is saved, and fake artists have been removed. Run <code className="px-1.5 py-0.5 rounded bg-[#20242E] text-[#5294A6] font-mono">supabase/schema.sql</code> in your Supabase SQL Editor so all verified accounts appear together here.
              </p>
            </div>
          </div>
        )}

        {leaderboard.error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{leaderboard.error}</span>
          </div>
        )}

        {loadingLeaderboard ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400">
            Loading verified members from Supabase...
          </div>
        ) : currentLeaderboard.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm text-slate-300">No verified members found on the leaderboard yet.</p>
            <p className="text-xs text-slate-500 font-mono">
              Save a drawing in The Pad to claim the #1 spot.
            </p>
          </div>
        ) : (
          <>
            {/* Podium for Top 3 */}
            <div className={`grid ${podiumGridClass} gap-4 pt-2`}>
              {/* Rank #2 Silver */}
              {currentLeaderboard[1] && (
                <div className="order-2 sm:order-1 p-4 rounded-xl bg-[#16181F] border border-slate-700 flex flex-col items-center text-center space-y-2">
                  <span className="w-7 h-7 rounded bg-slate-300 text-[#14161C] font-mono font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <div className="w-11 h-11 rounded-lg bg-[#20242E] border border-slate-600 flex items-center justify-center font-mono text-sm font-semibold text-slate-200">
                    {currentLeaderboard[1].avatar}
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate max-w-[160px]">
                    {currentLeaderboard[1].name}
                    {currentLeaderboard[1].isCurrentUser ? ' (You)' : ''}
                  </h4>
                  <div className="text-xs font-mono font-semibold text-[#B85333] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{getDisplayedStreak(currentLeaderboard[1])} Day Streak</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#20242E] border border-slate-700 text-slate-300 font-mono">
                    {currentLeaderboard[1].badge}
                  </span>
                </div>
              )}

              {/* Rank #1 Gold */}
              {currentLeaderboard[0] && (
                <div className="order-1 sm:order-2 p-5 rounded-xl bg-[#16181F] border border-[#B59A57]/60 shadow-xl flex flex-col items-center text-center space-y-2 relative">
                  <span className="px-2 py-0.5 rounded bg-[#B59A57] text-[#14161C] font-mono font-semibold text-[10px] uppercase tracking-wider">
                    Top Streak
                  </span>
                  <div className="w-12 h-12 rounded-lg bg-[#B59A57]/20 border border-[#B59A57]/50 flex items-center justify-center font-mono text-base font-bold text-[#B59A57] mt-1">
                    {currentLeaderboard[0].avatar}
                  </div>
                  <h4 className="text-base font-semibold text-white truncate max-w-[180px]">
                    {currentLeaderboard[0].name}
                    {currentLeaderboard[0].isCurrentUser ? ' (You)' : ''}
                  </h4>
                  <div className="text-sm font-mono font-semibold text-[#B59A57] flex items-center gap-1">
                    <Flame className="w-4 h-4 text-[#B85333]" />
                    <span>{getDisplayedStreak(currentLeaderboard[0])} Day Win Streak</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#B59A57]/15 border border-[#B59A57]/30 text-[#B59A57] font-mono">
                    {currentLeaderboard[0].badge}
                  </span>
                </div>
              )}

              {/* Rank #3 Bronze */}
              {currentLeaderboard[2] && (
                <div className="order-3 sm:order-3 p-4 rounded-xl bg-[#16181F] border border-slate-700 flex flex-col items-center text-center space-y-2">
                  <span className="w-7 h-7 rounded bg-[#B85333] text-white font-mono font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <div className="w-11 h-11 rounded-lg bg-[#20242E] border border-slate-600 flex items-center justify-center font-mono text-sm font-semibold text-slate-200">
                    {currentLeaderboard[2].avatar}
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate max-w-[160px]">
                    {currentLeaderboard[2].name}
                    {currentLeaderboard[2].isCurrentUser ? ' (You)' : ''}
                  </h4>
                  <div className="text-xs font-mono font-semibold text-[#B85333] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{getDisplayedStreak(currentLeaderboard[2])} Day Streak</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#20242E] border border-slate-700 text-slate-300 font-mono">
                    {currentLeaderboard[2].badge}
                  </span>
                </div>
              )}
            </div>

            {/* Full Leaderboard Table */}
            <div className="overflow-x-auto border border-slate-700 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#16181F] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">
                      {leaderboardTab === 'allTime' ? 'Best Win Streak' : 'Monthly Streak'}
                    </th>
                    <th className="py-3 px-4">Active Now</th>
                    <th className="py-3 px-4">Total Sketches</th>
                    <th className="py-3 px-4">Honor Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80">
                  {currentLeaderboard.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        entry.isCurrentUser
                          ? 'bg-[#5294A6]/15 hover:bg-[#5294A6]/20 font-medium text-white'
                          : 'hover:bg-[#16181F]/60'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        #{entry.rank}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded bg-[#16181F] border border-slate-700 flex items-center justify-center font-mono text-[11px] font-semibold text-[#5294A6]">
                            {entry.avatar}
                          </span>
                          <span>{entry.name}</span>
                          {entry.isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5294A6] text-white font-mono">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#B85333] font-mono font-semibold">
                        {getDisplayedStreak(entry)} days
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {entry.streak}d
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {leaderboardTab === 'allTime' ? entry.totalDrawings : entry.monthlyDrawings}{' '}
                        sketches
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#16181F] text-slate-300 border border-slate-700 text-[10px] font-mono">
                          {entry.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
