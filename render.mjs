/**
 * Render semua composition Remotion ke MP4 lewat CLI.
 * Digunakan untuk render akhir (4K 3840x2160, 30 fps, 20 detik).
 *
 * Contoh:
 *   node render.mjs --scene silk          # render satu scene
 *   node render.mjs                       # render semua scene
 *   node render.mjs --out out/custom.mp4  # custom output path
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
const preview = get('preview', 'false') === 'true';
const fps = Number(get('fps', 30));
const seconds = Number(get('seconds', preview ? 4 : 20));
const size = get('size', preview ? '1920x1080' : '3840x2160');
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
    outName || `${id}_${W}x${H}_${fps}fps${preview ? '_preview' : ''}.mp4`
  );

  return new Promise((resolve, reject) => {
    console.log(
      `Render ${id}: ${DURATION_IN_FRAMES} frame, ${W}x${H}, ${fps} fps -> ${outFile}`
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
        ...(preview ? ['--preview'] : []),
      ],
      { stdio: ['inherit', 'inherit', 'inherit'], shell: true }
    );

    ff.on('close', (code) => {
      if (code === 0) {
        console.log('Selesai:', outFile);
        resolve();
      } else {
        reject(new Error(`remotion render gagal untuk ${id}: exit code ${code}`));
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
  console.log('Semua render selesai.');
})();
