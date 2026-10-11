import type { PhotoAdjust } from '../types';

/*
 * Photo look adjustments done directly on RGBA pixels. Canvas `ctx.filter` would be shorter, but older
 * iPhone Safari ignores it silently, so everything here is plain maths: same result on every browser.
 * All functions are pure (no DOM), so scripts/check.ts can test them.
 */

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/**
 * brightness -> contrast -> saturate -> sepia, the same order and formulas as the CSS filter functions
 * (Filter Effects spec), each step clamped like the browser does.
 */
export function adjustColours(px: Uint8ClampedArray, a: PhotoAdjust) {
  const b = a.brightness / 100;
  const c = a.contrast / 100;
  const s = a.saturate / 100;
  const w = 1 - a.warmth / 100;
  if (b === 1 && c === 1 && s === 1 && w === 1) return;
  // prettier-ignore
  const S = [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
             0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
             0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s];
  // prettier-ignore
  const P = [0.393 + 0.607 * w, 0.769 - 0.769 * w, 0.189 - 0.189 * w,
             0.349 - 0.349 * w, 0.686 + 0.314 * w, 0.168 - 0.168 * w,
             0.272 - 0.272 * w, 0.534 - 0.534 * w, 0.131 + 0.869 * w];
  for (let i = 0; i < px.length; i += 4) {
    let r = clamp((clamp(px[i] * b) - 127.5) * c + 127.5);
    let g = clamp((clamp(px[i + 1] * b) - 127.5) * c + 127.5);
    let bl = clamp((clamp(px[i + 2] * b) - 127.5) * c + 127.5);
    [r, g, bl] = [clamp(S[0] * r + S[1] * g + S[2] * bl), clamp(S[3] * r + S[4] * g + S[5] * bl), clamp(S[6] * r + S[7] * g + S[8] * bl)];
    px[i] = P[0] * r + P[1] * g + P[2] * bl;
    px[i + 1] = P[3] * r + P[4] * g + P[5] * bl;
    px[i + 2] = P[6] * r + P[7] * g + P[8] * bl;
  }
}

/** One horizontal or vertical box-blur pass (sliding window, edges repeat), RGB only. */
function boxPass(src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number, r: number, horizontal: boolean) {
  const len = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const step = horizontal ? 4 : w * 4;
  const span = 2 * r + 1;
  for (let line = 0; line < lines; line++) {
    const base = horizontal ? line * w * 4 : line * 4;
    const at = (k: number) => base + Math.min(len - 1, Math.max(0, k)) * step;
    for (let ch = 0; ch < 3; ch++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += src[at(k) + ch];
      for (let k = 0; k < len; k++) {
        dst[base + k * step + ch] = sum / span;
        sum += src[at(k + r + 1) + ch] - src[at(k - r) + ch];
      }
    }
  }
}

/** Approximate Gaussian blur with standard deviation `sigma` px (three box passes each way). */
export function blur(px: Uint8ClampedArray, w: number, h: number, sigma: number): Uint8ClampedArray {
  const r = Math.max(1, Math.round((Math.sqrt(4 * sigma * sigma + 1) - 1) / 2));
  const a = Uint8ClampedArray.from(px);
  const tmp = new Uint8ClampedArray(px.length);
  for (let i = 0; i < 3; i++) {
    boxPass(a, tmp, w, h, r, true);
    boxPass(tmp, a, w, h, r, false);
  }
  return a;
}

/** Standard YCbCr skin-tone box; works across light to dark skin in normal lighting. */
function isSkin(r: number, g: number, b: number) {
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
}

/**
 * Applies a full PhotoAdjust to RGBA pixels of a w x h image, in place: colours, then skin smoothing, then
 * sharpening. Blur radii scale with the width so a small preview and the 3x export look the same.
 */
export function applyLook(px: Uint8ClampedArray, w: number, h: number, a: PhotoAdjust) {
  adjustColours(px, a);

  if (a.smooth) {
    // Edge-aware: pull each pixel towards a blurred copy, but only on skin tones and only where the
    // blur changes it a little (pores, blemishes). Eyes, lips and hair edges differ a lot, so they stay sharp.
    const soft = blur(px, w, h, Math.max(1, w / 120));
    const k = a.smooth / 100;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      const dr = soft[i] - r, dg = soft[i + 1] - g, db = soft[i + 2] - b;
      const diff = (Math.abs(dr) + Math.abs(dg) + Math.abs(db)) / 3;
      // ponytail: fixed edge threshold (28) and skin box; a face-detection mask would be the upgrade if needed
      const t = k * Math.max(0, 1 - diff / 28) * (isSkin(r, g, b) ? 1 : 0.15);
      px[i] = r + dr * t;
      px[i + 1] = g + dg * t;
      px[i + 2] = b + db * t;
    }
  }

  if (a.sharpen) {
    // Thresholded unsharp mask: push each pixel away from a slightly blurred copy, fading out for small
    // differences so edges get crisper while grain / pores (and freshly smoothed skin) are not amplified.
    const soft = blur(px, w, h, Math.max(0.6, w / 400));
    const k = (a.sharpen / 100) * 1.5;
    const skinDamp = 1 - a.smooth / 100; // with smoothing on, leave skin mostly alone so the sliders don't fight
    for (let i = 0; i < px.length; i += 4) {
      const dr = px[i] - soft[i], dg = px[i + 1] - soft[i + 1], db = px[i + 2] - soft[i + 2];
      const damp = a.smooth && isSkin(px[i], px[i + 1], px[i + 2]) ? skinDamp : 1;
      const t = k * damp * Math.min(1, (Math.abs(dr) + Math.abs(dg) + Math.abs(db)) / 3 / 12);
      px[i] += dr * t;
      px[i + 1] += dg * t;
      px[i + 2] += db * t;
    }
  }
}
