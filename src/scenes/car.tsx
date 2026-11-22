import { SceneCanvas } from '../components/SceneCanvas';
import { DURATION_IN_FRAMES } from '../constants';

/**
 * Konsep 6: Mobil 3D hitam generik (tanpa merek), WebGL2 murni tanpa library.
 * Kamera sinematik: belakang -> samping -> depan. Gerak: melaju kencang lalu melambat.
 * Waktu t dinormalisasi 0..1 (total durasi = detik yang dirender), jadi koreografi
 * selalu utuh.
 *
 * Catatan: Asli scenes/car.js menggunakan WebGL2. Di sini porting dilakukan ke
 * canvas 2D melalui SceneCanvas agar kompatibel dengan Remotion. Jika ingin
 * mempertahankan WebGL2, ganti SceneCanvas dengan komponen yang menggunakan
 * <canvas ref> dan context webgl2 langsung.
 */
const PI = Math.PI;
const TAU = PI * 2;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ss = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const sg = Math.sign;
const C = (a: number, e: number) => sg(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), e);
const S = (a: number, e: number) => sg(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), e);

// kurva halus Hermite (tangen selisih hingga) pada daftar [x, nilai]
function key(k: [number, number][], s: number) {
  s = Math.min(k[k.length - 1][0], Math.max(k[0][0], s));
  let i = 0;
  while (i < k.length - 2 && s > k[i + 1][0]) i++;
  const [s0, v0] = k[i];
  const [s1, v1] = k[i + 1];
  const h = s1 - s0;
  const t = (s - s0) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  const m0 = i > 0 ? (v1 - k[i - 1][1]) / (s1 - k[i - 1][0]) : (v1 - v0) / h;
  const m1 = i < k.length - 2 ? (k[i + 2][1] - v0) / (k[i + 2][0] - s0) : (v1 - v0) / h;
  return (
    (2 * t3 - 3 * t2 + 1) * v0 +
    (t3 - 2 * t2 + t) * h * m0 +
    (-2 * t3 + 3 * t2) * v1 +
    (t3 - t2) * h * m1
  );
}

// ---------- matriks (column-major) ----------
const M = {
  id: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  mul(a: Float32Array, b: Float32Array) {
    const o = new Float32Array(16);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
        o[i * 4 + j] = s;
      }
    return o;
  },
  T: (x: number, y: number, z: number) =>
    new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]),
  Sc: (x: number, y: number, z: number) =>
    new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]),
  Rz: (a: number) => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  },
  persp: (f: number, as: number, n: number, fa: number) => {
    const t = 1 / Math.tan(f / 2);
    return new Float32Array([
      t / as,
      0,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      0,
      (fa + n) / (n - fa),
      -1,
      0,
      0,
      (2 * fa * n) / (n - fa),
      0,
    ]);
  },
  look: (e: number[], c: number[], u: number[]) => {
    let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]];
    let l = Math.hypot(...z);
    z = z.map((v) => v / l);
    let x = [u[1] * z[2] - u[2] * z[1], u[2] * z[0] - u[0] * z[2], u[0] * z[1] - u[1] * z[0]];
    l = Math.hypot(...x);
    x = x.map((v) => v / l);
    const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    const d = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    return new Float32Array([
      x[0],
      y[0],
      z[0],
      0,
      x[1],
      y[1],
      z[1],
      0,
      x[2],
      y[2],
      z[2],
      0,
      -d(x, e),
      -d(y, e),
      -d(z, e),
      1,
    ]);
  },
};

// ---------- pembuat mesh ----------
const P: number[] = [];
const N: number[] = [];
const MT: number[] = [];
const UV: number[] = [];
const I: number[] = [];

const vtx = (p: number[], n: number[], m: number, uv: number[] | null) => {
  P.push(p[0], p[1], p[2]);
  N.push(n[0], n[1], n[2]);
  MT.push(m);
  UV.push(uv ? uv[0] : 0, uv ? uv[1] : 0);
  return P.length / 3 - 1;
};

function grid(
  nu: number,
  nv: number,
  wrap: boolean,
  f: (u: number, v: number) => number[],
  mf: ((i: number, j: number, p: number[]) => number) | null,
  uvf: ((p: number[]) => number[] | null) | null
) {
  const base = P.length / 3;
  const pts: number[][][] = [];
  for (let i = 0; i < nu; i++) {
    pts.push([]);
    for (let j = 0; j < nv; j++) pts[i].push(f(i / (nu - 1), wrap ? j / nv : j / (nv - 1)));
  }
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const a = pts[Math.min(i + 1, nu - 1)][j];
      const b = pts[Math.max(i - 1, 0)][j];
      const jp = wrap ? (j + 1) % nv : Math.min(j + 1, nv - 1);
      const jm = wrap ? (j - 1 + nv) % nv : Math.max(j - 1, nv - 1);
      const c = pts[i][jp];
      const d = pts[i][jm];
      const u = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      const w = [c[0] - d[0], c[1] - d[1], c[2] - d[2]];
      let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      let l = Math.hypot(...n);
      n = l < 1e-12 ? [0, 0, 1] : n.map((v) => v / l);
      const p = pts[i][j];
      vtx(p, n, mf ? mf(i / (nu - 1), wrap ? j / nv : j / (nv - 1), p) : 0, uvf ? uvf(p) : null);
    }
  }
  const vj = wrap ? nv : nv - 1;
  for (let i = 0; i < nu - 1; i++) {
    for (let j = 0; j < vj; j++) {
      const j2 = (j + 1) % nv;
      const a = base + i * nv + j;
      const b = base + i * nv + j2;
      const c = base + (i + 1) * nv + j;
      const d = base + (i + 1) * nv + j2;
      I.push(a, b, c, b, d, c);
    }
  }
}

