import type { Layout } from './types';

/**
 * Quick way to add a template from a design image: drop a 794 x 1123 (or any A4-ratio) PNG/JPG that has
 * the border/flowers/background but NO text into `public/templates/`, then describe where the text goes.
 *
 *   export const toran = imageLayout({
 *     ...zari,                      // start from an existing layout and override what differs
 *     id: 'toran', name: 'Toran', description: 'Mango-leaf toran',
 *     bg: '/templates/toran.png',
 *   });
 *
 * and register it in templates/index.ts.
 */
export function imageLayout(def: Omit<Layout, 'art'> & { bg: string }): Layout {
  const { bg, ...rest } = def;
  return { ...rest, art: () => ({ kind: 'image', src: bg }) };
}
