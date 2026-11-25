import React, { useState } from 'react';
import { 
  Flame, Trophy, Calendar, Award, Lock, 
  ArrowRight, CheckCircle2, AlertCircle, Clock, PenTool, 
  User 
} from 'lucide-react';
import type { UserProfile } from '../types';
import { getLeaderboard } from '../services/supabase';
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

  const today = new Date().toISOString().split('T')[0];
  const hasDrawnToday = user?.lastDrawnDate === today;
  const leaderboardData = getLeaderboard();
  const currentLeaderboard = leaderboardTab === 'allTime' ? leaderboardData.allTime : leaderboardData.thisMonth;
  const todayPrompt = DAILY_PROMPTS_POOL[0];

  // If user is NOT signed in:
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn">
        <div className="p-8 sm:p-12 rounded-3xl bg-dark-850/90 border border-slate-800 text-center space-y-6 relative overflow-hidden shadow-2xl">
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-orange/15 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-yellow flex items-center justify-center text-dark-900 shadow-xl shadow-brand-orange/25">
            <Lock className="w-8 h-8 text-dark-900" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-xs font-semibold text-brand-orange">
              <Flame className="w-3.5 h-3.5" />
              <span>Scenario 3: The Streak</span>
            </div>
            <h2 className="text-3xl font-black text-white font-display">
              Sign In to Unlock Your Streak
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              The Streak only appears once signed in. Track how many consecutive days you've drawn, keep your creative flame alive, and climb the global artist leaderboard!
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-brand-orange to-brand-yellow hover:brightness-110 text-dark-900 font-bold text-sm shadow-xl shadow-brand-orange/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Continue with Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Teaser Preview of Streak Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-xl bg-dark-900/60 border border-slate-800">
              <Flame className="w-5 h-5 text-brand-orange mb-2" />
              <h4 className="text-xs font-bold text-white">Daily Flame Counter</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Logs your consecutive drawing habit and prevents creative burnout.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-dark-900/60 border border-slate-800">
              <Calendar className="w-5 h-5 text-brand-purple mb-2" />
              <h4 className="text-xs font-bold text-white">Activity Heatmap</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Visual grid tracking every single day you put pen to digital paper.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-dark-900/60 border border-slate-800">
              <Trophy className="w-5 h-5 text-brand-yellow mb-2" />
              <h4 className="text-xs font-bold text-white">Top Streaks Leaderboard</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Compete with artists worldwide and earn badges like Grandmaster &amp; Ink Sorcerer.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Generate 70 mock days for the heatmap
  const heatmapDays = Array.from({ length: 70 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (69 - i));
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === today;
    const active = isToday ? hasDrawnToday : (i % 2 === 0 || i % 3 === 0);
    return {
      date: dateStr,
      active,
      isToday
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner: User Streak Flame */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-dark-850 via-dark-850 to-brand-orange/15 border border-brand-orange/30 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Flame Icon & Streak Info */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-orange via-red-500 to-brand-yellow p-1 shadow-2xl shadow-brand-orange/30 animate-pulse">
                <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
                  <Flame className="w-10 h-10 text-brand-orange fill-current" />
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-brand-orange text-dark-900 font-black text-xs shadow">
                {user.streak}d
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
                  {user.streak} Day Drawing Streak!
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                {hasDrawnToday ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    You drew today! Your creative flame is safely protected.
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Haven't drawn yet today! Draw on The Pad to keep your streak alive.
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">
                Artist Profile: <strong className="text-white">{user.name}</strong> • Best Record: <strong className="text-brand-yellow">{user.bestStreak} days</strong>
              </p>
            </div>
          </div>

          {/* Quick Action Button to Draw */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLaunchPadWithPrompt(todayPrompt.title)}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-brand-yellow hover:brightness-110 text-dark-900 font-bold text-xs shadow-lg shadow-brand-orange/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <PenTool className="w-4 h-4 text-dark-900" />
              <span>{hasDrawnToday ? 'Draw Another Sketch' : 'Draw Today to Keep Streak'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-brand-orange" />
          </div>
          <div className="text-2xl font-black text-white">{user.streak} <span className="text-xs font-normal text-slate-400">Days</span></div>
          <div className="text-[11px] text-emerald-400 font-medium">Active streak</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Best Streak</span>
            <Trophy className="w-4 h-4 text-brand-yellow" />
          </div>
          <div className="text-2xl font-black text-white">{user.bestStreak} <span className="text-xs font-normal text-slate-400">Days</span></div>
          <div className="text-[11px] text-slate-400 font-medium">Personal best record</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Sketches</span>
            <PenTool className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-2xl font-black text-white">{user.totalDrawings} <span className="text-xs font-normal text-slate-400">Works</span></div>
          <div className="text-[11px] text-brand-cyan font-medium">Logged on SketchDraw</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Artist Badges</span>
            <Award className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="text-2xl font-black text-white">{user.badges.length} <span className="text-xs font-normal text-slate-400">Unlocked</span></div>
          <div className="text-[11px] text-brand-purple font-medium truncate">
            {user.badges[user.badges.length - 1] || 'Artisan'}
          </div>
        </div>

      </div>

      {/* Main Row: Activity Heatmap & Today's Daily Challenge Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 70-Day Drawing Calendar Heatmap */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-dark-850 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-purple" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Drawing Activity Heatmap
              </h3>
            </div>
            <span className="text-xs text-slate-400">Past 10 Weeks</span>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1.5 min-w-[500px]">
              {heatmapDays.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date}: ${day.active ? 'Completed sketch!' : 'No drawing'}`}
                  className={`w-3.5 h-3.5 rounded-sm transition-all ${
                    day.isToday
                      ? day.active
                        ? 'bg-brand-orange ring-2 ring-brand-orange ring-offset-1 ring-offset-dark-900 shadow-sm shadow-brand-orange'
                        : 'bg-slate-700 ring-2 ring-amber-400 animate-pulse'
                      : day.active
                      ? 'bg-brand-purple hover:bg-brand-purple/80'
                      : 'bg-dark-900 hover:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span>Less</span>
              <span className="w-3 h-3 rounded-sm bg-dark-900 inline-block"></span>
              <span className="w-3 h-3 rounded-sm bg-brand-purple/40 inline-block"></span>
              <span className="w-3 h-3 rounded-sm bg-brand-purple inline-block"></span>
              <span className="w-3 h-3 rounded-sm bg-brand-orange inline-block"></span>
              <span>More</span>
            </div>
            <span>Updated live from your browser &amp; Supabase session</span>
          </div>
        </div>

        {/* Right: Daily Creative Prompt */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-dark-850 to-dark-800 border border-brand-purple/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-purple/20 text-brand-purple uppercase tracking-wider">
                Daily Prompt
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Today
              </span>
            </div>

            <h3 className="text-base font-bold text-white font-display">
              {todayPrompt.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {todayPrompt.description}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {todayPrompt.suggestedTools.map((t: string) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-dark-900 text-slate-300 border border-slate-700 capitalize">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => onLaunchPadWithPrompt(todayPrompt.title)}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-purple hover:brightness-110 text-white font-semibold text-xs transition-all shadow-md shadow-brand-purple/25 flex items-center justify-center gap-2"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw Today's Prompt</span>
          </button>
        </div>

      </div>

      {/* LEADERBOARD (Top Streaks) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-dark-850 border border-slate-800 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-yellow uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Global Artist Rankings</span>
            </div>
            <h2 className="text-2xl font-black text-white font-display">
              Top Streaks Leaderboard
            </h2>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex p-1 bg-dark-900 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setLeaderboardTab('allTime')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                leaderboardTab === 'allTime'
                  ? 'bg-brand-yellow text-dark-900 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setLeaderboardTab('thisMonth')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                leaderboardTab === 'thisMonth'
                  ? 'bg-brand-yellow text-dark-900 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Podium for Top 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Rank #2 Silver */}
          {currentLeaderboard[1] && (
            <div className="order-2 sm:order-1 p-4 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col items-center text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-slate-300 text-dark-900 font-black text-xs flex items-center justify-center">
                2
              </span>
              <div className="text-2xl">{currentLeaderboard[1].avatar}</div>
              <h4 className="text-sm font-bold text-white truncate max-w-[140px]">
                {currentLeaderboard[1].name}
              </h4>
              <div className="text-xs font-bold text-brand-orange flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{currentLeaderboard[1].streak} Days</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {currentLeaderboard[1].badge}
              </span>
            </div>
          )}

          {/* Rank #1 Gold */}
          {currentLeaderboard[0] && (
            <div className="order-1 sm:order-2 p-5 rounded-2xl bg-gradient-to-b from-brand-yellow/15 to-dark-900 border border-brand-yellow/40 shadow-xl shadow-brand-yellow/10 flex flex-col items-center text-center space-y-2 relative">
              <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-brand-yellow text-dark-900 font-bold text-[10px] uppercase tracking-wider shadow">
                Champion
              </span>
              <span className="w-8 h-8 rounded-full bg-brand-yellow text-dark-900 font-black text-sm flex items-center justify-center shadow-lg shadow-brand-yellow/20 mt-1">
                1
              </span>
              <div className="text-3xl">{currentLeaderboard[0].avatar}</div>
              <h4 className="text-base font-black text-white truncate max-w-[160px]">
                {currentLeaderboard[0].name}
              </h4>
              <div className="text-sm font-extrabold text-brand-yellow flex items-center gap-1">
                <Flame className="w-4 h-4 fill-current text-brand-orange" />
                <span>{currentLeaderboard[0].streak} Days Streak</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-yellow/20 text-brand-yellow font-semibold">
                {currentLeaderboard[0].badge}
              </span>
            </div>
          )}

          {/* Rank #3 Bronze */}
          {currentLeaderboard[2] && (
            <div className="order-3 sm:order-3 p-4 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col items-center text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <div className="text-2xl">{currentLeaderboard[2].avatar}</div>
              <h4 className="text-sm font-bold text-white truncate max-w-[140px]">
                {currentLeaderboard[2].name}
              </h4>
              <div className="text-xs font-bold text-brand-orange flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{currentLeaderboard[2].streak} Days</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {currentLeaderboard[2].badge}
              </span>
            </div>
          )}

        </div>

        {/* Full Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Artist</th>
                <th className="py-3 px-4">Streak Days</th>
                <th className="py-3 px-4">Total Artworks</th>
                <th className="py-3 px-4">Honor Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {currentLeaderboard.map((entry) => (
                <tr 
                  key={entry.id}
                  className={`transition-colors ${
                    entry.isCurrentUser
                      ? 'bg-brand-purple/15 hover:bg-brand-purple/20 font-semibold text-white'
                      : 'hover:bg-dark-900/50'
                  }`}
                >
                  <td className="py-3 px-4 font-bold">
                    #{entry.rank}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2.5">
                    <span className="text-base">{entry.avatar}</span>
                    <span>{entry.name}</span>
                    {entry.isCurrentUser && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-purple text-white">
                        You
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#B85333] font-semibold">
                    {entry.streak} days streak
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {entry.totalDrawings} sketches
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-dark-900 text-slate-300 border border-slate-800 text-[10px]">
                      {entry.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
