import { SceneCanvas } from '../components/SceneCanvas';
import { DURATION_IN_FRAMES } from '../compositions';

/**
 * Konsep 5: Ridge lines. Garis gelombang berlapis seperti punggung bukit,
 * gradien magenta-amber, loop mulus. Port dari scenes/ridges.js.
 */
const TAU = Math.PI * 2;
const ROWS = 80;
const STEPS = 320;

export const Ridges = () => {
  const width = 3840;
  const height = 2160;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, f: number) => {
    const p = t * TAU;

    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#14061f');
    g.addColorStop(1, '#070310');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.lineJoin = 'round';
    ctx.lineWidth = h * 0.0024;

    for (let i = 0; i < ROWS; i++) {
      const q = i / (ROWS - 1);
      const base = h * (0.24 + 0.72 * q);
      const amp = h * 0.13 * (0.25 + 0.75 * q);

      ctx.beginPath();
      ctx.moveTo(-10, h + 10);

      for (let s = 0; s <= STEPS; s++) {
        const u = s / STEPS;
        const env = Math.exp(-Math.pow((u - 0.5) * 2.2, 2));
        const wv =
          0.5 * Math.sin(u * 9 + i * 0.18 - p) +
          0.3 * Math.sin(u * 17 - i * 0.11 + 2 * p) +
          0.4 * Math.sin(u * 5 + p + i * 0.3);

        ctx.lineTo(u * w, base - amp * (0.15 + env) * (wv + 0.9));
      }

      ctx.lineTo(w + 10, h + 10);
      ctx.closePath();

      ctx.fillStyle = '#070310';
      ctx.fill();
      ctx.strokeStyle = `rgb(255,${(70 + 120 * q) | 0},${(160 - 70 * q) | 0})`;
      ctx.stroke();
    }
  };

  return (
    <SceneCanvas
      width={width}
      height={height}
      durationInFrames={DURATION_IN_FRAMES}
      draw={draw}
    />
  );
};
