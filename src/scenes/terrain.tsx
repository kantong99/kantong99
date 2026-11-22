import { SceneCanvas } from '../components/SceneCanvas';
import { DURATION_IN_FRAMES } from '../compositions';

/**
 * Konsep 2: Dot terrain. Lanskap titik bergelombang 3D, gradien ungu-cyan,
 * loop mulus. Port dari scenes/terrain.js.
 */
const TAU = Math.PI * 2;
const ROWS = 220;
const COLS = 180;

const ridge = (x: number, z: number, p: number) =>
  0.55 * Math.sin(0.9 * x + p) * Math.cos(0.7 * z - p) +
  0.35 * Math.sin(1.7 * x - 1.3 * z + 2 * p + 1) +
  0.2 * Math.sin(2.9 * z + 0.5 * x - p + 2);

export const Terrain = () => {
  const width = 3840;
  const height = 2160;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, _frame: number) => {
    const p = t * TAU;
    const k = h / 2160;
    const hz = h * 0.36;
    const focal = h * 0.9;
    const cam = 3.4;

    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#060614');
    g.addColorStop(0.45, '#190f40');
    g.addColorStop(1, '#0a0720');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const gl = ctx.createRadialGradient(w / 2, hz, 0, w / 2, hz, w * 0.5);
    gl.addColorStop(0, 'rgba(255,90,190,.30)');
    gl.addColorStop(1, 'rgba(255,90,190,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'lighter';

    for (let r = 0; r < ROWS; r++) {
      const d = r / (ROWS - 1);
      const wz = 2.2 + 46 * Math.pow(1 - d, 1.7);
      const sc = focal / wz;
      const half = ((w / 2) / sc) * 1.05;
      const fog = Math.pow(d, 0.8);

      for (let c = 0; c < COLS; c++) {
        const wx = (c / (COLS - 1) - 0.5) * 2 * half;
        const hv = ridge(wx, wz, p);
        const n = (hv + 1.1) / 2.2;
        const sx = w / 2 + wx * sc;
        const sy = hz + (cam - hv * 1.6) * sc;
        if (sy > h + 10 || sy < 0) continue;

        const rr = (0.9 + 4.2 * Math.pow(d, 1.4)) * k;
        const R = 70 + 185 * n * n;
        const G = 90 + 140 * (1 - Math.abs(n - 0.5) * 2);
        const B = 255 - 60 * n;

        ctx.fillStyle = `rgba(${R | 0},${G | 0},${B | 0},${0.12 + 0.75 * fog})`;
        ctx.beginPath();
        ctx.arc(sx, sy, rr, 0, TAU);
        ctx.fill();
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
