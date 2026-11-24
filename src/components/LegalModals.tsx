import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-dark-850 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-dark-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 text-brand-cyan flex items-center justify-center">
              {type === 'privacy' ? <ShieldCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-white font-display">
              {type === 'privacy' ? 'SketchDraw Privacy Policy' : 'SketchDraw Terms of Service'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p className="text-slate-400">Effective Date: November 2026</p>
              
              <h4 className="font-bold text-white text-sm pt-2">1. Information We Collect</h4>
              <p>
                When you use SketchDraw, we may collect basic account information (such as your display name and email address) provided through Google Authentication via Supabase. We do not sell or monetize your personal data.
              </p>

              <h4 className="font-bold text-white text-sm pt-2">2. Artwork &amp; Sketch Data</h4>
              <p>
                Drawings created in The Pad are rendered locally on your device. When you log sketches to your drawing streak, metadata (such as drawing date, surface type, and streak count) is stored securely in your browser and authenticated session.
              </p>

              <h4 className="font-bold text-white text-sm pt-2">3. Third-Party Services</h4>
              <p>
                We use Google OAuth for secure login authentication and Supabase for backend cloud data management. These providers adhere to strict enterprise security standards.
              </p>

              <h4 className="font-bold text-white text-sm pt-2">4. Contact &amp; Data Deletion</h4>
              <p>
                You may request account deletion or clear all local drawing data anytime directly from your browser settings or by signing out.
              </p>
            </>
          ) : (
            <>
              <p className="text-slate-400">Effective Date: November 2026</p>

              <h4 className="font-bold text-white text-sm pt-2">1. Use of SketchDraw</h4>
              <p>
                SketchDraw is a free digital drawing web application. You are free to use our drawing pad, paper physics tools, and technique library for personal and commercial creative work.
              </p>

              <h4 className="font-bold text-white text-sm pt-2">2. Intellectual Property of Your Artwork</h4>
              <p>
                You retain 100% full copyright and ownership of all original artwork, sketches, and illustrations created using SketchDraw. SketchDraw claims no ownership over your creations.
              </p>

              <h4 className="font-bold text-white text-sm pt-2">3. Community &amp; Leaderboards</h4>
              <p>
                When participating in the Streak leaderboard, users must refrain from submitting harmful, abusive, or infringing usernames.
              </p>

              <h4 className="font-bold text-white text-sm pt-2">4. Disclaimer</h4>
              <p>
                SketchDraw is provided "as is" without warranty of any kind. We encourage creators to export and back up their artwork regularly.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-dark-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
