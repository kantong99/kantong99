import { useRef, useEffect } from 'react';
import { useCurrentFrame } from 'remotion';

export interface SceneCanvasProps {
  width: number;
  height: number;
  durationInFrames: number;
  init?: () => void;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, f: number) => void;
}

/**
 * Wrapper canvas 2D untuk setiap scene stock video.
 * Menggunakan useCurrentFrame() dari Remotion sebagai waktu ternormalize 0..1,
 * lalu memanggil fungsi draw() asli dari scenes/.
 */
export const SceneCanvas = ({
  width,
  height,
  durationInFrames,
  init,
  draw,
}: SceneCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const frame = useCurrentFrame();
  const t = frame / Math.max(1, durationInFrames - 1);

  // Simpan draw/init dalam ref agar effect tidak terlalu sering re-run
  // saat fungsi inline diubah setiap render.
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const initRef = useRef(init);
  initRef.current = init;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    initRef.current?.();
    drawRef.current(ctx, width, height, t, frame);
  }, [frame, width, height, t]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block', background: '#000' }}
    />
  );
};
