import { Composition } from 'remotion';
import { Silk } from '../scenes/silk';
import { Terrain } from '../scenes/terrain';
import { Aurora } from '../scenes/aurora';
import { Hex } from '../scenes/hex';
import { Ridges } from '../scenes/ridges';
import { Car } from '../scenes/car';
import { WIDTH, HEIGHT, FPS, DURATION_IN_FRAMES } from '../constants';

export { WIDTH, HEIGHT, FPS, DURATION_SECONDS, DURATION_IN_FRAMES } from '../constants';

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
