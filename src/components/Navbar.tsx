import React, { useState } from 'react';
import { LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-700/60 bg-[#1A1D24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 font-mono">
        
        {/* Left: Brand Identity */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#242832] border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-[#5294A6] group-hover:border-[#5294A6] transition-colors">
            SD
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-normal tracking-tight text-white font-serif italic">
              SketchDraw
            </span>
            <span className="text-[9px] tracking-widest uppercase text-slate-400 font-mono -mt-0.5">
              ATELIER DRAFTING v2.4
            </span>
          </div>
        </div>

        {/* Center: Main Navigation Tabs (Text-First, Zero Icon Slop) */}
        <nav className="flex items-center p-1 bg-[#14161C] border border-slate-700/80 rounded-lg text-xs">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'home'
                ? 'bg-[#282D3B] text-white font-medium border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectTab('discover')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'discover'
                ? 'bg-[#282D3B] text-[#5294A6] font-medium border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Discover
          </button>

          <button
            onClick={() => onSelectTab('pad')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'pad'
                ? 'bg-[#B85333] text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            The Pad
          </button>

          <button
            onClick={() => onSelectTab('streak')}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'streak'
                ? 'bg-[#282D3B] text-[#B59A57] font-medium border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Streak</span>
            {user && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-[#B59A57]/20 text-[#B59A57]">
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
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-[#222630] hover:bg-[#282D38] border border-slate-700 text-xs"
              >
                <div className="w-5 h-5 rounded bg-[#5294A6]/20 text-[#5294A6] flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-white font-medium">{user.name}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
              </button>

              {/* User Dropdown */}
              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#1D2028] border border-slate-700 shadow-2xl p-1.5 z-50 animate-fadeIn"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-700 mb-1">
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
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-[#262A34] flex items-center gap-2 transition-colors"
                  >
                    <span>My Streak &amp; Leaderboard</span>
                  </button>

                  <div className="border-t border-slate-700 my-1"></div>

                  <button
                    onClick={() => {
                      onSignOut();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="py-1.5 px-3.5 rounded-lg bg-[#B85333] hover:bg-[#a5482a] text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Sign In
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
