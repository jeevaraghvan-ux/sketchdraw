import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Discover } from './components/Discover';
import { Pad } from './components/Pad';
import { Streak } from './components/Streak';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModals';
import { OpeningIntro } from './components/OpeningIntro';
import type { UserProfile, DrawingSurface, DrawingTool } from './types';
import { getCurrentUser, signOutUser, getSupabaseClient } from './services/supabase';
import { PenTool, Heart } from 'lucide-react';

export function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'pad' | 'streak'>('home');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Presets passed to The Pad
  const [padPresets, setPadPresets] = useState<{
    surface?: DrawingSurface;
    tool?: DrawingTool;
    color?: string;
    width?: number;
    promptTitle?: string;
  }>({});

  // Check auth session on load (including Supabase OAuth redirect callback)
  useEffect(() => {
    async function loadUser() {
      // Check for Supabase session or local profile
      const profile = await getCurrentUser();
      setUser(profile);

      // Listen to Supabase auth state changes if client exists
      const client = getSupabaseClient();
      if (client) {
        const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const u = await getCurrentUser();
            setUser(u);
          } else {
            setUser(null);
          }
        });
        return () => subscription.unsubscribe();
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    if (activeTab === 'streak') {
      setActiveTab('home');
    }
  };

  const handleLaunchInPad = (config: {
    tool: DrawingTool;
    surface: DrawingSurface;
    color: string;
    width: number;
    techniqueTitle?: string;
  }) => {
    setPadPresets({
      tool: config.tool,
      surface: config.surface,
      color: config.color,
      width: config.width,
      promptTitle: config.techniqueTitle
    });
    setActiveTab('pad');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchPadWithPrompt = (promptTitle: string) => {
    setPadPresets({
      promptTitle: promptTitle
    });
    setActiveTab('pad');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStreakUpdated = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans selection:bg-[#00E5FF]/20 selection:text-white">
      
      {/* Top Navigation Bar with Tabs & Sign In button */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <Home
            onSelectTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLaunchInPad={handleLaunchInPad}
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'discover' && (
          <Discover onLaunchInPad={handleLaunchInPad} />
        )}

        {activeTab === 'pad' && (
          <Pad
            initialSurface={padPresets.surface}
            initialTool={padPresets.tool}
            initialColor={padPresets.color}
            initialWidth={padPresets.width}
            activeTechniquePrompt={padPresets.promptTitle}
            onClearTechniquePrompt={() => setPadPresets(prev => ({ ...prev, promptTitle: undefined }))}
            user={user}
            onStreakUpdated={handleStreakUpdated}
          />
        )}

        {activeTab === 'streak' && (
          <Streak
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLaunchPadWithPrompt={handleLaunchPadWithPrompt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-dark-950 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-pink to-brand-cyan p-0.5">
              <div className="w-full h-full bg-dark-950 rounded-[6px] flex items-center justify-center">
                <PenTool className="w-3.5 h-3.5 text-brand-cyan" />
              </div>
            </div>
            <div>
              <span className="font-bold text-white text-sm">SketchDraw</span>
              <p className="text-[11px] text-slate-500">Free Digital Drawing &amp; Realistic Paper Physics</p>
            </div>
          </div>

          {/* Quick tab links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <button
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab('discover');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-brand-cyan transition-colors"
            >
              Discover
            </button>
            <button
              onClick={() => {
                setActiveTab('pad');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-brand-purple transition-colors"
            >
              The Pad
            </button>
            <button
              onClick={() => {
                setActiveTab('streak');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-brand-orange transition-colors"
            >
              The Streak
            </button>
            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </a>
            <button
              onClick={() => {
                setShowIntro(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-brand-cyan transition-colors"
            >
              Replay Intro ✨
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-brand-pink fill-current" />
            <span>for digital creators</span>
          </div>

        </div>
      </footer>

      {/* Opening Intro Animation */}
      {showIntro && (
        <OpeningIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* Auth Modal (Sign in / Email verification) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(profile) => {
          setUser(profile);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Legal Privacy / Terms Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

    </div>
  );
}

export default App;
