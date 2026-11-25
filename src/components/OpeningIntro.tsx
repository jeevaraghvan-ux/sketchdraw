import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PenTool, ArrowRight } from 'lucide-react';

interface OpeningIntroProps {
  onComplete: () => void;
}

export const OpeningIntro: React.FC<OpeningIntroProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<'sketching' | 'ready_to_slash' | 'slashing' | 'ripping'>('sketching');
  const [penPos, setPenPos] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [isDrawing, setIsDrawing] = useState(false);
  const userStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Trigger final confetti & exit
  const triggerRipAndExit = useCallback(() => {
    setPhase('ripping');

    // Explosive drafting riso confetti burst
    confetti({
      particleCount: 70,
      spread: 90,
      origin: { y: 0.5, x: 0.5 },
      colors: ['#FF4D26', '#00E5FF', '#D4F835', '#FFFFFF']
    });

    // Secondary side cannons for maximum visual impact
    setTimeout(() => {
      confetti({
        particleCount: 35,
        angle: 60,
        spread: 50,
        origin: { x: 0, y: 0.6 },
        colors: ['#FF4D26', '#00E5FF']
      });
      confetti({
        particleCount: 35,
        angle: 120,
        spread: 50,
        origin: { x: 1, y: 0.6 },
        colors: ['#D4F835', '#FF4D26']
      });
    }, 150);

    setTimeout(() => {
      onComplete();
    }, 850);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Ambient floating embers
    const embers: { x: number; y: number; r: number; color: string; vx: number; vy: number; alpha: number }[] = [];
    const colors = ['#FF4D26', '#00E5FF', '#D4F835', '#FFFFFF'];
    for (let i = 0; i < 40; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    // Emblem sketch path definition (Centered logo quill geometry)
    const cx = width / 2;
    const cy = height / 2 - 40;
    const emblemPoints = [
      { x: cx - 65, y: cy + 45 },
      { x: cx - 35, y: cy - 45 },
      { x: cx + 45, y: cy - 55 },
      { x: cx + 15, y: cy + 15 },
      { x: cx - 65, y: cy + 45 },
      { x: cx + 45, y: cy - 55 },
    ];

    let sketchProgress = 0; // 0 to 1
    const sketchDuration = 2200; // ms
    const startTime = performance.now();

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      // Deep dark texture fill
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(0, 0, width, height);

      // Draw faint paper grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render floating embers
      embers.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Calculate sketch progress
      const elapsed = now - startTime;
      sketchProgress = Math.min(1, elapsed / sketchDuration);

      // Draw the animated emblem
      if (sketchProgress > 0) {
        const totalSegments = emblemPoints.length - 1;
        const currentSegmentIndex = Math.min(
          totalSegments - 1,
          Math.floor(sketchProgress * totalSegments)
        );
        const segmentProgress = (sketchProgress * totalSegments) % 1;

        // Gradient stroke
        const grad = ctx.createLinearGradient(cx - 80, cy - 60, cx + 80, cy + 60);
        grad.addColorStop(0, '#EC4899');
        grad.addColorStop(0.5, '#8B5CF6');
        grad.addColorStop(1, '#06B6D4');

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#8B5CF6';

        ctx.beginPath();
        ctx.moveTo(emblemPoints[0].x, emblemPoints[0].y);

        for (let i = 0; i < currentSegmentIndex; i++) {
          ctx.lineTo(emblemPoints[i + 1].x, emblemPoints[i + 1].y);
        }

        const p1 = emblemPoints[currentSegmentIndex];
        const p2 = emblemPoints[currentSegmentIndex + 1];
        const curX = p1.x + (p2.x - p1.x) * segmentProgress;
        const curY = p1.y + (p2.y - p1.y) * segmentProgress;
        ctx.lineTo(curX, curY);
        ctx.stroke();
        ctx.restore();

        // Update Stylus pen tip position
        if (sketchProgress < 1) {
          setPenPos({ x: curX, y: curY, visible: true });
        } else {
          setPenPos({ x: curX, y: curY, visible: false });
        }
      }

      // Draw User's interactive blade slash
      const stroke = userStrokeRef.current;
      if (stroke.length > 1) {
        ctx.save();
        const strokeGrad = ctx.createLinearGradient(0, 0, width, height);
        strokeGrad.addColorStop(0, '#FF4D26');
        strokeGrad.addColorStop(1, '#00E5FF');

        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#00E5FF';

        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    // Switch to interactive slash phase once emblem is drawn
    const timer = setTimeout(() => {
      setPhase((prev) => (prev === 'sketching' ? 'ready_to_slash' : prev));
    }, sketchDuration + 200);

    // Auto-enter fallback after 6.5s if user hasn't drawn
    const autoExitTimer = setTimeout(() => {
      triggerRipAndExit();
    }, 6500);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      clearTimeout(autoExitTimer);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [triggerRipAndExit]);

  // Handle Touch/Mouse Slicing Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    userStrokeRef.current = [{ x: e.clientX, y: e.clientY }];
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    userStrokeRef.current.push({ x: e.clientX, y: e.clientY });

    // Check if stroke is long enough to trigger tear
    if (userStrokeRef.current.length > 12) {
      const pStart = userStrokeRef.current[0];
      const pEnd = userStrokeRef.current[userStrokeRef.current.length - 1];
      const dist = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
      if (dist > 90 && phase !== 'ripping') {
        setIsDrawing(false);
        triggerRipAndExit();
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (userStrokeRef.current.length > 5 && phase !== 'ripping') {
      triggerRipAndExit();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`fixed inset-0 z-[100] cursor-crosshair select-none overflow-hidden transition-all duration-700 ${
        phase === 'ripping' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Floating Stylus Pen Cursor (Follows the auto-draw) */}
      {penPos.visible && (
        <div
          style={{
            transform: `translate3d(${penPos.x}px, ${penPos.y}px, 0)`,
            transition: 'transform 0.016s linear',
          }}
          className="absolute -top-6 -left-2 pointer-events-none z-20 flex items-center gap-1 animate-pulse"
        >
          <div className="w-7 h-7 rounded-lg bg-[#FF4D26] p-0.5 shadow-lg shadow-[#FF4D26]/30 -rotate-45">
            <div className="w-full h-full bg-[#0B0E14] rounded-md flex items-center justify-center">
              <PenTool className="w-3.5 h-3.5 text-[#00E5FF]" />
            </div>
          </div>
          <span className="w-2 h-2 rounded-sm bg-[#00E5FF] animate-ping opacity-75"></span>
        </div>
      )}

      {/* Center Title & Slogan (Fades in smoothly) */}
      <div className="absolute inset-x-0 top-[56%] flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <h1 className="text-4xl sm:text-6xl font-normal tracking-tight font-serif italic text-white drop-shadow animate-fadeIn">
          SketchDraw
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-mono mt-2 drop-shadow">
          Tactile Drawing Studio &amp; Paper Physics
        </p>

        {/* Phase 3 Interactive Prompt */}
        {phase === 'ready_to_slash' && (
          <div className="mt-8 flex flex-col items-center gap-2 animate-bounce">
            <div className="px-5 py-2.5 rounded-lg bg-[#111622] border border-slate-700 shadow-xl flex items-center gap-2.5 font-mono text-xs text-white">
              <span className="text-[#00E5FF]">✎</span>
              <span className="font-medium tracking-wide">
                Draw or drag a stroke to enter
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF4D26]" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Click &amp; drag anywhere on the canvas
            </span>
          </div>
        )}
      </div>

      {/* Skip Button (Always accessible top right) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          triggerRipAndExit();
        }}
        className="absolute top-6 right-6 z-30 px-3.5 py-1.5 rounded-lg bg-[#111622] hover:bg-[#161C2C] border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all shadow-lg active:scale-95 flex items-center gap-1.5"
      >
        <span>Skip Intro</span>
        <span>&times;</span>
      </button>
    </div>
  );
};