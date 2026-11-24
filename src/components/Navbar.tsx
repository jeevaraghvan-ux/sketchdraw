import React, { useState } from 'react';
import { 
  Flame, Compass, PenTool, User, LogOut, 
  ChevronDown, CheckCircle2 
} from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'discover' | 'pad' | 'streak';
  onSelectTab: (tab: 'home' | 'discover' | 'pad' | 'streak') => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  user,
  onOpenAuth,
  onSignOut
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-900/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-pink via-brand-purple to-brand-cyan p-0.5 shadow-lg shadow-brand-purple/20 group-hover:shadow-brand-purple/40 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <PenTool className="w-4 h-4 text-brand-cyan group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight gradient-text-rainbow font-display">
              SketchDraw
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold -mt-1">
              Digital Drawing &amp; Physics
            </span>
          </div>
        </div>

        {/* Center: Main Navigation Tabs (Instant access without scrolling down) */}
        <nav className="flex items-center p-1 bg-dark-850/90 border border-slate-800 rounded-xl shadow-inner">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 text-white border border-brand-purple/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span>Home</span>
          </button>

          <button
            onClick={() => onSelectTab('discover')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 text-brand-cyan border border-brand-cyan/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => onSelectTab('pad')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'pad'
                ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-md shadow-brand-purple/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>The Pad</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 font-bold uppercase tracking-wider">
              Canvas
            </span>
          </button>

          <button
            onClick={() => onSelectTab('streak')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'streak'
                ? 'bg-gradient-to-r from-brand-orange/20 to-brand-yellow/20 text-brand-orange border border-brand-orange/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${user ? 'text-brand-orange animate-pulse' : ''}`} />
            <span>Streak</span>
            {user && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
                {user.streak}d
              </span>
            )}
          </button>
        </nav>

        {/* Right: User / Sign In Button */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 border border-slate-700/80 transition-all text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center text-xs font-bold text-white shadow">
                  {user.avatarUrl && user.avatarUrl.length <= 4 ? user.avatarUrl : (user.name ? user.name[0].toUpperCase() : 'U')}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-white leading-tight flex items-center gap-1">
                    <span>{user.name}</span>
                    {user.isGuest && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-700 text-slate-300 font-normal">
                        Guest
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-brand-orange font-medium flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5" />
                    <span>{user.streak} day streak</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* User Dropdown */}
              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-dark-850 border border-slate-800 shadow-2xl p-1.5 z-50 animate-fadeIn"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email || 'Local Browser Session'}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{user.totalDrawings} sketches logged</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('streak');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-dark-800 flex items-center gap-2 transition-colors"
                  >
                    <Flame className="w-4 h-4 text-brand-orange" />
                    <span>My Streak &amp; Leaderboard</span>
                  </button>

                  <div className="border-t border-slate-800 my-1"></div>

                  <button
                    onClick={() => {
                      onSignOut();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan hover:brightness-110 text-white text-xs font-bold shadow-md shadow-brand-purple/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
