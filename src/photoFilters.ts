import type { PhotoAdjust } from './types';

/** [min, max, default] for each adjustment, in percent (warmth = sepia amount; smooth / sharpen = strength). */
export const ADJUST_RANGES: Record<keyof PhotoAdjust, readonly [number, number, number]> = {
  brightness: [50, 150, 100],
  contrast: [50, 150, 100],
  saturate: [0, 200, 100],
  warmth: [0, 60, 0],
  smooth: [0, 100, 0],
  sharpen: [0, 100, 0],
};

export const DEFAULT_ADJUST: PhotoAdjust = { brightness: 100, contrast: 100, saturate: 100, warmth: 0, smooth: 0, sharpen: 0 };

const preset = (name: string, a: Partial<PhotoAdjust>) => ({ name, adjust: { ...DEFAULT_ADJUST, ...a } });
export const PRESETS: { name: string; adjust: PhotoAdjust }[] = [
  preset('Original', {}),
  preset('Portrait', { brightness: 105, saturate: 105, warmth: 6, smooth: 55, sharpen: 30 }),
  preset('Bright', { brightness: 115, contrast: 105, saturate: 105 }),
  preset('Vivid', { brightness: 105, contrast: 115, saturate: 140, sharpen: 20 }),
  preset('Warm', { brightness: 105, saturate: 110, warmth: 25 }),
  preset('Soft', { brightness: 108, contrast: 88, saturate: 90, warmth: 8, smooth: 30 }),
  preset('B & W', { brightness: 105, contrast: 115, saturate: 0, sharpen: 15 }),
];

const KEYS = Object.keys(ADJUST_RANGES) as (keyof PhotoAdjust)[];
export const sameAdjust = (a: PhotoAdjust, b: PhotoAdjust) => KEYS.every((k) => a[k] === b[k]);

/** Stable string of all adjustments, for effect dependencies. */
export const adjustKey = (a: PhotoAdjust) => KEYS.map((k) => a[k]).join(',');
