/**
 * Render preview cepat dari semua composition (1080p, 4 detik).
 * Cocok untuk cek hasil sebelum render lengkap 4K.
 *
 * Contoh:
 *   node preview.mjs --scene silk
 *   node preview.mjs
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const get = (k, d) => {
  const i = args.indexOf('--' + k);
  return i > -1 ? args[i + 1] : d;
};

const scene = get('scene', '');
const fps = Number(get('fps', 30));
const seconds = Number(get('seconds', 4));
const size = get('size', '1920x1080');
const outName = get('out', '');

const [W, H] = size.split('x').map(Number);
const DURATION_IN_FRAMES = Math.round(seconds * fps);

const scenes = ['silk', 'terrain', 'aurora', 'hex', 'ridges', 'car'];
const targetScenes = scene ? [scene] : scenes;

fs.mkdirSync(path.join(process.cwd(), 'out'), { recursive: true });

const renderOne = (id) => {
  const outFile = path.join(
    process.cwd(),
    'out',
    outName || `${id}_${W}x${H}_${fps}fps_preview.mp4`
  );

  return new Promise((resolve, reject) => {
    console.log(
      `Preview ${id}: ${DURATION_IN_FRAMES} frame, ${W}x${H}, ${fps} fps -> ${outFile}`
    );

    const ff = spawn(
      'npx',
      [
        'remotion',
        'render',
        './src/index.ts',
        id,
        outFile,
        '--fps',
        String(fps),
        '--duration-in-frames',
        String(DURATION_IN_FRAMES),
        '--width',
        String(W),
        '--height',
        String(H),
        '--preview',
      ],
      { stdio: ['inherit', 'inherit', 'inherit'], shell: true }
    );

    ff.on('close', (code) => {
      if (code === 0) {
        console.log('Selesai:', outFile);
        resolve();
      } else {
        reject(new Error(`remotion preview gagal untuk ${id}: exit code ${code}`));
      }
    });

    ff.on('error', reject);
  });
};

(async () => {
  for (const id of targetScenes) {
    try {
      await renderOne(id);
    } catch (err) {
      console.error(err.message);
    }
  }
  console.log('Semua preview selesai.');
})();