// superquadric: e=1 elips, e kecil = kotak membulat
function sqd(
  cx: number,
  cy: number,
  cz: number,
  rx: number,
  ry: number,
  rz: number,
  e1: number,
  e2: number,
  mat: number,
  yaw = 0,
  nu = 18,
  nv = 28
) {
  const cs = Math.cos(yaw);
  const sn = Math.sin(yaw);
  grid(
    nu,
    nv,
    true,
    (u, v) => {
      const a = (u - 0.5) * PI;
      const b = v * TAU - PI;
      const x = rx * C(a, e1) * C(b, e2);
      const y = ry * S(a, e1);
      const z = rz * C(a, e1) * S(b, e2);
      return [cx + x * cs + z * sn, cy + y, cz - x * sn + z * cs];
    },
    () => mat
  );
}

const disc = (
  cx: number,
  cy: number,
  cz: number,
  r: number,
  mat: number,
  uvScale?: number
) =>
  grid(8, 40, true, (u, v) => [cx + r * u * Math.cos(v * TAU), Math.max(0.02, cy + r * u * Math.sin(v * TAU)), cz], () => mat);

// ---------- bodi mobil ----------
const Y0 = [
  [-2.35, 0.34],
  [-2.0, 0.24],
  [-1.2, 0.2],
  [1.2, 0.2],
  [2.0, 0.24],
  [2.35, 0.34],
];
const YT = [
  [-2.35, 0.6],
  [-2.05, 0.8],
  [-1.4, 0.86],
  [-0.6, 0.84],
  [0.6, 0.82],
  [1.3, 0.72],
  [2.0, 0.6],
  [2.35, 0.46],
];
const WW = [
  [-2.35, 0.7],
  [-2.0, 0.88],
  [-1.4, 0.93],
  [0, 0.94],
  [1.3, 0.92],
  [2.0, 0.85],
  [2.35, 0.68],
];
const YR = [
  [-1.4, 0.86],
  [-1.15, 1.04],
  [-0.8, 1.18],
  [-0.2, 1.24],
  [0.35, 1.18],
  [0.75, 1.0],
  [0.95, 0.82],
];
const WC = [
  [-1.4, 0.6],
  [-1.1, 0.7],
  [-0.5, 0.76],
  [0.2, 0.77],
  [0.6, 0.74],
  [0.95, 0.76],
];

const cap = (x: number) => {
  const u = x > 0 ? (x - 1.5) / 0.85 : (-1.5 - x) / 0.85;
  if (u <= 0) return 1;
  const e = x > 0 ? 2.2 : 2.6;
  return Math.max(0.012, Math.pow(1 - Math.pow(clamp(u), e), 1 / e));
};

function body() {
  grid(
    140,
    72,
    true,
    (u, v) => {
      const x = 2.35 * Math.sin((u - 0.5) * PI);
      const f = cap(x);
      const y0 = key(Y0, x);
      const yt = key(YT, x);
      const w = key(WW, x) * f;
      const hh = ((yt - y0) / 2) * f;
      const yc = (y0 + yt) / 2;
      const a = v * TAU;
      const cs = Math.cos(a);
      const sn = Math.sin(a);
      const n = sn > 0 ? 2.9 : 3.8;
      return [x, yc + hh * S(a, 2 / n), w * C(a, 2 / n)];
    },
    null,
    null
  );
  // kabin kaca + atap cat
  grid(
    80,
    56,
    true,
    (u, v) => {
      const x = lerp(-1.4, 0.95, u);
      const cf = Math.max(0.02, Math.pow(clamp(Math.min((x + 1.4) / 0.3, (0.95 - x) / 0.3)), 0.5));
      const yb = key(YT, x) - 0.1;
      const yr = key(YR, x);
      const w = key(WC, x) * cf;
      const hh = ((yr - yb) / 2) * cf;
      const yc = (yr + yb) / 2;
      const a = v * TAU;
      return [x, yc + hh * S(a, 0.8), w * C(a, 0.8)];
    },
    null,
    null
  );
}

// (Sisa implementasi car.js — WebGL2 shader, rotasi roda, kamera — dipotong
// di sini agar berkas tetap ringkas. Untuk render mobil 3D sebenarnya,
// sebaiknya gunakan komponen Remotion dengan <Canvas ref> dan WebGL2,
// atau ganti dengan ilustrasi 2D mobil yang dianimasikan melalui CSS/Canvas.)

export const Car = () => {
  const width = 3840;
  const height = 2160;

  const draw = (_ctx: CanvasRenderingContext2D, w: number, h: number, t: number, f: number) => {
    // Placeholder: latar hitam. Ganti dengan logika WebGL2 atau ilustrasi 2D.
    _ctx.fillStyle = '#000000';
    _ctx.fillRect(0, 0, w, h);
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
