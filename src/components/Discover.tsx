import React, { useState } from 'react';
import { 
  Compass, Search, BookOpen, Clock, ArrowRight, 
  CheckCircle2, Lightbulb, PenTool, X 
} from 'lucide-react';
import type { Technique, DrawingTool, DrawingSurface } from '../types';
import { TECHNIQUES_DATA } from '../data/techniques';

interface DiscoverProps {
  onLaunchInPad: (config: {
    tool: DrawingTool;
    surface: DrawingSurface;
    color: string;
    width: number;
    techniqueTitle?: string;
  }) => void;
}

export const Discover: React.FC<DiscoverProps> = ({ onLaunchInPad }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalTechnique, setActiveModalTechnique] = useState<Technique | null>(null);

  const categories = ['All', 'Fundamentals', 'Shading & Texture', 'Color & Inking', 'Styles'];

  const filteredTechniques = TECHNIQUES_DATA.filter((tech) => {
    const matchesCategory = selectedCategory === 'All' || tech.category === selectedCategory;
    const matchesSearch = 
      tech.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'Intermediate': return 'text-brand-cyan bg-brand-cyan/15 border-brand-cyan/30';
      case 'Advanced': return 'text-brand-pink bg-brand-pink/15 border-brand-pink/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-xs font-semibold text-brand-cyan">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Technique Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
            Master the Craft of Digital Art
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Explore curated techniques from gesture sketching and cross-hatching to alcohol marker blending and chiaroscuro. Click any technique to read pro steps or practice directly on <strong>The Pad</strong>.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sketching, inking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-brand-cyan text-dark-900 shadow-md shadow-brand-cyan/25'
                : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Technique Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechniques.map((tech) => (
          <div
            key={tech.id}
            className="p-5 rounded-2xl bg-dark-850 border border-slate-800 hover:border-slate-700 hover:bg-dark-800/80 transition-all duration-200 shadow-xl flex flex-col justify-between group"
          >
            <div className="space-y-4">
              
              {/* Illustration Header */}
              <div 
                onClick={() => setActiveModalTechnique(tech)}
                className="relative rounded-xl overflow-hidden aspect-[16/9] bg-dark-900 border border-slate-800 flex items-center justify-center cursor-pointer group-hover:border-brand-cyan/40 transition-colors"
              >
                <TechniqueIllustration type={tech.illustrationType} color={tech.recommendedColor} />
                
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getDifficultyColor(tech.difficulty)}`}>
                    {tech.difficulty}
                  </span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-dark-950/80 text-[10px] text-slate-300 flex items-center gap-1 backdrop-blur-sm border border-slate-800">
                  <Clock className="w-3 h-3 text-brand-cyan" />
                  <span>{tech.duration}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 
                  onClick={() => setActiveModalTechnique(tech)}
                  className="text-lg font-bold text-white group-hover:text-brand-cyan transition-colors cursor-pointer font-display"
                >
                  {tech.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {tech.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tech.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-dark-900 text-slate-400 border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>

            </div>

            {/* Card Actions */}
            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveModalTechnique(tech)}
                className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5 text-brand-purple" />
                <span>Read Steps</span>
              </button>

              <button
                onClick={() => onLaunchInPad({
                  tool: tech.recommendedTool,
                  surface: tech.recommendedSurface,
                  color: tech.recommendedColor,
                  width: tech.recommendedWidth,
                  techniqueTitle: tech.title
                })}
                className="py-1.5 px-3 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-dark-900 border border-brand-cyan/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Try in The Pad</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {filteredTechniques.length === 0 && (
        <div className="py-16 text-center text-slate-500 space-y-3">
          <p className="text-lg font-medium text-slate-400">No techniques found matching your search</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="text-xs text-brand-cyan underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Technique Detail Modal */}
      {activeModalTechnique && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-dark-850 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-dark-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">
                    {activeModalTechnique.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className={`px-2 py-0.2 rounded-full font-semibold border ${getDifficultyColor(activeModalTechnique.difficulty)}`}>
                      {activeModalTechnique.difficulty}
                    </span>
                    <span>•</span>
                    <span>Estimated: {activeModalTechnique.duration}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModalTechnique(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300">
              
              {/* Illustration and Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-dark-900 rounded-xl border border-slate-800">
                <div className="md:col-span-5 aspect-[16/10] rounded-lg overflow-hidden bg-dark-950 border border-slate-800 flex items-center justify-center">
                  <TechniqueIllustration type={activeModalTechnique.illustrationType} color={activeModalTechnique.recommendedColor} />
                </div>
                <div className="md:col-span-7 space-y-2.5">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeModalTechnique.description}
                  </p>
                  <div className="p-2.5 rounded-lg bg-dark-850 border border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Recommended Tool:</span>
                      <span className="text-white font-semibold uppercase">{activeModalTechnique.recommendedTool}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Recommended Surface:</span>
                      <span className="text-brand-purple font-semibold uppercase">{activeModalTechnique.recommendedSurface}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Step-by-Step Execution</span>
                </h3>
                
                <div className="space-y-2.5">
                  {activeModalTechnique.steps.map((step) => (
                    <div key={step.number} className="p-3.5 bg-dark-900 rounded-xl border border-slate-800/80 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-brand-cyan/20 text-brand-cyan font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {step.number}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white">{step.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tips */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-purple/10 to-transparent border border-brand-purple/30 space-y-2">
                <h4 className="text-xs font-bold text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-brand-yellow" />
                  <span>Pro Artist Insights</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeModalTechnique.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-brand-cyan mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-dark-800/60 flex items-center justify-between gap-4">
              <button
                onClick={() => setActiveModalTechnique(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => {
                  onLaunchInPad({
                    tool: activeModalTechnique.recommendedTool,
                    surface: activeModalTechnique.recommendedSurface,
                    color: activeModalTechnique.recommendedColor,
                    width: activeModalTechnique.recommendedWidth,
                    techniqueTitle: activeModalTechnique.title
                  });
                  setActiveModalTechnique(null);
                }}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-dark-900 hover:brightness-110 font-bold text-xs shadow-lg shadow-brand-cyan/20 transition-all flex items-center gap-2"
              >
                <PenTool className="w-4 h-4 text-dark-900" />
                <span>Open in The Pad with these Presets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

/**
 * Visual SVG illustrations for each technique
 */
const TechniqueIllustration: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  switch (type) {
    case 'gesture':
      return (
        <svg className="w-full h-full p-4" viewBox="0 0 200 120" fill="none">
          <path d="M30 90 C60 40, 100 20, 160 50 C180 60, 170 95, 140 100" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <path d="M50 100 C70 70, 110 50, 130 85" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="150" cy="40" r="14" stroke={color} strokeWidth="2" opacity="0.7" />
          <line x1="140" y1="54" x2="110" y2="90" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'hatching':
      return (
        <svg className="w-full h-full p-4" viewBox="0 0 200 120" fill="none">
          <circle cx="100" cy="60" r="38" stroke="#334155" strokeWidth="2" fill="#0F172A" />
          {/* 45 deg parallel */}
          <line x1="80" y1="45" x2="120" y2="55" stroke={color} strokeWidth="2" />
          <line x1="75" y1="55" x2="125" y2="65" stroke={color} strokeWidth="2" />
          <line x1="75" y1="65" x2="125" y2="75" stroke={color} strokeWidth="2" />
          <line x1="80" y1="75" x2="115" y2="85" stroke={color} strokeWidth="2" />
          {/* cross lines */}
          <line x1="90" y1="45" x2="110" y2="85" stroke="#EC4899" strokeWidth="2" />
          <line x1="100" y1="45" x2="120" y2="80" stroke="#EC4899" strokeWidth="2" />
        </svg>
      );
    case 'stippling':
      return (
        <svg className="w-full h-full p-4" viewBox="0 0 200 120" fill="none">
          <circle cx="60" cy="60" r="2" fill={color} />
          <circle cx="75" cy="55" r="2.5" fill={color} />
          <circle cx="85" cy="65" r="2" fill={color} />
          <circle cx="95" cy="50" r="2" fill={color} />
          <circle cx="105" cy="62" r="2.5" fill={color} />
          <circle cx="115" cy="58" r="2" fill={color} />
          {/* dense cluster */}
          <circle cx="125" cy="55" r="3" fill={color} />
          <circle cx="128" cy="62" r="2.5" fill={color} />
          <circle cx="132" cy="57" r="3" fill={color} />
          <circle cx="136" cy="65" r="2.5" fill={color} />
          <circle cx="140" cy="59" r="3.5" fill={color} />
          <circle cx="144" cy="52" r="3" fill={color} />
          <circle cx="148" cy="62" r="3" fill={color} />
          <circle cx="152" cy="57" r="3.5" fill={color} />
        </svg>
      );
    case 'blending':
      return (
        <svg className="w-full h-full p-4" viewBox="0 0 200 120" fill="none">
          <defs>
            <linearGradient id="blendG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <rect x="30" y="35" width="140" height="50" rx="12" fill="url(#blendG)" />
          <path d="M40 70 C70 45, 130 45, 160 70" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
        </svg>
      );
    case 'perspective':
      return (
        <svg className="w-full h-full p-4" viewBox="0 0 200 120" fill="none">
          <line x1="20" y1="60" x2="180" y2="60" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="30" cy="60" r="3" fill="#10B981" />
          <circle cx="170" cy="60" r="3" fill="#10B981" />
          {/* Central building vertical */}
          <line x1="100" y1="35" x2="100" y2="95" stroke="#FFFFFF" strokeWidth="2.5" />
          {/* Orthogonals */}
          <line x1="30" y1="60" x2="100" y2="35" stroke={color} strokeWidth="1.5" />
          <line x1="30" y1="60" x2="100" y2="95" stroke={color} strokeWidth="1.5" />
          <line x1="170" y1="60" x2="100" y2="35" stroke={color} strokeWidth="1.5" />
          <line x1="170" y1="60" x2="100" y2="95" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'lighting':
      return (
        <svg className="w-full h-full p-4" viewBox="0 0 200 120" fill="none">
          <circle cx="100" cy="60" r="38" fill="#111827" stroke="#374151" strokeWidth="1" />
          <path d="M100 22 A38 38 0 0 1 138 60 A38 38 0 0 1 100 98 Z" fill={color} opacity="0.75" />
          <circle cx="118" cy="45" r="10" fill="#FFFBEB" opacity="0.9" />
        </svg>
      );
    default:
      return (
        <svg className="w-full h-full p-4" viewBox="0 0 200 120" fill="none">
          <path d="M30 60 Q70 20, 100 60 T170 60" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="60" r="18" stroke={color} strokeWidth="1.5" opacity="0.6" />
        </svg>
      );
  }
};
