import type { DrawingSurface, DrawingTool } from '../types';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  time?: number;
}

export interface StrokeConfig {
  tool: DrawingTool;
  surface: DrawingSurface;
  color: string;
  size: number;
  opacity: number;
}

/**
 * Generates an SVG data URL or canvas pattern representing the realistic surface
 */
export function createSurfaceTexture(surface: DrawingSurface): {
  backgroundColor: string;
  hasGrid: boolean;
  texturePattern: string;
} {
  switch (surface) {
    case 'whiteboard':
      return {
        backgroundColor: '#0B0F19',
        hasGrid: true,
        texturePattern: `radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(11, 15, 25, 1) 100%)`
      };
    case 'paper':
      return {
        backgroundColor: '#121620',
        hasGrid: false,
        texturePattern: `
          radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(135deg, rgba(20, 26, 38, 0.9) 0%, rgba(14, 18, 27, 1) 100%)
        `
      };
    case 'sketch':
      return {
        backgroundColor: '#16131C',
        hasGrid: false,
        texturePattern: `
          repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.015) 0px, rgba(255, 255, 255, 0.015) 2px, transparent 2px, transparent 4px),
          repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.015) 0px, rgba(255, 255, 255, 0.015) 2px, transparent 2px, transparent 4px),
          linear-gradient(180deg, #1A1522 0%, #120F18 100%)
        `
      };
  }
}

/**
 * Draws a realistic stroke segment connecting points with surface physics
 */
