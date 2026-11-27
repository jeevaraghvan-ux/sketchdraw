import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  PenTool, Edit2, Highlighter, Brush, Eraser, Minus, 
  Square, Circle, ArrowUpRight, PaintBucket, Undo2, Redo2, 
  Trash2, Download, Copy, Grid, Check, Sparkles, Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DrawingSurface, DrawingTool, UserProfile } from '../types';
import { drawPhysicsStroke, floodFill, createSurfaceTexture } from '../services/drawingPhysics';
import type { Point } from '../services/drawingPhysics';
import { recordDailyDrawing } from '../services/supabase';

interface PadProps {
  initialSurface?: DrawingSurface;
  initialTool?: DrawingTool;
  initialColor?: string;
  initialWidth?: number;
  activeTechniquePrompt?: string;
  onClearTechniquePrompt?: () => void;
  user: UserProfile | null;
  onStreakUpdated: (profile: UserProfile, message: string) => void;
  onOpenAuth: () => void;
}

const COLOR_PALETTE = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Electric Cyan', hex: '#06B6D4' },
  { name: 'Neon Pink', hex: '#EC4899' },
  { name: 'Violet Dream', hex: '#8B5CF6' },
  { name: 'Sunset Orange', hex: '#F97316' },
  { name: 'Golden Amber', hex: '#FBBF24' },
  { name: 'Emerald Glow', hex: '#10B981' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Lime Acid', hex: '#84CC16' },
  { name: 'Hot Coral', hex: '#F43F5E' },
  { name: 'Cool Slate', hex: '#94A3B8' },
  { name: 'Charcoal Deep', hex: '#1E293B' },
];

