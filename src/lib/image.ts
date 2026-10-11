export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

export const MAX_UPLOAD_MB = 15;
/** Decoded size limit; bigger images can exhaust memory on phones (and are never needed for a biodata). */
const MAX_PIXELS = 50_000_000;

export function canvas2d(w: number, h: number, opts?: CanvasRenderingContext2DSettings) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', opts);
  if (!ctx) throw new Error('The browser ran out of memory while processing the image. Try a smaller image.');
  return { c, ctx };
}

/**
 * Validates an uploaded image and re-encodes it, downsized, as a data URL (small enough for localStorage).
 * Re-drawing through a canvas also strips metadata (EXIF/GPS) and anything that isn't pixels.
 * `keepAlpha` = PNG (logos need transparency); otherwise JPEG on white (photos, far smaller).
 * Throws an Error with a message meant for the user.
 */
export async function fileToDataUrl(file: File, maxDim: number, keepAlpha: boolean): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG or PNG).');
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please use one under ${MAX_UPLOAD_MB} MB.`);
  }
  const url = URL.createObjectURL(file);
  try {
    let img: HTMLImageElement;
    try {
      img = await loadImage(url);
    } catch {
      throw new Error('This image could not be opened. It may be damaged or in an unsupported format (e.g. HEIC); please use a JPG or PNG.');
    }
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) throw new Error('This image has no size information. Please use a JPG or PNG.');
    if (w * h > MAX_PIXELS) throw new Error(`This image is ${w} x ${h} pixels, which is too large. Please use a smaller one.`);
    const s = Math.min(1, maxDim / Math.max(w, h));
    const { c, ctx } = canvas2d(Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)));
    if (!keepAlpha) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL(keepAlpha ? 'image/png' : 'image/jpeg', 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Crops `src` to exactly outW x outH using the same zoom/pan model as the editor sliders. */
export async function cropToDataUrl(
  src: string,
  zoom: number,
  x: number,
  y: number,
  outW: number,
  outH: number,
  /** canvas filter, e.g. 'brightness(110%) saturate(0%)' */
  filter = 'none',
  /** optional pixel post-processing on the cropped result (sharpen, smoothing ...) */
  post?: (c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void,
): Promise<string> {
  const img = await loadImage(src);
  const base = Math.max(outW / img.naturalWidth, outH / img.naturalHeight);
  const sc = base * zoom;
  const dw = img.naturalWidth * sc;
  const dh = img.naturalHeight * sc;
  const maxX = (dw - outW) / 2;
  const maxY = (dh - outH) / 2;
  const dx = (outW - dw) / 2 - (x / 100) * maxX;
  const dy = (outH - dh) / 2 - (y / 100) * maxY;
  const { c, ctx } = canvas2d(Math.round(outW), Math.round(outH), post ? { willReadFrequently: true } : undefined);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.filter = filter; // after the white fill, so only the photo is adjusted
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  post?.(c, ctx);
  return c.toDataURL('image/jpeg', 0.92);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

/** Recoloured logos, newest last. Bounded so re-uploading logos or switching templates can't grow memory forever. */
const tintCache = new Map<string, Promise<string>>();
const TINT_CACHE_MAX = 12;

export function clearImageCaches() {
  tintCache.clear();
}

/**
 * Re-colours a logo to `color`.
 *  - fromDarkness=false: keeps the image's own transparency (built-in logo).
 *  - fromDarkness=true : a black-on-white logo; darkness becomes opacity so white disappears.
 */
export function tintLogo(src: string, color: string, fromDarkness: boolean): Promise<string> {
  const key = `${fromDarkness ? 1 : 0}|${color}|${src.length}|${src.slice(-64)}`;
  const hit = tintCache.get(key);
  if (hit) {
    tintCache.delete(key); // re-insert to mark as recently used
    tintCache.set(key, hit);
    return hit;
  }
  const p = (async () => {
    const img = await loadImage(src);
    const s = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
    const { c, ctx } = canvas2d(Math.max(1, Math.round(img.naturalWidth * s)), Math.max(1, Math.round(img.naturalHeight * s)), {
      willReadFrequently: true,
    });
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    const [r, g, b] = hexToRgb(color);
    for (let i = 0; i < px.length; i += 4) {
      let a = px[i + 3];
      if (fromDarkness) {
        const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        a = Math.round((255 - lum) * (px[i + 3] / 255));
        a = Math.max(0, Math.min(255, Math.round(((a - 14) * 255) / 241)));
      }
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = a;
    }
    ctx.putImageData(data, 0, 0);
    return c.toDataURL('image/png');
  })();
  tintCache.set(key, p);
  if (tintCache.size > TINT_CACHE_MAX) tintCache.delete(tintCache.keys().next().value!);
  p.catch(() => tintCache.delete(key)); // don't remember failures, so a later render can retry
  return p;
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.split(',')[1] ?? '';
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // generous delay: mobile Safari may still be handing the file to its download / share sheet
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
