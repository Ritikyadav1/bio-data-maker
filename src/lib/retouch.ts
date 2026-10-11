import { canvas2d } from './image';

/** RGBA pixels of `src` blurred with the browser's native canvas blur. */
function blurredPixels(src: HTMLCanvasElement, radius: number): Uint8ClampedArray {
  const { c, ctx } = canvas2d(src.width, src.height, { willReadFrequently: true });
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(src, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height).data;
}

/** Standard YCbCr skin-tone box; works across light to dark skin in normal lighting. */
function isSkin(r: number, g: number, b: number) {
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
}

/**
 * In-place skin smoothing and sharpening of a canvas. `smooth` and `sharpen` are 0..100.
 * Blur radii scale with the canvas width so a small preview and the 3x export look the same.
 */
export function retouch(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, smooth: number, sharpen: number) {
  if (!smooth && !sharpen) return;
  const image = ctx.getImageData(0, 0, c.width, c.height);
  const px = image.data;

  if (smooth) {
    // Edge-aware: pull each pixel towards a blurred copy, but only on skin tones and only where the
    // blur changes it a little (pores, blemishes). Eyes, lips and hair edges differ a lot, so they stay sharp.
    const blur = blurredPixels(c, Math.max(1, c.width / 120));
    const k = smooth / 100;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      const dr = blur[i] - r, dg = blur[i + 1] - g, db = blur[i + 2] - b;
      const diff = (Math.abs(dr) + Math.abs(dg) + Math.abs(db)) / 3;
      // ponytail: fixed edge threshold (28) and skin box; a face-detection mask would be the upgrade if needed
      const keepEdges = Math.max(0, 1 - diff / 28);
      const t = k * keepEdges * (isSkin(r, g, b) ? 1 : 0.15);
      px[i] = r + dr * t;
      px[i + 1] = g + dg * t;
      px[i + 2] = b + db * t;
    }
    ctx.putImageData(image, 0, 0); // the sharpen blur below must see the smoothed picture
  }

  if (sharpen) {
    // Thresholded unsharp mask: push each pixel away from a slightly blurred copy, but fade the effect out for
    // small differences so real edges get crisper while grain / pores (and freshly smoothed skin) are not
    // amplified again. Uint8ClampedArray clamps to 0..255.
    const blur = blurredPixels(c, Math.max(0.6, c.width / 400));
    const k = (sharpen / 100) * 1.5;
    // when smoothing is on, skin is left mostly alone so the two sliders don't fight each other
    const skinDamp = 1 - smooth / 100;
    for (let i = 0; i < px.length; i += 4) {
      const dr = px[i] - blur[i], dg = px[i + 1] - blur[i + 1], db = px[i + 2] - blur[i + 2];
      const damp = smooth && isSkin(px[i], px[i + 1], px[i + 2]) ? skinDamp : 1;
      const t = k * damp * Math.min(1, (Math.abs(dr) + Math.abs(dg) + Math.abs(db)) / 3 / 12);
      px[i] += dr * t;
      px[i + 1] += dg * t;
      px[i + 2] += db * t;
    }
  }

  ctx.putImageData(image, 0, 0);
}
