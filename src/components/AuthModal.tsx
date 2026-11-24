import React, { useState } from 'react';
import { X, Sparkles, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { signInWithGoogle, signInAsGuest } from '../services/supabase';
import type { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);

    const result = await signInWithGoogle();
    if (result.error) {
      setErrorMessage(result.error);
      setLoading(false);
    }
  };

  const handleGuestSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const name = guestName.trim() || 'Creative Artist';
    const profile = signInAsGuest(name);
    onAuthSuccess(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-dark-850 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-pink via-brand-purple to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-purple/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-display">
            Sign In to <span className="gradient-text-rainbow">SketchDraw</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Sign in to track your drawing streak, earn artist badges, and climb the global leaderboard!
          </p>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-red-200">Notice</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Primary Google Auth Button (Redirects to Supabase) */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative group disabled:opacity-60"
          >
            {/* Google SVG Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-bold">{loading ? 'Redirecting to Supabase...' : 'Sign in with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-dark-850 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Or enter as guest
          </span>
        </div>

        {/* Instant Guest / Demo Mode */}
        <form onSubmit={handleGuestSignIn} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Guest Artist Nickname</span>
              <span className="text-[10px] text-slate-500">Instant Access</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. NeonDaVinci"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={24}
                className="w-full pl-10 pr-3.5 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-purple/20 via-brand-cyan/20 to-brand-pink/20 hover:from-brand-purple/30 hover:via-brand-cyan/30 hover:to-brand-pink/30 border border-brand-purple/30 text-white text-xs font-semibold shadow-lg shadow-brand-purple/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Enter as Guest Artist</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-cyan group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Safe privacy footer */}
        <div className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>All sketches stored securely in your browser &amp; Supabase cloud.</span>
        </div>

      </div>
    </div>
  );
};
