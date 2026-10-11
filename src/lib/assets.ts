import type { BioData } from '../types';
import { cropToDataUrl, tintLogo } from './image';
import { DEFAULT_ADJUST, sameAdjust } from '../photoFilters';
import { applyLook } from './retouch';

export const DEFAULT_LOGO = `${import.meta.env.BASE_URL}assets/ganesh-logo.png`;

/** The logo as it should be drawn on a template whose logo colour is `color` (undefined = no logo). */
export async function resolveLogo(data: BioData, color?: string): Promise<string | undefined> {
  if (!color || !data.showLogo) return undefined;
  if (data.logo.src) return data.logo.recolor ? tintLogo(data.logo.src, color, true) : data.logo.src;
  return tintLogo(DEFAULT_LOGO, color, false);
}

/** The photo cropped to exactly the template's photo frame (w x h layout px, rendered at `density`x). */
export async function resolvePhoto(data: BioData, w: number, h: number, density = 3): Promise<string | undefined> {
  if (!data.photo.src) return undefined;
  const { zoom, x, y, src, adjust } = data.photo;
  const post = sameAdjust(adjust, DEFAULT_ADJUST)
    ? undefined
    : (c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        const image = ctx.getImageData(0, 0, c.width, c.height);
        applyLook(image.data, c.width, c.height, adjust);
        ctx.putImageData(image, 0, 0);
      };
  return cropToDataUrl(src, zoom, x, y, w * density, h * density, post);
}
