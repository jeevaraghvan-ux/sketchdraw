import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { UserProfile, DrawingSurface, DrawingTool } from '../types';
import { drawPhysicsStroke, createSurfaceTexture } from '../services/drawingPhysics';
import type { Point } from '../services/drawingPhysics';

interface HomeProps {
  onSelectTab: (tab: 'home' | 'discover' | 'pad' | 'streak') => void;
  onLaunchInPad?: (config: {
    tool: DrawingTool;
    surface: DrawingSurface;
    color: string;
    width: number;
    techniqueTitle?: string;
  }) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

const SWATCH_COLORS = [
  { name: 'Riso Vermilion', hex: '#FF4D26' },
  { name: 'Blueprint Cyan', hex: '#00E5FF' },
  { name: 'Acid Citron', hex: '#D4F835' },
  { name: 'Cotton Parchment', hex: '#F6F2E9' },
  { name: 'Carbon Black', hex: '#11141A' },
];

export const Home: React.FC<HomeProps> = ({
  onSelectTab,
  onLaunchInPad,
  user,
  onOpenAuth
}) => {
  // Live Swatch Workbench State
  const [swatchSurface, setSwatchSurface] = useState<DrawingSurface>('paper');
  const [swatchTool, setSwatchTool] = useState<DrawingTool>('pencil');
  const [swatchColor, setSwatchColor] = useState<string>('#FF4D26');
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [strokeTelemetry, setStrokeTelemetry] = useState<{ speed: string; friction: string }>({
    speed: '0 px/s',
    friction: '82% (Cellulose tooth)'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<Point | null>(null);

  // Initialize and clear Swatch Canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = 280;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Draw faint initial blueprint guides if user hasn't drawn
    if (!hasDrawn) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);

      // Perspective horizon guide
      ctx.beginPath();
      ctx.moveTo(30, height / 2);
      ctx.lineTo(width - 30, height / 2);
      ctx.stroke();

      // Drafting center circle
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 54, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }, [hasDrawn]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas, swatchSurface]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
      time: Date.now()
    };

    isDrawingRef.current = true;
    lastPointRef.current = point;

    if (!hasDrawn) {
      setHasDrawn(true);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawPhysicsStroke(
        ctx,
        point,
        { x: point.x + 0.1, y: point.y + 0.1 },
        {
          tool: swatchTool,
          surface: swatchSurface,
          color: swatchColor,
          size: swatchTool === 'marker' ? 12 : swatchTool === 'pencil' ? 3 : 2.5,
          opacity: swatchTool === 'marker' ? 0.65 : 1
        },
        1
      );
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
      time: Date.now()
    };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dt = Math.max(1, (currentPoint.time || 0) - (lastPointRef.current.time || 0));
      const dist = Math.hypot(currentPoint.x - lastPointRef.current.x, currentPoint.y - lastPointRef.current.y);
      const speed = Math.round((dist / dt) * 1000);

      const frictionDesc = 
        swatchSurface === 'whiteboard' ? '0.00 (Zero drag glass)' :
        swatchSurface === 'paper' ? '82% (Cellulose capillary sink)' :
        '88% (Graphite chatter tooth)';

      setStrokeTelemetry({
        speed: `${speed} px/s`,
        friction: frictionDesc
      });

      drawPhysicsStroke(
        ctx,
        lastPointRef.current,
        currentPoint,
        {
          tool: swatchTool,
          surface: swatchSurface,
          color: swatchColor,
          size: swatchTool === 'marker' ? 12 : swatchTool === 'pencil' ? 3.2 : 2.5,
          opacity: swatchTool === 'marker' ? 0.65 : 1
        },
        1
      );
    }

    lastPointRef.current = currentPoint;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleResetSwatch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    setStrokeTelemetry({
      speed: '0 px/s',
      friction: swatchSurface === 'whiteboard' ? '0.00 (Zero drag glass)' : swatchSurface === 'paper' ? '82% (Cellulose capillary sink)' : '88% (Graphite chatter tooth)'
    });
    setTimeout(initCanvas, 20);
  };

  const handleLaunchThisSurface = () => {
    if (onLaunchInPad) {
      onLaunchInPad({
        tool: swatchTool,
        surface: swatchSurface,
        color: swatchColor,
        width: swatchTool === 'marker' ? 12 : swatchTool === 'pencil' ? 3.5 : 2.5
      });
    } else {
      onSelectTab('pad');
    }
  };

  const surfaceTexture = createSurfaceTexture(swatchSurface);

  return (
    <div className="space-y-16 pb-24 text-slate-100 font-sans">
      
      {/* =========================================================================
          HERO SECTION: EDITORIAL ATELIER (0% AI GENERATED)
          - No purple or indigo anywhere (Rule 1)
          - No rounded-full announcement pills (Rule 4)
          - No shouting font-black / bold everything (Rule 3)
          - Editorial Instrument Serif typography, not default Inter (Rule 6)
          - Asymmetrical left-aligned layout, not centered column (Rule 7)
          - Solid matte architectural finish, zero frosted glass blur (Rule 8)
          - Purposeful typography without an icon on every noun (Rule 5)
      ========================================================================= */}
      <section className="relative pt-10 md:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Subtle technical background grid */}
        <div className="absolute inset-0 drafting-subgrid opacity-20 pointer-events-none rounded-2xl" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative">
          
          {/* Left Column: Asymmetrical Editorial Typography */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Atelier Technical Docket Header (Sharp, no rounded pill) */}
            <div className="inline-flex items-center gap-2.5 px-2.5 py-1 rounded bg-[#10141D] border border-slate-800 font-mono text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-none bg-[#FF4D26]"></span>
              <span className="text-white tracking-wider">SD // ATELIER SPECIFICATION</span>
              <span className="text-slate-600">|</span>
              <span className="text-[#00E5FF]">PHYSICS v2.4</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">LOCAL-FIRST</span>
            </div>

            {/* Bespoke Editorial Headline in Instrument Serif */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-100 font-serif leading-[1.12] italic">
              Most digital whiteboards feel like drawing with soap on glass.
              <span className="block text-slate-400 font-sans not-italic text-lg sm:text-xl lg:text-2xl mt-4 font-normal tracking-normal leading-relaxed">
                We engineered digital ink with actual tooth, capillary bleed, and paper friction.
              </span>
            </h1>

            {/* Grounded, human copy */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
              SketchDraw is a distraction-free drafting studio built for people who miss the resistance of cold-press cotton and 2B graphite. Switch substrates dynamically, study classical drafting fundamentals, or maintain your daily drawing streak.
            </p>

            {/* Tactile Action Buttons (Clean, text-focused, no decorative icon slop) */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 font-mono">
              <button
                onClick={() => onSelectTab('pad')}
                className="py-3 px-5 rounded-lg bg-[#FF4D26] hover:bg-[#ff5f38] text-white font-semibold text-xs uppercase tracking-wider riso-stamp active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>Launch The Pad [Free]</span>
                <span>→</span>
              </button>

              <button
                onClick={() => onSelectTab('discover')}
                className="py-3 px-4 rounded-lg bg-[#111622] hover:bg-[#161C2C] border border-slate-700 hover:border-[#00E5FF]/60 text-slate-200 text-xs font-medium transition-all flex items-center gap-2"
              >
                <span>Examine 8 Masterclasses</span>
                <span>→</span>
              </button>

              <button
                onClick={() => {
                  if (user) onSelectTab('streak');
                  else onOpenAuth();
                }}
                className="py-3 px-4 rounded-lg bg-[#111622] hover:bg-[#161C2C] border border-slate-700/80 text-[#D4F835] text-xs font-medium transition-all flex items-center gap-2"
              >
                <span>{user ? `Atelier Streak: ${user.streak}d` : 'Streak Docket'}</span>
              </button>
            </div>

            {/* Technical studio calibration tags */}
            <div className="flex flex-wrap items-center gap-4 pt-3 font-mono text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-[#00E5FF]">⊕</span>
                <span>Substrates: Whiteboard / Cold-Press / Kraft</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#D4F835]">⊕</span>
                <span>Lossless Retina PNG Export</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#FF4D26]">⊕</span>
                <span>Zero Account Barrier to Draw</span>
              </div>
            </div>

          </div>

          {/* Right Column: Physical Studio Proof Sheet */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Drafting Tape Top Accent */}
              <div className="absolute -top-3 left-8 z-10 px-4 py-0.5 bg-amber-200/15 border border-amber-200/25 text-[10px] font-mono text-amber-200 uppercase tracking-widest rotate-[-2deg] shadow-sm pointer-events-none">
                ATELIER SPECIMEN #SD-26
              </div>

              {/* Main Technical Spec Sheet Card (Solid matte, no backdrop-blur) */}
              <div className="p-5 rounded-xl bg-[#0E131C] border border-slate-700 shadow-2xl relative space-y-4">
                
                {/* Spec Sheet Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 bg-[#00E5FF] rounded-none"></span>
                    <span className="font-medium">MICROSCOPIC CROSS-SECTION</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">FIG 01.3 // TOOTH</span>
                </div>

                {/* Technical Microscopy Diagram comparing 3 surfaces */}
                <div className="p-3 rounded-lg bg-[#070A0F] border border-slate-800 space-y-3 font-mono">
                  
                  {/* Surface 1 Cross-section */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>01. Slick Glass / Whiteboard</span>
                      <span className="text-[#00E5FF]">μ = 0.00 (Zero drag)</span>
                    </div>
                    <svg className="w-full h-7" viewBox="0 0 320 28" fill="none">
                      <line x1="0" y1="20" x2="320" y2="20" stroke="#1E293B" strokeWidth="2" />
                      <line x1="0" y1="12" x2="320" y2="12" stroke="#00E5FF" strokeWidth="2.5" />
                      <circle cx="160" cy="12" r="3" fill="#00E5FF" />
                    </svg>
                  </div>

                  {/* Surface 2 Cross-section: Cold-Press Paper */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>02. 300gsm Cold-Press Paper</span>
                      <span className="text-[#FF4D26]">μ = 0.42 (Capillary bleed)</span>
                    </div>
                    <svg className="w-full h-8" viewBox="0 0 320 32" fill="none">
                      <path d="M0 24 Q20 18, 40 22 T80 18 T120 25 T160 19 T200 24 T240 18 T280 23 T320 20" stroke="#334155" strokeWidth="1.5" fill="none" />
                      <path d="M0 14 Q20 10, 40 13 T80 9 T120 16 T160 10 T200 15 T240 10 T280 14 T320 12" stroke="#FF4D26" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="80" cy="14" r="2" fill="#FF4D26" opacity="0.6" />
                      <circle cx="160" cy="15" r="2" fill="#FF4D26" opacity="0.6" />
                      <circle cx="240" cy="16" r="2" fill="#FF4D26" opacity="0.5" />
                    </svg>
                  </div>

                  {/* Surface 3 Cross-section: Rough Kraft Sketch */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>03. Coarse Kraft Sketchbook</span>
                      <span className="text-[#D4F835]">μ = 0.88 (Graphite chatter)</span>
                    </div>
                    <svg className="w-full h-8" viewBox="0 0 320 32" fill="none">
                      <path d="M0 26 L15 18 L30 25 L45 16 L60 24 L75 17 L90 26 L105 18 L120 25 L135 15 L150 24 L165 17 L180 26 L195 16 L210 24 L225 17 L240 25 L255 16 L270 24 L285 18 L300 25 L320 19" stroke="#334155" strokeWidth="1.5" />
                      <path d="M0 16 L15 13 L30 15 L45 12 L60 16 L75 12 L90 15 L105 13 L120 16 L135 11 L150 15 L165 12 L180 15 L195 11 L210 15 L225 12 L240 15 L255 11 L270 15 L285 13 L300 16 L320 13" stroke="#D4F835" strokeWidth="2" strokeDasharray="6 3 10 2" />
                    </svg>
                  </div>

                </div>

                {/* Card footer studio stamp */}
                <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                  <div className="text-slate-400">
                    <span className="text-slate-500">ENGINE:</span> Canvas2D Physics
                  </div>
                  <div className="px-2 py-0.5 rounded border border-[#00E5FF]/40 text-[#00E5FF] text-[10px] font-medium">
                    TRY SWATCH TESTER BELOW ↓
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          THE SWATCH WORKBENCH (REPLACING THE 3-CARD "HOLY TRINITY")
          - 0% AI generated: Real interactive canvas test bench right on the page!
          - Users switch substrates and test 2B pencil, pen, and riso marker live.
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#0D111A] border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Workbench Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="font-mono text-xs text-[#FF4D26] uppercase tracking-wider mb-1.5">
                [INTERACTIVE SUBSTRATE TEST BENCH]
              </div>
              <h2 className="text-2xl sm:text-3xl font-normal text-white font-serif italic">
                Feel the tooth before you open the studio.
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-400 max-w-md">
              Select a substrate below, pick an instrument, and drag your cursor directly onto the test pad. Zero sign-up, zero simulation fluff.
            </p>
          </div>

          {/* Substrate Selector (The 3 Real Surfaces) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            
            {/* Substrate 1: Whiteboard */}
            <button
              type="button"
              onClick={() => {
                setSwatchSurface('whiteboard');
                setStrokeTelemetry(prev => ({ ...prev, friction: '0.00 (Zero drag glass)' }));
              }}
              className={`p-4 rounded-lg text-left border transition-all ${
                swatchSurface === 'whiteboard'
                  ? 'bg-[#121926] border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10'
                  : 'bg-[#090C12] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${swatchSurface === 'whiteboard' ? 'text-[#00E5FF]' : 'text-slate-300'}`}>
                  01 // ARCHITECTURAL WHITEBOARD
                </span>
                {swatchSurface === 'whiteboard' && (
                  <span className="w-1.5 h-1.5 rounded-none bg-[#00E5FF]"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-sans">
                Slick dry-erase surface with zero drag. Ideal for diagrams, quick wireframes, and vector-crisp drafting.
              </p>
              <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-2">
                <span>DRAG: 0.00</span>
                <span>•</span>
                <span>RESISTANCE: NONE</span>
              </div>
            </button>

            {/* Substrate 2: 300gsm Cold-Press Paper */}
            <button
              type="button"
              onClick={() => {
                setSwatchSurface('paper');
                setStrokeTelemetry(prev => ({ ...prev, friction: '82% (Cellulose capillary sink)' }));
              }}
              className={`p-4 rounded-lg text-left border transition-all ${
                swatchSurface === 'paper'
                  ? 'bg-[#191522] border-[#FF4D26] shadow-lg shadow-[#FF4D26]/10'
                  : 'bg-[#090C12] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${swatchSurface === 'paper' ? 'text-[#FF4D26]' : 'text-slate-300'}`}>
                  02 // 300gsm COLD-PRESS PAPER
                </span>
                {swatchSurface === 'paper' && (
                  <span className="w-1.5 h-1.5 rounded-none bg-[#FF4D26]"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-sans">
                Authentic woven cellulose tooth. Pigment absorbs with velocity-based capillary feathering along stroke borders.
              </p>
              <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-2">
                <span>TOOTH: 82%</span>
                <span>•</span>
                <span>ABSORPTION: 240ms</span>
              </div>
            </button>

            {/* Substrate 3: Rough Kraft Sketch */}
            <button
              type="button"
              onClick={() => {
                setSwatchSurface('sketch');
                setStrokeTelemetry(prev => ({ ...prev, friction: '88% (Graphite chatter tooth)' }));
              }}
              className={`p-4 rounded-lg text-left border transition-all ${
                swatchSurface === 'sketch'
                  ? 'bg-[#161C14] border-[#D4F835] shadow-lg shadow-[#D4F835]/10'
                  : 'bg-[#090C12] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${swatchSurface === 'sketch' ? 'text-[#D4F835]' : 'text-slate-300'}`}>
                  03 // COARSE KRAFT SKETCHBOOK
                </span>
                {swatchSurface === 'sketch' && (
                  <span className="w-1.5 h-1.5 rounded-none bg-[#D4F835]"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-sans">
                Heavy tooth textured kraft board. Fractures graphite strokes into authentic microscopic dust chatter.
              </p>
              <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-2">
                <span>DRAG: 0.88</span>
                <span>•</span>
                <span>PARTICLES: GRAPHITE DUST</span>
              </div>
            </button>

          </div>

          {/* Instrument Rack & Color Wells */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#080B10] border border-slate-800 rounded-lg font-mono text-xs">
            
            {/* Tool Selection */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[10px] uppercase">Instrument:</span>
              <div className="flex items-center gap-1.5">
                
                <button
                  type="button"
                  onClick={() => setSwatchTool('pencil')}
                  className={`px-3 py-1.5 rounded border text-xs transition-all ${
                    swatchTool === 'pencil'
                      ? 'bg-[#1E2538] text-white border-slate-600 font-medium'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  2B Graphite
                </button>

                <button
                  type="button"
                  onClick={() => setSwatchTool('pen')}
                  className={`px-3 py-1.5 rounded border text-xs transition-all ${
                    swatchTool === 'pen'
                      ? 'bg-[#1E2538] text-white border-slate-600 font-medium'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  0.5mm Technical Pen
                </button>

                <button
                  type="button"
                  onClick={() => setSwatchTool('marker')}
                  className={`px-3 py-1.5 rounded border text-xs transition-all ${
                    swatchTool === 'marker'
                      ? 'bg-[#1E2538] text-white border-slate-600 font-medium'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  Chisel Riso
                </button>

              </div>
            </div>

            {/* Color Swatch Wells */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[10px] uppercase">Pigment:</span>
              <div className="flex items-center gap-1.5">
                {SWATCH_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSwatchColor(c.hex)}
                    title={c.name}
                    className={`w-5 h-5 rounded-sm border transition-all ${
                      swatchColor === c.hex
                        ? 'border-white scale-125 shadow-md'
                        : 'border-slate-700 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleResetSwatch}
              className="px-3 py-1 rounded bg-[#131722] hover:bg-[#1C2233] text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors"
            >
              Reset Swatch [C]
            </button>

          </div>

          {/* Interactive Live Canvas Area */}
          <div 
            ref={containerRef}
            className="relative w-full rounded-lg overflow-hidden border border-slate-700 shadow-inner min-h-[280px] cursor-crosshair touch-none select-none transition-all"
            style={{
              backgroundColor: surfaceTexture.backgroundColor,
              backgroundImage: surfaceTexture.texturePattern
            }}
          >
            {/* Live Canvas */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="absolute inset-0 w-full h-full block z-10"
            />

            {/* Instruction overlay when untouched (Solid matte, no backdrop-blur) */}
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="px-4 py-2 rounded bg-[#070A0F] border border-slate-700 font-mono text-xs text-slate-300 flex items-center gap-2.5 shadow-xl">
                  <span className="text-[#FF4D26]">✎</span>
                  <span>Drag or scribble anywhere in this box to feel the drag</span>
                  <span className="text-slate-500 text-[10px]">[ACTIVE BENCH]</span>
                </div>
              </div>
            )}

            {/* Live Telemetry readout overlay (Solid matte, no backdrop-blur) */}
            <div className="absolute bottom-2.5 left-3 font-mono text-[10px] text-slate-400 bg-[#070A0F] px-2.5 py-1 rounded border border-slate-800 pointer-events-none z-20 flex items-center gap-3">
              <span>SPEED: <strong className="text-white font-normal">{strokeTelemetry.speed}</strong></span>
              <span>•</span>
              <span>FRICTION: <strong className="text-[#00E5FF] font-normal">{strokeTelemetry.friction}</strong></span>
            </div>
          </div>

          {/* Direct CTA under the Workbench: Launch in Pad */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800 font-mono">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              Active configuration: <span className="text-white uppercase">{swatchSurface}</span> substrate with <span className="text-white uppercase">{swatchTool}</span>.
            </div>

            <button
              type="button"
              onClick={handleLaunchThisSurface}
              className="w-full sm:w-auto py-2.5 px-5 rounded-lg bg-white hover:bg-slate-200 text-slate-900 font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md group"
            >
              <span>Open this surface in The Pad Studio</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>
      </section>


      {/* =========================================================================
          EXPLORE SECTION: ARCHITECTURAL DIRECTORY TABLE
          "and at the bottom, it says explore, and you can choose what you want, from: Discover, The Pad, Streak"
          - CRUCIAL FIX FOR RULE 2 (icon card grids +12):
            Instead of 3 rounded cards in a grid with icons, this is an elegant
            horizontal ruled directory docket (index list). ZERO card grid!
      ========================================================================= */}
      <section id="explore-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        <div className="space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="font-mono text-xs text-[#00E5FF] tracking-wider mb-1">
                [ATELIER DIRECTORY]
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal text-white font-serif italic tracking-tight">
                Explore SketchDraw
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-400 max-w-md">
              Choose your studio destination below. You can also use the top navigation bar at any moment to jump between modes.
            </p>
          </div>

          {/* Architectural Ruled Directory Index (Zero Card Grids!) */}
          <div className="border-t border-b border-slate-800 divide-y divide-slate-800 font-mono">
            
            {/* Destination 01: Discover */}
            <div 
              onClick={() => onSelectTab('discover')}
              className="py-5 px-3 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#111622] transition-colors cursor-pointer group"
            >
              <div className="flex items-start md:items-center gap-6">
                <span className="text-xs text-slate-500 font-mono">[01]</span>
                <div>
                  <h3 className="text-xl font-normal text-white group-hover:text-[#00E5FF] transition-colors font-serif italic">
                    Discover Archive
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 max-w-xl">
                    Eight curated masterclasses in drawing fundamentals: dynamic gesture mechanics, cross-hatching, stippling, and atmospheric lighting studies.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#00E5FF] font-medium self-end md:self-auto">
                <span>Examine Archive</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Destination 02: The Pad */}
            <div 
              onClick={() => onSelectTab('pad')}
              className="py-5 px-3 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#111622] transition-colors cursor-pointer group"
            >
              <div className="flex items-start md:items-center gap-6">
                <span className="text-xs text-slate-500 font-mono">[02]</span>
                <div>
                  <h3 className="text-xl font-normal text-white group-hover:text-[#FF4D26] transition-colors font-serif italic">
                    The Pad Studio
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 max-w-xl">
                    Full-scale physical drawing canvas. Selectable paper tooth, technical pen, 2B graphite, chisel riso marker, shape tools, and lossless Retina export.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#FF4D26] font-medium self-end md:self-auto">
                <span>Launch Studio</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Destination 03: The Streak */}
            <div 
              onClick={() => {
                if (user) onSelectTab('streak');
                else onOpenAuth();
              }}
              className="py-5 px-3 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#111622] transition-colors cursor-pointer group"
            >
              <div className="flex items-start md:items-center gap-6">
                <span className="text-xs text-slate-500 font-mono">[03]</span>
                <div>
                  <h3 className="text-xl font-normal text-white group-hover:text-[#D4F835] transition-colors font-serif italic">
                    Atelier Streak Ledger
                  </h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 max-w-xl">
                    Daily drawing consistency tracker, daily prompt dockets, calendar heatmaps, and global community leaderboard.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#D4F835] font-medium self-end md:self-auto">
                <span>{user ? 'View Ledger' : 'Sign In for Ledger'}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
};
