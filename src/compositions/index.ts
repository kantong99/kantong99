import { Composition } from 'remotion';
import { Silk } from '../scenes/silk';
import { Terrain } from '../scenes/terrain';
import { Aurora } from '../scenes/aurora';
import { Hex } from '../scenes/hex';
import { Ridges } from '../scenes/ridges';
import { Car } from '../scenes/car';

/**
 * Konstanta untuk semua video stock: 3840x2160, 30 fps, 20 detik (600 frame).
 * Loop mulus: frame terakhir = frame awal (t kembali ke 0).
 */
export const WIDTH = 3840;
export const HEIGHT = 2160;
export const FPS = 30;
export const DURATION_SECONDS = 20;
export const DURATION_IN_FRAMES = DURATION_SECONDS * FPS; // 600

/**
 * Daftar semua composition Remotion. Setiap scene diberi ID unik agar
 * Remotion Studio dan CLI bisa memilihnya secara individual.
 */
export const Container = () => {
  return (
    <>
      <Composition
        id="silk"
        component={Silk}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
      />
      <Composition
        id="terrain"
        component={Terrain}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
      />
      <Composition
        id="aurora"
        component={Aurora}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
      />
      <Composition
        id="hex"
        component={Hex}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
      />
      <Composition
        id="ridges"
        component={Ridges}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
      />
      <Composition
        id="car"
        component={Car}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
      />
    </>
  );
};