export function drawPhysicsStroke(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  config: StrokeConfig,
  speed: number = 1
) {
  const { tool, surface, color, size, opacity } = config;

  ctx.save();

  // Calculate velocity factor (0.5 to 1.8)
  const clampedSpeed = Math.max(0.2, Math.min(speed, 5));
  let dynamicSize = size;
  let dynamicOpacity = opacity;

  // Apply Surface & Tool specific physics
  if (surface === 'paper') {
    // Paper absorption physics:
    // Slower movement means the paper absorbs more ink -> slightly thicker, richer opacity
    // Faster movement means rapid skim -> slightly lighter
    const absorption = Math.max(0.7, 1.4 - clampedSpeed * 0.25);
    dynamicSize = size * (0.85 + absorption * 0.15);
    dynamicOpacity = Math.min(1, opacity * (0.9 + absorption * 0.1));
  } else if (surface === 'sketch') {
    // Heavy tooth friction:
    // High drag resistance, rough fractured grain
    const toothChatter = (Math.random() - 0.5) * 1.5;
    dynamicSize = Math.max(1, size + toothChatter);
  }

  // Tool Specific Rendering Logic
  switch (tool) {
    case 'pen': {
      // Smooth flowing ink with velocity tapering
      ctx.globalAlpha = dynamicOpacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = surface === 'whiteboard' ? size : dynamicSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Paper ink bleed: micro-bleed along the stroke
      if (surface === 'paper' && size > 3) {
        ctx.globalAlpha = dynamicOpacity * 0.12;
        ctx.lineWidth = dynamicSize * 1.35;
        ctx.stroke();
      }
      break;
    }

    case 'pencil': {
      // Graphite texture: grainy particle distribution & multi-layered tooth
      ctx.globalAlpha = surface === 'sketch' ? dynamicOpacity * 0.55 : dynamicOpacity * 0.7;
      ctx.strokeStyle = color;
      ctx.lineWidth = dynamicSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Base stroke
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Add graphite tooth particles if on paper or sketch
      if (surface !== 'whiteboard') {
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const particles = Math.max(2, Math.floor(dist * 0.8));
        ctx.fillStyle = color;

        for (let i = 0; i < particles; i++) {
          const t = i / particles;
          const px = p1.x + (p2.x - p1.x) * t;
          const py = p1.y + (p2.y - p1.y) * t;
          const jitter = (Math.random() - 0.5) * (size * 0.7);
          const perpAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + Math.PI / 2;
          
          ctx.globalAlpha = Math.random() * dynamicOpacity * (surface === 'sketch' ? 0.7 : 0.4);
          ctx.beginPath();
          ctx.arc(
            px + Math.cos(perpAngle) * jitter,
            py + Math.sin(perpAngle) * jitter,
            Math.max(0.4, (Math.random() * size) / 5),
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
      break;
    }

    case 'marker': {
      // Translucent alcohol marker with chisel overlap & paper bleed
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = dynamicOpacity * 0.35;
      ctx.strokeStyle = color;
      ctx.lineWidth = dynamicSize * 1.5;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'bevel';

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Core darker highlight
      ctx.globalAlpha = dynamicOpacity * 0.2;
      ctx.lineWidth = dynamicSize * 0.8;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      break;
    }

    case 'sketch': {
      // Rough charcoal & pastel texture
      ctx.globalAlpha = dynamicOpacity * 0.6;
      ctx.strokeStyle = color;
      ctx.lineWidth = dynamicSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Multiple jittered rough passes
      const count = surface === 'sketch' ? 4 : 2;
      for (let j = 0; j < count; j++) {
        const offset = (Math.random() - 0.5) * (size * 0.4);
        ctx.beginPath();
        ctx.moveTo(p1.x + offset, p1.y + offset);
        ctx.lineTo(p2.x + offset, p2.y + offset);
        ctx.stroke();
      }

      // Charcoal dust specks
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const specks = Math.floor(dist * 0.5);
      ctx.fillStyle = color;
      for (let s = 0; s < specks; s++) {
        const t = Math.random();
        const spread = (Math.random() - 0.5) * size * 1.2;
        ctx.globalAlpha = Math.random() * dynamicOpacity * 0.5;
        ctx.beginPath();
        ctx.arc(
          p1.x + (p2.x - p1.x) * t + spread,
          p1.y + (p2.y - p1.y) * t + spread,
          Math.max(0.5, Math.random() * (size / 4)),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      break;
    }

    case 'eraser': {
      // Clean eraser
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = opacity;
      ctx.lineWidth = size * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      break;
    }

    default:
      ctx.globalAlpha = dynamicOpacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = dynamicSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      break;
  }

  ctx.restore();
}

/**
 * Flood fill algorithm for canvas
 */
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance: number = 32
) {
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;

  const x = Math.round(startX);
  const y = Math.round(startY);

  if (x < 0 || x >= width || y < 0 || y >= height) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Convert hex to RGBA
  const fillR = parseInt(fillColorHex.slice(1, 3), 16);
  const fillG = parseInt(fillColorHex.slice(3, 5), 16);
  const fillB = parseInt(fillColorHex.slice(5, 7), 16);
  const fillA = 255;

  const targetIndex = (y * width + x) * 4;
  const targetR = data[targetIndex];
  const targetG = data[targetIndex + 1];
  const targetB = data[targetIndex + 2];
  const targetA = data[targetIndex + 3];

  // If already matches fill color, return
  if (
    Math.abs(targetR - fillR) < 5 &&
    Math.abs(targetG - fillG) < 5 &&
    Math.abs(targetB - fillB) < 5 &&
    Math.abs(targetA - fillA) < 5
  ) {
    return;
  }

  function matches(pixelIndex: number) {
    const dr = Math.abs(data[pixelIndex] - targetR);
    const dg = Math.abs(data[pixelIndex + 1] - targetG);
    const db = Math.abs(data[pixelIndex + 2] - targetB);
    const da = Math.abs(data[pixelIndex + 3] - targetA);
    return dr <= tolerance && dg <= tolerance && db <= tolerance && da <= tolerance;
  }

  // Scanline queue flood fill
  const pixelStack: [number, number][] = [[x, y]];
  const visited = new Uint8Array(width * height);

  while (pixelStack.length > 0) {
    const [curX, curY] = pixelStack.pop()!;
    let lineY = curY;
    let lineX = curX;

    let index = (lineY * width + lineX) * 4;
    let vIndex = lineY * width + lineX;

    if (visited[vIndex]) continue;

    // Scan left
    while (lineX > 0 && matches(index - 4) && !visited[vIndex - 1]) {
      lineX--;
      index -= 4;
      vIndex--;
    }

    let spanAbove = false;
    let spanBelow = false;

    // Scan right and fill
    while (lineX < width && matches(index) && !visited[vIndex]) {
      visited[vIndex] = 1;
      data[index] = fillR;
      data[index + 1] = fillG;
      data[index + 2] = fillB;
      data[index + 3] = fillA;

      // Check above
      if (lineY > 0) {
        const aboveIndex = index - width * 4;
        const aboveV = vIndex - width;
        if (!visited[aboveV] && matches(aboveIndex)) {
          if (!spanAbove) {
            pixelStack.push([lineX, lineY - 1]);
            spanAbove = true;
          }
        } else if (spanAbove) {
          spanAbove = false;
        }
      }

      // Check below
      if (lineY < height - 1) {
        const belowIndex = index + width * 4;
        const belowV = vIndex + width;
        if (!visited[belowV] && matches(belowIndex)) {
          if (!spanBelow) {
            pixelStack.push([lineX, lineY + 1]);
            spanBelow = true;
          }
        } else if (spanBelow) {
          spanBelow = false;
        }
      }

      lineX++;
      index += 4;
      vIndex++;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
