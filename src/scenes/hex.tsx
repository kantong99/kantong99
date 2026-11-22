import { SceneCanvas } from '../components/SceneCanvas';
import { DURATION_IN_FRAMES } from '../compositions';

/**
 * Konsep 4: Hex pulse. Kisi heksagon dengan gelombang cahaya yang merambat,
 * loop mulus. Port dari scenes/hex.js.
 */
const TAU = Math.PI * 2;
const S3 = Math.sqrt(3);

export const Hex = () => {
  const width = 3840;
  const height = 2160;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, f: number) => {
    const p = t * TAU;
    const R = h * 0.03;
    const dx = S3 * R;
    const dy = 1.5 * R;

    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, '#0b2a3a');
    g.addColorStop(1, '#030812');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'lighter';
    ctx.lineJoin = 'round';
    ctx.lineWidth = h * 0.0012;

    const rows = Math.ceil(h / dy) + 2;
    const cols = Math.ceil(w / dx) + 2;

    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        const cx = c * dx + (r & 1 ? dx / 2 : 0);
        const cy = r * dy;
        const d = Math.hypot(cx - w / 2, cy - h / 2);
        const n = 0.5 + 0.5 * Math.sin(d * 10 / h - p);
        const m = 0.5 + 0.5 * Math.sin((cx / w) * TAU * 2 + p);
        const b = Math.pow(0.6 * n + 0.4 * m, 3);

        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = TAU / 12 + (TAU / 6) * k;
          const x = cx + Math.cos(a) * R * 0.94;
          const y = cy + Math.sin(a) * R * 0.94;
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();

        ctx.fillStyle = `rgba(40,190,210,${0.03 + 0.3 * b})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(120,235,255,${0.1 + 0.6 * b})`;
        ctx.stroke();
      }
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
