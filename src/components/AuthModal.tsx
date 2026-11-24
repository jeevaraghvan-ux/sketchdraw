import React, { useState } from 'react';
import { 
  X, Sparkles, User, Mail, Lock, KeyRound, 
  AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { 
  signUpWithEmail, 
  verifyEmailCode, 
  signInWithEmailPassword, 
  resendVerificationCode 
} from '../services/supabase';
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
  // Tabs: 'signup' | 'signin'
  const [tab, setTab] = useState<'signup' | 'signin'>('signup');

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Verification Step
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);


  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter an email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await signUpWithEmail(email, password, username);
    setLoading(false);

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setIsVerifying(true);
      setSuccessMessage(`We sent a verification code to ${email}! Check your Gmail.`);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!verificationCode.trim()) {
      setErrorMessage('Please enter the verification code from your email.');
      return;
    }

    setLoading(true);
    const result = await verifyEmailCode(email, verificationCode);
    setLoading(false);

    if (result.error) {
      setErrorMessage(result.error);
    } else if (result.profile) {
      onAuthSuccess(result.profile);
      onClose();
    }
  };

  // Handle Sign In with Password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const result = await signInWithEmailPassword(email, password);
    setLoading(false);

    if (result.error) {
      // If user is not confirmed, switch to verification view
      if (result.error.toLowerCase().includes('not confirmed') || result.error.toLowerCase().includes('verification')) {
        setIsVerifying(true);
        setErrorMessage('Your email is not verified yet. Please enter the verification code sent to your Gmail.');
      } else {
        setErrorMessage(result.error);
      }
    } else if (result.profile) {
      onAuthSuccess(result.profile);
      onClose();
    }
  };

  // Handle Resend Code
  const handleResend = async () => {
    setResendStatus('Sending new code...');
    const res = await resendVerificationCode(email);
    if (res.error) {
      setResendStatus(`Error: ${res.error}`);
    } else {
      setResendStatus('New code sent! Please check your inbox or spam.');
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-dark-850 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-pink via-brand-purple to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-purple/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-display">
            Welcome to <span className="gradient-text-rainbow">SketchDraw</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {isVerifying
              ? 'Enter the verification code sent to your Gmail'
              : tab === 'signup'
              ? 'Create an account to track your daily streak and join the leaderboard!'
              : 'Sign in to access your saved streaks, badges, and sketches.'}
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-red-200">Notice</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* VERIFICATION CODE SCREEN */}
        {isVerifying ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 bg-dark-900 border border-brand-purple/30 rounded-xl text-center space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-brand-cyan font-semibold">
                Verification Email Sent
              </span>
              <p className="text-xs text-slate-300 font-medium">
                Sent to: <span className="text-white font-bold">{email}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Check your Gmail inbox (or Spam folder) for your verification code.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Enter Verification Code</span>
                <span className="text-[10px] text-slate-500">6-8 digits</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-brand-purple absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. 12345678"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={12}
                  autoFocus
                  required
                  className="w-full pl-10 pr-3.5 py-3 bg-dark-900 border border-brand-purple/40 rounded-xl text-base tracking-[0.2em] font-mono font-bold text-center text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !verificationCode.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-pink via-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-brand-purple/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verifying Code...' : 'Verify & Enter SketchDraw'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Resend Code / Back */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleResend}
                className="text-brand-cyan hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend Code</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsVerifying(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                Change Email / Back
              </button>
            </div>

            {resendStatus && (
              <p className="text-[11px] text-center text-brand-cyan font-medium animate-fadeIn">
                {resendStatus}
              </p>
            )}
          </form>
        ) : (
          /* CREATE ACCOUNT / SIGN IN TABS & FORM */
          <div className="space-y-4">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 p-1 bg-dark-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'signup'
                    ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'signin'
                    ? 'bg-gradient-to-r from-brand-purple to-brand-cyan text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={tab === 'signup' ? handleSignUp : handleSignIn} className="space-y-3">
              {/* Username field (Only for Sign Up) */}
              {tab === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. MasterArtist"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={24}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Email Address (Gmail)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-pink via-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-brand-purple/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>
                  {loading
                    ? 'Processing...'
                    : tab === 'signup'
                    ? 'Create Account & Send Code'
                    : 'Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Safe privacy footer */}
        <div className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Accounts and streaks are secured by Supabase Cloud.</span>
        </div>

      </div>
    </div>
  );
};