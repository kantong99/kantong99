import { SceneCanvas } from '../components/SceneCanvas';
import { DURATION_IN_FRAMES } from '../compositions';

/**
 * Konsep 1: Silk flow. Garis aliran seperti sutra/tinta, loop mulus
 * (semua gelombang berkelipatan bulat).
 * Port dari scenes/silk.js — logika drawnya dipakai utuh via SceneCanvas.
 */
const TAU = Math.PI * 2;
const rng = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const ang = (x: number, y: number, p: number) =>
  1.9 * Math.sin(1.6 * x + 1.1 * y + p) +
  1.3 * Math.sin(-1.2 * x + 2.4 * y - 2 * p + 1.7) +
  0.8 * Math.sin(3.2 * x + 0.6 * y + 3 * p + 0.4) +
  0.6 * Math.sin(4.1 * y - 2.2 * x + p + 2.9);

let seeds: [number, number, number][] = [];

export const Silk = () => {
  const width = 3840;
  const height = 2160;

  const init = () => {
    const r = rng(7);
    seeds = [];
    for (let i = 0; i < 1500; i++) {
      seeds.push([r() * 1.3 - 0.15, r() * 1.3 - 0.15, r()]);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, f: number) => {
    const p = t * TAU;
    const s = 2.2 / h;
    const L = h * 0.0042;

    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#040a18');
    g.addColorStop(1, '#0b1a36');

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const [sx, sy, q] of seeds) {
      let px = sx * w;
      let py = sy * h;
      const pts: [number, number][] = [[px, py]];

      for (let i = 0; i < 110; i++) {
        const a = ang(px * s, py * s, p);
        px += Math.cos(a) * L;
        py += Math.sin(a) * L;
        pts.push([px, py]);
      }

      const r = 40 + 215 * q;
      const gr = 190 + 6 * q;
      const b = 205 - 55 * q;

      for (const [w2, al] of [
        [h * (0.0016 + 0.002 * q), 0.035 + 0.05 * q],
        [h * (0.0003 + 0.0006 * q), 0.18 + 0.3 * q],
      ]) {
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = `rgba(${r | 0},${gr | 0},${b | 0},${al})`;
        ctx.lineWidth = w2;
        ctx.stroke();
      }
    }
  };

  return (
    <SceneCanvas
      width={width}
      height={height}
      durationInFrames={DURATION_IN_FRAMES}
      init={init}
      draw={draw}
    />
  );
};
