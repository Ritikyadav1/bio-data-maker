import html2canvas from 'html2canvas';
import { PAGE_H, PAGE_W } from '../templates/LayoutPage';

export const EXPORT_SURFACE_ID = 'export-surface';

/** Rasterises the off-screen full-size page. `bgOnly` hides all text/photo and keeps just the artwork. */
export async function captureSurface(opts: { scale?: number; bgOnly?: boolean } = {}): Promise<HTMLCanvasElement> {
  const el = document.getElementById(EXPORT_SURFACE_ID);
  if (!el) throw new Error('Export surface not mounted');
  await document.fonts?.ready;
  // let the layout effect (auto-fit) and any pending image decodes settle
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const small = window.innerWidth < 900 && navigator.maxTouchPoints > 0;
  return html2canvas(el, {
    scale: opts.scale ?? (small ? 2 : 3),
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    width: PAGE_W,
    height: PAGE_H,
    windowWidth: PAGE_W,
    windowHeight: PAGE_H,
    onclone: (_doc, clone) => {
      const wrap = clone.parentElement;
      if (wrap) {
        wrap.style.left = '0px';
        wrap.style.top = '0px';
      }
      clone.style.transform = 'none';
      if (opts.bgOnly) clone.classList.add('bd-bgonly');
    },
  });
}