export const Pad: React.FC<PadProps> = ({
  initialSurface = 'whiteboard',
  initialTool = 'pen',
  initialColor = '#06B6D4',
  initialWidth = 3,
  activeTechniquePrompt,
  onClearTechniquePrompt,
  user,
  onStreakUpdated,
  onOpenAuth
}) => {
  // Surface and Tool State
  const [surface, setSurface] = useState<DrawingSurface>(initialSurface);
  const [tool, setTool] = useState<DrawingTool>(initialTool);
  const [color, setColor] = useState<string>(initialColor);
  const [size, setSize] = useState<number>(initialWidth);
  const [opacity, setOpacity] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [customColor, setCustomColor] = useState<string>(initialColor);

  // Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Drawing state
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<Point | null>(null);
  const startShapePointRef = useRef<Point | null>(null);

  // History Undo/Redo stack
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Notifications & UI
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSavingStreak, setIsSavingStreak] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Update undo/redo buttons state
  const updateHistoryButtons = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const saveHistoryState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Discard any redos
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(imgData);

    // Limit history stack size to 25
    if (historyRef.current.length > 25) {
      historyRef.current.shift();
    }
    historyIndexRef.current = historyRef.current.length - 1;
    updateHistoryButtons();
  }, []);

  // Initialize Canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !previewCanvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.max(550, Math.floor(window.innerHeight - 200));

    // Support Retina displays
    const dpr = window.devicePixelRatio || 1;

    // Save previous drawing if canvas already has content
    let prevData: ImageData | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          prevData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch {
          // ignore
        }
      }
    }

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    previewCanvas.width = width * dpr;
    previewCanvas.height = height * dpr;
    previewCanvas.style.width = `${width}px`;
    previewCanvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    const pCtx = previewCanvas.getContext('2d');
    if (ctx && pCtx) {
      ctx.scale(dpr, dpr);
      pCtx.scale(dpr, dpr);

      if (prevData) {
        ctx.putImageData(prevData, 0, 0);
      } else {
        // First state
        saveHistoryState();
      }
    }
  }, [saveHistoryState]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // Sync external presets when navigated from Discover
  useEffect(() => {
    if (initialSurface) setSurface(initialSurface);
    if (initialTool) setTool(initialTool);
    if (initialColor) {
      setColor(initialColor);
      setCustomColor(initialColor);
    }
    if (initialWidth) setSize(initialWidth);
  }, [initialSurface, initialTool, initialColor, initialWidth]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, B, E, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
        e.preventDefault();
      } else if (e.key === 'p' || e.key === 'b') {
        setTool('pen');
      } else if (e.key === 'e') {
        setTool('eraser');
      } else if (e.key === 'm') {
        setTool('marker');
      } else if (e.key === 's') {
        setTool('sketch');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Undo / Redo logic
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const previousState = historyRef.current[historyIndexRef.current];
      ctx.putImageData(previousState, 0, 0);
      updateHistoryButtons();
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const nextState = historyRef.current[historyIndexRef.current];
      ctx.putImageData(nextState, 0, 0);
      updateHistoryButtons();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
    showToast('Canvas cleared!');
  };

  // Get pointer coordinates relative to canvas
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
      time: Date.now()
    };
  };

  // Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getCoordinates(e);

    // Flood fill tool check
    if (tool === 'fill') {
      const dpr = window.devicePixelRatio || 1;
      floodFill(ctx, point.x * dpr, point.y * dpr, color);
      saveHistoryState();
      return;
    }

    isDrawingRef.current = true;
    lastPointRef.current = point;
    startShapePointRef.current = point;

    // For brush tools, draw single dot on click
    if (['pen', 'pencil', 'marker', 'sketch', 'eraser'].includes(tool)) {
      drawPhysicsStroke(
        ctx,
        point,
        { x: point.x + 0.1, y: point.y + 0.1 },
        { tool, surface, color, size, opacity },
        1
      );
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;

    const currentPoint = getCoordinates(e);
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;

    const ctx = canvas.getContext('2d');
    const pCtx = previewCanvas.getContext('2d');
    if (!ctx || !pCtx) return;

    // Check if drawing geometric shapes
    if (['line', 'rectangle', 'circle', 'arrow'].includes(tool)) {
      // Clear preview overlay
      pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      const start = startShapePointRef.current || lastPointRef.current;
      pCtx.save();
      pCtx.strokeStyle = color;
      pCtx.fillStyle = color;
      pCtx.lineWidth = size;
      pCtx.globalAlpha = opacity;
      pCtx.lineCap = 'round';
      pCtx.lineJoin = 'round';

      if (tool === 'line') {
        pCtx.beginPath();
        pCtx.moveTo(start.x, start.y);
        pCtx.lineTo(currentPoint.x, currentPoint.y);
        pCtx.stroke();
      } else if (tool === 'rectangle') {
        const x = Math.min(start.x, currentPoint.x);
        const y = Math.min(start.y, currentPoint.y);
        const w = Math.abs(currentPoint.x - start.x);
        const h = Math.abs(currentPoint.y - start.y);
        pCtx.strokeRect(x, y, w, h);
      } else if (tool === 'circle') {
        const radius = Math.hypot(currentPoint.x - start.x, currentPoint.y - start.y);
        pCtx.beginPath();
        pCtx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        pCtx.stroke();
      } else if (tool === 'arrow') {
        // Draw line with arrowhead
        pCtx.beginPath();
        pCtx.moveTo(start.x, start.y);
        pCtx.lineTo(currentPoint.x, currentPoint.y);
        pCtx.stroke();

        const angle = Math.atan2(currentPoint.y - start.y, currentPoint.x - start.x);
        const headLength = Math.max(12, size * 3);
        pCtx.beginPath();
        pCtx.moveTo(currentPoint.x, currentPoint.y);
        pCtx.lineTo(
          currentPoint.x - headLength * Math.cos(angle - Math.PI / 6),
          currentPoint.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        pCtx.lineTo(
          currentPoint.x - headLength * Math.cos(angle + Math.PI / 6),
          currentPoint.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        pCtx.closePath();
        pCtx.fill();
      }

      pCtx.restore();
      return;
    }

    // Freehand drawing with physics
    const dist = Math.hypot(currentPoint.x - lastPointRef.current.x, currentPoint.y - lastPointRef.current.y);
    const dt = (currentPoint.time || Date.now()) - (lastPointRef.current.time || Date.now());
    const speed = dt > 0 ? (dist / dt) * 10 : 1;

    drawPhysicsStroke(
      ctx,
      lastPointRef.current,
      currentPoint,
      { tool, surface, color, size, opacity },
      speed
    );

    lastPointRef.current = currentPoint;
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;

    const ctx = canvas.getContext('2d');
    const pCtx = previewCanvas.getContext('2d');
    if (!ctx || !pCtx) return;

    // If we were drawing a shape, commit preview to main canvas
    if (['line', 'rectangle', 'circle', 'arrow'].includes(tool)) {
      ctx.drawImage(previewCanvas, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    lastPointRef.current = null;
    startShapePointRef.current = null;
    saveHistoryState();
  };

  // Log to daily streak
  const handleSaveToStreak = async () => {
    if (isSavingStreak) return;
    if (!user) {
      showToast('Sign in or create an account to save your streak!');
      onOpenAuth();
      return;
    }

    setIsSavingStreak(true);
    try {
      const artistName = user.name ? `${user.name}'s ` : '';
      const title = activeTechniquePrompt || `${artistName}Study on ${surface.toUpperCase()} surface`;
      const result = await recordDailyDrawing(title, surface);

      if (result.requiresAuth || !result.updatedProfile) {
        showToast(result.message);
        if (result.requiresAuth) onOpenAuth();
        return;
      }

      // Trigger celebratory confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#5294A6', '#B85333', '#B59A57', '#F5F2EB']
      });

      onStreakUpdated(result.updatedProfile, result.message);
      showToast(result.message);
    } finally {
      setIsSavingStreak(false);
    }
  };

  // Export functions
  const handleExportPNG = (includeBackground: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!includeBackground) {
      // Export transparent
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `SketchDraw-${Date.now()}.png`;
      a.click();
      showToast('Exported transparent PNG!');
    } else {
      // Create temporary canvas with surface background rendered
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return;

      const surfaceStyle = createSurfaceTexture(surface);
      tCtx.fillStyle = surfaceStyle.backgroundColor;
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw grid if active
      if (showGrid && surface === 'whiteboard') {
        tCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        tCtx.lineWidth = 1;
        for (let x = 0; x < tempCanvas.width; x += 30) {
          tCtx.beginPath();
          tCtx.moveTo(x, 0);
          tCtx.lineTo(x, tempCanvas.height);
          tCtx.stroke();
        }
        for (let y = 0; y < tempCanvas.height; y += 30) {
          tCtx.beginPath();
          tCtx.moveTo(0, y);
          tCtx.lineTo(tempCanvas.width, y);
          tCtx.stroke();
        }
      }

      // Draw artwork
      tCtx.drawImage(canvas, 0, 0);

      const url = tempCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `SketchDraw-${surface}-${Date.now()}.png`;
      a.click();
      showToast(`Exported PNG with ${surface} surface!`);
    }
    setShowExportMenu(false);
  };

  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Artwork copied to clipboard!');
      });
    } catch (e) {
      showToast('Clipboard copy failed. Try Exporting PNG instead.');
    }
    setShowExportMenu(false);
  };

  // Surface texture details
  const surfaceStyle = createSurfaceTexture(surface);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 animate-fadeIn">
      
      {/* Active Technique Preset Banner if navigated from Discover */}
      {activeTechniquePrompt && (
        <div className="p-3 bg-gradient-to-r from-brand-cyan/20 via-brand-purple/20 to-transparent border border-brand-cyan/40 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-slate-200">
            <Sparkles className="w-4 h-4 text-brand-cyan shrink-0" />
            <span>Practicing Technique: <strong className="text-white">{activeTechniquePrompt}</strong></span>
          </div>
          <button
            onClick={onClearTechniquePrompt}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-dark-900 border border-slate-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-dark-850/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
        
        {/* Surface Selection Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
            Surface:
          </span>
          <div className="flex p-1 bg-dark-900 rounded-xl border border-slate-800 text-xs font-semibold">
            
            <button
              onClick={() => {
                setSurface('whiteboard');
                showToast('Switched to Whiteboard: Smooth & Crisp');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                surface === 'whiteboard'
                  ? 'bg-brand-cyan text-dark-900 shadow-md shadow-brand-cyan/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Whiteboard</span>
            </button>

            <button
              onClick={() => {
                setSurface('paper');
                showToast('Paper Physics Active: Grain tooth & ink bleed absorption');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                surface === 'paper'
                  ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-md shadow-brand-purple/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Paper (Physics)</span>
            </button>

            <button
              onClick={() => {
                setSurface('sketch');
                showToast('Switched to Sketch: Charcoal tooth & graphite drag');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                surface === 'sketch'
                  ? 'bg-brand-orange text-dark-900 shadow-md shadow-brand-orange/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Sketch</span>
            </button>
          </div>
        </div>

        {/* Center: Undo, Redo, Clear, Grid */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-xl bg-dark-900 hover:bg-dark-800 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-2 rounded-xl bg-dark-900 hover:bg-dark-800 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-6 bg-slate-800 mx-1"></div>

          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Alignment Grid"
            className={`p-2 rounded-xl border transition-colors ${
              showGrid
                ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                : 'bg-dark-900 hover:bg-dark-800 border-slate-800 text-slate-400'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            title="Clear Canvas"
            className="p-2 rounded-xl bg-dark-900 hover:bg-red-500/20 hover:text-red-400 border border-slate-800 text-slate-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Save to Streak & Export */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={handleSaveToStreak}
            className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-yellow hover:brightness-110 text-dark-900 text-xs font-bold shadow-md shadow-brand-orange/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4 text-dark-900 fill-current" />
            <span>Save to Streak</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="py-1.5 px-3 rounded-xl bg-dark-900 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-brand-cyan" />
              <span>Export</span>
            </button>

            {/* Export Dropdown */}
            {showExportMenu && (
              <div 
                className="absolute right-0 mt-2 w-52 rounded-xl bg-dark-850 border border-slate-800 shadow-2xl p-1.5 z-50 animate-fadeIn"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <button
                  onClick={() => handleExportPNG(false)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-dark-800 flex items-center justify-between"
                >
                  <span>PNG (Transparent)</span>
                  <span className="text-[10px] text-slate-500">.png</span>
                </button>
                <button
                  onClick={() => handleExportPNG(true)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-dark-800 flex items-center justify-between"
                >
                  <span>PNG (with {surface})</span>
                  <span className="text-[10px] text-brand-cyan">Recommended</span>
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-dark-800 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-brand-purple" />
                  <span>Copy to Clipboard</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Main Workspace: Left Tool Bar & Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Floating Tools & Colors Panel */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Tool Palette */}
          <div className="p-4 bg-dark-850/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Drawing Tools
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple font-semibold capitalize">
                {tool} active
              </span>
            </div>

            {/* Tool grid */}
            <div className="grid grid-cols-5 gap-2">
              
              <button
                onClick={() => setTool('pen')}
                title="Pen (Gel/Smooth)"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'pen'
                    ? 'bg-brand-cyan text-dark-900 border-brand-cyan shadow-md shadow-brand-cyan/25'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span className="text-[9px] font-medium">Pen</span>
              </button>

              <button
                onClick={() => setTool('pencil')}
                title="Pencil (Graphite)"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'pencil'
                    ? 'bg-brand-cyan text-dark-900 border-brand-cyan shadow-md shadow-brand-cyan/25'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-[9px] font-medium">Pencil</span>
              </button>

              <button
                onClick={() => setTool('marker')}
                title="Marker (Chisel/Wash)"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'marker'
                    ? 'bg-brand-cyan text-dark-900 border-brand-cyan shadow-md shadow-brand-cyan/25'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <Highlighter className="w-4 h-4" />
                <span className="text-[9px] font-medium">Marker</span>
              </button>

              <button
                onClick={() => setTool('sketch')}
                title="Sketch (Charcoal)"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'sketch'
                    ? 'bg-brand-cyan text-dark-900 border-brand-cyan shadow-md shadow-brand-cyan/25'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <Brush className="w-4 h-4" />
                <span className="text-[9px] font-medium">Sketch</span>
              </button>

              <button
                onClick={() => setTool('eraser')}
                title="Eraser (E)"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'eraser'
                    ? 'bg-brand-pink text-white border-brand-pink shadow-md shadow-brand-pink/25'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span className="text-[9px] font-medium">Eraser</span>
              </button>

              {/* Shapes */}
              <button
                onClick={() => setTool('line')}
                title="Line"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'line'
                    ? 'bg-brand-purple text-white border-brand-purple shadow'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <Minus className="w-4 h-4" />
                <span className="text-[9px] font-medium">Line</span>
              </button>

              <button
                onClick={() => setTool('rectangle')}
                title="Rectangle"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'rectangle'
                    ? 'bg-brand-purple text-white border-brand-purple shadow'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <Square className="w-4 h-4" />
                <span className="text-[9px] font-medium">Rect</span>
              </button>

              <button
                onClick={() => setTool('circle')}
                title="Circle"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'circle'
                    ? 'bg-brand-purple text-white border-brand-purple shadow'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <Circle className="w-4 h-4" />
                <span className="text-[9px] font-medium">Circle</span>
              </button>

              <button
                onClick={() => setTool('arrow')}
                title="Arrow"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'arrow'
                    ? 'bg-brand-purple text-white border-brand-purple shadow'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-[9px] font-medium">Arrow</span>
              </button>

              <button
                onClick={() => setTool('fill')}
                title="Flood Fill"
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tool === 'fill'
                    ? 'bg-brand-purple text-white border-brand-purple shadow'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-slate-800'
                }`}
              >
                <PaintBucket className="w-4 h-4" />
                <span className="text-[9px] font-medium">Fill</span>
              </button>

            </div>

            {/* Stroke Width Slider with Dynamic Tip Preview */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Stroke Size</span>
                <span className="text-brand-cyan font-mono">{size}px</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="48"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-brand-cyan h-1.5 bg-dark-900 rounded-lg cursor-pointer"
                />
                {/* Visual tip size dot */}
                <div 
                  className="w-7 h-7 rounded-lg bg-dark-900 border border-slate-800 flex items-center justify-center shrink-0"
                >
                  <div
                    className="rounded-full transition-all"
                    style={{
                      width: Math.min(22, Math.max(2, size)),
                      height: Math.min(22, Math.max(2, size)),
                      backgroundColor: color,
                      opacity: opacity
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Opacity</span>
                <span className="text-brand-purple font-mono">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-brand-purple h-1.5 bg-dark-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vibrant Color Swatches */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Color Palette</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-slate-400 font-mono">{color.toUpperCase()}</span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      setColor(c.hex);
                      setCustomColor(c.hex);
                    }}
                    title={c.name}
                    className={`w-full aspect-square rounded-lg transition-transform relative flex items-center justify-center ${
                      color.toLowerCase() === c.hex.toLowerCase()
                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-dark-850 shadow-md'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {color.toLowerCase() === c.hex.toLowerCase() && (
                      <Check className={`w-3 h-3 ${c.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-2 pt-1">
                <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer">
                  <span>Custom:</span>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setColor(e.target.value);
                    }}
                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer p-0"
                  />
                </label>
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                      setColor(e.target.value);
                    }
                  }}
                  className="flex-1 px-2 py-1 bg-dark-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

            </div>

          </div>

          {/* Paper Physics Active Card Indicator */}
          <div className="p-3.5 rounded-2xl bg-dark-850/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className={`w-2.5 h-2.5 rounded-full ${
                surface === 'whiteboard' ? 'bg-brand-cyan' : surface === 'paper' ? 'bg-brand-purple' : 'bg-brand-orange'
              }`}></span>
              <span className="capitalize">{surface} Surface Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {surface === 'paper' && 'Realistic paper physics active: strokes exhibit natural ink bleed and velocity-based pigment absorption.'}
              {surface === 'sketch' && 'Rough sketch canvas active: charcoal and graphite tooth drag with authentic particle scatter.'}
              {surface === 'whiteboard' && 'Fluid whiteboard active: ultra-crisp edges, zero friction, and instant responsiveness.'}
            </p>
          </div>

        </div>

        {/* Right Canvas Drawing Area */}
        <div className="lg:col-span-9 flex flex-col">
          
          <div 
            ref={containerRef}
            className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex-1 min-h-[550px] transition-all"
            style={{
              backgroundColor: surfaceStyle.backgroundColor,
              backgroundImage: surfaceStyle.texturePattern
            }}
          >
            
            {/* Optional Grid Overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                  backgroundSize: '32px 32px'
                }}
              />
            )}

            {/* Main Interactive Drawing Canvas */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="absolute inset-0 z-10 canvas-cursor touch-none"
            />

            {/* Preview Canvas for real-time shapes */}
            <canvas
              ref={previewCanvasRef}
              className="absolute inset-0 z-20 pointer-events-none"
            />

            {/* Surface watermark tag */}
            <div className="absolute bottom-3 right-4 z-30 pointer-events-none opacity-40 select-none text-[11px] font-mono uppercase tracking-widest text-slate-400">
              SketchDraw • {surface}
            </div>

            {/* Toast Notification */}
            {toastMessage && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-dark-900/95 border border-brand-purple/40 text-xs font-semibold text-white shadow-2xl shadow-brand-purple/20 backdrop-blur-md animate-fadeIn flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-cyan" />
                <span>{toastMessage}</span>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
