import React from 'react';
import { 
  PenTool, Compass, Flame, Sparkles, Layers, Palette, 
  ArrowRight, Zap, CheckCircle 
} from 'lucide-react';
import type { UserProfile } from '../types';

interface HomeProps {
  onSelectTab: (tab: 'home' | 'discover' | 'pad' | 'streak') => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onSelectTab,
  user,
  onOpenAuth
}) => {
  return (
    <div className="space-y-20 pb-24">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-brand-purple/20 via-brand-pink/15 to-brand-cyan/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-800/90 border border-slate-700/80 text-xs font-medium text-slate-300 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-brand-cyan animate-pulse"></span>
              <span className="text-slate-300">Free Digital Drawing App</span>
              <span className="text-slate-500">•</span>
              <span className="text-brand-purple font-semibold">Dark &amp; Colorful</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display leading-[1.1]">
              Draw without limits with{' '}
              <span className="gradient-text-rainbow">realistic paper physics.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              <strong>SketchDraw</strong> combines a fluid whiteboard experience with authentic paper physics. Transform your canvas into organic paper or rough sketch texture, master pro drawing techniques in the <em>Discover</em> library, and ignite your daily drawing streak.
            </p>

            {/* Quick Hero Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onSelectTab('pad')}
                className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-brand-purple/25 active:scale-95 transition-all flex items-center gap-2.5 group"
              >
                <PenTool className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                <span>Launch The Pad</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onSelectTab('discover')}
                className="py-3.5 px-6 rounded-xl bg-dark-800 hover:bg-dark-750 border border-slate-700 hover:border-brand-cyan/50 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
              >
                <Compass className="w-4 h-4 text-brand-cyan" />
                <span>Browse Techniques</span>
              </button>

              <button
                onClick={() => {
                  if (user) onSelectTab('streak');
                  else onOpenAuth();
                }}
                className="py-3.5 px-5 rounded-xl bg-dark-800/80 hover:bg-dark-750 border border-slate-700/80 text-brand-orange font-semibold text-sm transition-all flex items-center gap-2"
              >
                <Flame className="w-4 h-4" />
                <span>{user ? `Streak: ${user.streak}d` : 'Daily Streak'}</span>
              </button>
            </div>

            {/* Micro feature pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>100% Free &amp; In-Browser</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-purple" />
                <span>Whiteboard, Paper &amp; Sketch Surfaces</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-cyan" />
                <span>High-DPI Retina Export</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Showcase Pictures & Artwork Previews */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Artwork Card (Cyberpunk & Vibrant Digital Sketch) */}
              <div className="relative p-3 rounded-2xl bg-dark-800/90 border border-slate-700 shadow-2xl backdrop-blur-xl group overflow-hidden">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-dark-950 border border-slate-800 flex items-center justify-center">
                  
                  {/* Stylized SVG Digital Illustration */}
                  <svg className="w-full h-full object-cover" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="300" fill="#0B0F19" />
                    
                    {/* Background grid */}
                    <g opacity="0.12" stroke="#8B5CF6" strokeWidth="0.8">
                      <line x1="0" y1="50" x2="400" y2="50" />
                      <line x1="0" y1="100" x2="400" y2="100" />
                      <line x1="0" y1="150" x2="400" y2="150" />
                      <line x1="0" y1="200" x2="400" y2="200" />
                      <line x1="0" y1="250" x2="400" y2="250" />
                      <line x1="100" y1="0" x2="100" y2="300" />
                      <line x1="200" y1="0" x2="200" y2="300" />
                      <line x1="300" y1="0" x2="300" y2="300" />
                    </g>

                    {/* Mountain silhouette */}
                    <path d="M-20 280 L90 170 L180 230 L270 140 L370 240 L420 200 L420 300 L-20 300 Z" fill="#131926" />
                    
                    {/* Neon Glowing Sun / Portal */}
                    <circle cx="270" cy="130" r="48" fill="url(#sunGrad)" />
                    <circle cx="270" cy="130" r="48" stroke="#EC4899" strokeWidth="3" opacity="0.8" />
                    
                    {/* Dynamic Gestural Neon Strokes */}
                    <path d="M40 240 C110 180, 140 100, 240 70 C310 50, 360 90, 380 130" stroke="url(#neonGrad1)" strokeWidth="6" strokeLinecap="round" filter="drop-shadow(0 0 12px #06B6D4)" />
                    
                    <path d="M60 260 C130 210, 200 180, 290 190 C340 200, 370 230, 390 250" stroke="url(#neonGrad2)" strokeWidth="4" strokeLinecap="round" opacity="0.85" filter="drop-shadow(0 0 10px #EC4899)" />

                    {/* Expressive Cross-Hatching on foreground sphere */}
                    <g opacity="0.85">
                      <circle cx="110" cy="150" r="38" fill="#161D2D" stroke="#8B5CF6" strokeWidth="2.5" />
                      <line x1="90" y1="135" x2="135" y2="145" stroke="#38BDF8" strokeWidth="1.5" />
                      <line x1="85" y1="145" x2="135" y2="155" stroke="#38BDF8" strokeWidth="1.5" />
                      <line x1="85" y1="155" x2="130" y2="165" stroke="#38BDF8" strokeWidth="1.5" />
                      <line x1="90" y1="165" x2="125" y2="175" stroke="#38BDF8" strokeWidth="1.5" />
                      {/* Cross */}
                      <line x1="95" y1="140" x2="125" y2="170" stroke="#EC4899" strokeWidth="1.5" />
                      <line x1="105" y1="135" x2="130" y2="160" stroke="#EC4899" strokeWidth="1.5" />
                    </g>

                    {/* Ink Splatter / Stippling dots */}
                    <circle cx="160" cy="120" r="2" fill="#06B6D4" />
                    <circle cx="168" cy="115" r="3" fill="#EC4899" />
                    <circle cx="178" cy="126" r="1.5" fill="#FBBF24" />
                    <circle cx="190" cy="118" r="2.5" fill="#8B5CF6" />
                    <circle cx="210" cy="108" r="1.5" fill="#10B981" />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                      <linearGradient id="neonGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                      <linearGradient id="neonGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F97316" />
                        <stop offset="50%" stopColor="#FBBF24" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Surface tag indicator */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-dark-900/90 border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5 text-[11px] text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-brand-cyan"></span>
                    <span>Paper Physics Active</span>
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-[10px] font-bold text-brand-purple">
                    Made with The Pad
                  </div>
                </div>

                {/* Card footer details */}
                <div className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">Neon Twilight Study</p>
                    <p className="text-slate-400 text-[11px]">Pen, Marker &amp; Rough Sketch tool</p>
                  </div>
                  <button
                    onClick={() => onSelectTab('pad')}
                    className="px-3 py-1.5 rounded-lg bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple font-semibold text-xs border border-brand-purple/30 transition-colors"
                  >
                    Open Canvas
                  </button>
                </div>
              </div>

              {/* Floating Picture Card 1: Stippling & Inking */}
              <div className="hidden sm:flex absolute -bottom-6 -left-8 p-3 rounded-xl bg-dark-850/95 border border-slate-700 shadow-xl backdrop-blur-md items-center gap-3 animate-float-slow">
                <div className="w-10 h-10 rounded-lg bg-dark-900 border border-slate-700 flex items-center justify-center text-xl">
                  ✒️
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Inking &amp; Stippling</p>
                  <p className="text-[11px] text-brand-cyan">Discover Technique #3</p>
                </div>
              </div>

              {/* Floating Picture Card 2: Streak celebration */}
              <div className="hidden sm:flex absolute -top-5 -right-6 p-2.5 rounded-xl bg-dark-850/95 border border-slate-700 shadow-xl backdrop-blur-md items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-brand-orange" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Daily Drawing Streak</p>
                  <p className="text-[10px] text-slate-400">Join 1,200+ active artists</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Surface Physics Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-dark-850/70 border border-slate-800 backdrop-blur-md space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Three Revolutionary Drawing Surfaces
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Unlike normal drawing apps that only simulate rigid pixels, SketchDraw dynamically adjusts brush resistance, bleeding, and grain based on your selected surface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Surface 1: Whiteboard */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 hover:border-brand-cyan/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center border border-brand-cyan/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Whiteboard</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Smooth</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero friction, crisp vector-like edges, and an optional architectural alignment grid. Perfect for rapid mind maps, diagramming, and bold clean inking.
              </p>
              <div className="pt-2 text-[11px] text-brand-cyan font-medium flex items-center gap-1">
                <span>Physics: Zero drag, crisp lines</span>
              </div>
            </div>

            {/* Surface 2: Paper */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-brand-purple/40 shadow-lg shadow-brand-purple/10 space-y-3 group relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple text-[9px] font-bold uppercase tracking-wider">
                Signature Feature
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purple flex items-center justify-center border border-brand-purple/30 group-hover:scale-105 transition-transform">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Paper with Physics</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple">Organic</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transforms your board into authentic woven paper. Experience subtle cellulose grain, velocity-based ink absorption, and organic feathering along the stroke edges.
              </p>
              <div className="pt-2 text-[11px] text-brand-purple font-medium flex items-center gap-1">
                <span>Physics: Ink bleed &amp; velocity absorption</span>
              </div>
            </div>

            {/* Surface 3: Sketch */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 hover:border-brand-orange/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center border border-brand-orange/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Sketch Canvas</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Heavy Tooth</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Heavy tooth textured sketchbook paper. Generates realistic charcoal dust, graphite chatter particles, and fractured rough strokes that catch on the paper ridges.
              </p>
              <div className="pt-2 text-[11px] text-brand-orange font-medium flex items-center gap-1">
                <span>Physics: Graphite drag &amp; charcoal scatter</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* EXPLORE SECTION (AT THE BOTTOM OF HOMEPAGE) */}
      {/* "and at the bottom, it says explore, and you can choose what you want, from: Discover, The Pad, Streak" */}
      <section id="explore-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-purple uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Jump Into The Creative Universe</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
                Explore SketchDraw
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Choose your destination below. You can also use the navigation tabs at the top of the page to switch between scenarios at any time without scrolling down!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Instance 1: Discover */}
            <div 
              onClick={() => onSelectTab('discover')}
              className="p-6 rounded-2xl bg-dark-850 border border-slate-800 hover:border-brand-cyan/50 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center border border-brand-cyan/30 group-hover:scale-110 group-hover:bg-brand-cyan group-hover:text-dark-900 transition-all shadow-lg shadow-brand-cyan/10">
                    <Compass className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                    Instance 1
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-cyan transition-colors font-display">
                    Discover
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    A comprehensive library full of different drawing techniques: from dynamic gesture sketching, coloring &amp; blending, cross-hatching, stippling, to perspective and chiaroscuro.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
                    <span>Interactive step-by-step masterclasses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
                    <span>1-Click "Try in The Pad" presets</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-dark-800 group-hover:bg-brand-cyan group-hover:text-dark-900 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Discover Library</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Instance 2: The Pad */}
            <div 
              onClick={() => onSelectTab('pad')}
              className="p-6 rounded-2xl bg-gradient-to-b from-dark-850 via-dark-850 to-brand-purple/10 border border-brand-purple/40 hover:border-brand-purple shadow-xl shadow-brand-purple/10 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-pink to-brand-purple text-white flex items-center justify-center shadow-lg shadow-brand-purple/30 group-hover:scale-110 transition-all">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                    Instance 2
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-purple transition-colors font-display">
                    The Pad
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    A full-on digital sketchpad like a normal whiteboard app, but with selectable drawing surfaces: Whiteboard, Paper with physics, and Sketch. Includes pen, pencil, marker, rough sketch, shapes, flood fill, and custom vibrant colors.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                    <span>Whiteboard, Paper &amp; Sketch surfaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                    <span>High-resolution PNG / SVG exports</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-purple text-white font-semibold text-xs shadow-md shadow-brand-purple/25 group-hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <span>Launch The Pad</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Scenario 3: The Streak */}
            <div 
              onClick={() => {
                if (user) onSelectTab('streak');
                else onOpenAuth();
              }}
              className="p-6 rounded-2xl bg-dark-850 border border-slate-800 hover:border-brand-orange/50 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center border border-brand-orange/30 group-hover:scale-110 group-hover:bg-brand-orange group-hover:text-dark-900 transition-all shadow-lg shadow-brand-orange/10">
                    <Flame className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                    Scenario 3
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-orange transition-colors font-display">
                    The Streak
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Track your daily drawing consistency! Appears once signed in, showing how many days you've drawn, activity heatmaps, daily prompt challenges, and a leaderboard with top streaks.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                    <span>Daily drawing flame counter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                    <span>Global streak leaderboard &amp; rankings</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-dark-800 group-hover:bg-brand-orange group-hover:text-dark-900 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>{user ? 'View The Streak' : 'Sign In for The Streak'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
};
