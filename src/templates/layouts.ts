import { aanganArt, aparajitaArt, ivoryArt, marigoldArt, zariArt } from '../art/svg';
import { gulaalArt, jamuniArt, kajalArt, kandeelArt, mehfilArt, neelArt, patjhadArt, sonaArt, swarnaArt, tulsiArt } from '../art/classic';
import type { Layout } from './types';

const once = <T,>(fn: () => T) => {
  let v: T | undefined;
  return () => (v ??= fn());
};

const ROBOTO = "'Roboto', 'Segoe UI', Arial, sans-serif";

export const zari: Layout = {
  id: 'zari',
  name: 'Zari',
  description: 'Ganesh header, lily corners and a soft mandala',
  defaultHeader: 'ॐ श्री गणेशाय नमः',
  accent: '#6e452a',
  fonts: { body: ROBOTO, header: "'Noto Sans Devanagari', 'Roboto', sans-serif" },
  docxFonts: { body: 'Arial', header: 'Arial', devanagari: 'Mangal' },
  colors: { text: '#292119', label: '#292119' },
  page: { contentLeft: 105, contentTop: 163, contentWidth: 480, contentBottom: 60, labelWidth: 150, rowH: 24.5, fontSize: 13, sectionGap: 20 },
  heading: { style: 'plain', size: 13.7, weight: 700, color: '#6e452a', letterSpacing: 0.1, upper: true, height: 24, marginBottom: 6.7 },
  header: { y: 118, size: 18.4, color: '#3a1007', weight: 700, letterSpacing: 0, upper: false, logo: { y: 9, h: 105, color: '#3a1007' } },
  photo: { x: 595, y: 190, w: 130, h: 170 },
  art: once(() => ({ kind: 'svg' as const, markup: zariArt() })),
};

export const aangan: Layout = {
  id: 'aangan',
  name: 'Aangan',
  description: 'Orange frame, large photo, rounded section bars',
  defaultHeader: 'ॐ श्री गणेशाय नमः',
  accent: '#c25a22',
  fonts: { body: ROBOTO, header: "'Noto Serif Devanagari', 'Roboto', serif" },
  docxFonts: { body: 'Arial', header: 'Arial', devanagari: 'Mangal' },
  colors: { text: '#222222', label: '#222222' },
  page: { contentLeft: 174, contentTop: 352, contentWidth: 446, contentBottom: 70, labelWidth: 150, rowH: 23, fontSize: 12.4, sectionGap: 22 },
  heading: { style: 'pill', size: 12.4, weight: 600, color: '#ffffff', bg: '#9a4d1c', pillW: 199, letterSpacing: 0.6, upper: true, height: 29, marginBottom: 10 },
  header: { y: 38, size: 22, color: '#7a3a14', weight: 700, letterSpacing: 0, upper: false },
  photo: { x: 80, y: 75, w: 200, h: 264 },
  identity: { x: 304, y: 148, nameSize: 24, lineSize: 14, color: '#111111', lineColor: '#777777', gap: 12 },
  art: once(() => ({ kind: 'svg' as const, markup: aanganArt() })),
};

export const ivory: Layout = {
  id: 'ivory',
  name: 'Ivory',
  description: 'Navy ornate frame with underlined headings',
  defaultHeader: '',
  accent: '#5d6c84',
  fonts: { body: ROBOTO, header: "'Playfair Display', Georgia, serif" },
  docxFonts: { body: 'Arial', header: 'Georgia', devanagari: 'Mangal' },
  colors: { text: '#1c1c1c', label: '#1c1c1c' },
  page: { contentLeft: 109, contentTop: 147, contentWidth: 450, contentBottom: 90, labelWidth: 150, rowH: 23, fontSize: 12.4, sectionGap: 22 },
  heading: { style: 'underline', size: 12, weight: 700, color: '#111111', letterSpacing: 0, upper: true, height: 24, marginBottom: 6 },
  header: { y: 120, size: 14, color: '#3d4a60', weight: 600, letterSpacing: 0.6, upper: false, logo: { y: 53, h: 65, color: '#1f2733' } },
  photo: { x: 575, y: 190, w: 130, h: 170 },
  art: once(() => ({ kind: 'svg' as const, markup: ivoryArt() })),
};

export const marigold: Layout = {
  id: 'marigold',
  name: 'Marigold',
  description: 'Gold scrollwork with a Shree Ganeshaya Namah header',
  defaultHeader: '|| SHREE GANESHAYA NAMAH ||',
  accent: '#e0a23a',
  fonts: { body: ROBOTO, header: "'Playfair Display', Georgia, serif" },
  docxFonts: { body: 'Arial', header: 'Georgia', devanagari: 'Mangal' },
  colors: { text: '#1c1c1c', label: '#1c1c1c' },
  page: { contentLeft: 160, contentTop: 173, contentWidth: 474, contentBottom: 150, labelWidth: 149, rowH: 23, fontSize: 12.4, sectionGap: 24 },
  heading: { style: 'center', size: 12.4, weight: 500, color: '#e0a23a', letterSpacing: 0.8, upper: true, height: 24, marginBottom: 9 },
  header: { y: 116, size: 19, color: '#c99a45', weight: 600, letterSpacing: 0.5, upper: true, logo: { y: 20, h: 76, color: '#e8a93e' } },
  photo: { x: 595, y: 222, w: 130, h: 170 },
  art: once(() => ({ kind: 'svg' as const, markup: marigoldArt() })),
};

export const aparajita: Layout = {
  id: 'aparajita',
  name: 'Aparajita',
  description: 'Blue watercolour florals',
  defaultHeader: '',
  accent: '#2f4a7c',
  fonts: { body: ROBOTO, header: "'Playfair Display', Georgia, serif" },
  docxFonts: { body: 'Arial', header: 'Georgia', devanagari: 'Mangal' },
  colors: { text: '#161616', label: '#161616' },
  page: { contentLeft: 219, contentTop: 148, contentWidth: 360, contentBottom: 90, labelWidth: 104, rowH: 23, fontSize: 12.4, sectionGap: 22 },
  heading: { style: 'plain', size: 13, weight: 500, color: '#2b3d6b', letterSpacing: 0.2, upper: true, height: 24, marginBottom: 6 },
  header: { y: 78, size: 18, color: '#2b3d6b', weight: 600, letterSpacing: 0.4, upper: false },
  photo: { x: 595, y: 190, w: 130, h: 170 },
  art: once(() => ({ kind: 'svg' as const, markup: aparajitaArt() })),
};

/* ---------- "classic" family: serif text, coloured tag headings, photo top-right ---------- */

const TINOS = "'Tinos', 'Times New Roman', Georgia, serif";

function classic(o: {
  id: string;
  name: string;
  description: string;
  accent: string;
  /** label / value text colours */
  label: string;
  text: string;
  /** heading tag background and text colour */
  tag: [string, string];
  art: () => string;
  /** Logo box; header text sits just below it. Defaults suit frames whose top centre is clear below y=48. */
  logo?: { y: number; h: number };
  /** Colour for the built-in logo and header text (defaults to the label colour). */
  ink?: string;
  page?: Partial<Layout['page']>;
  photo?: Partial<Layout['photo']>;
  heading?: Partial<Layout['heading']>;
}): Layout {
  const logo = o.logo ?? { y: 50, h: 60 };
  const headerY = logo.y + logo.h + 4;
  // content starts under logo + one header line; without either it moves back up to compactTop (see placed())
  const contentTop = headerY + 46;
  const ink = o.ink ?? o.label;
  return {
    id: o.id,
    name: o.name,
    description: o.description,
    defaultHeader: 'ॐ श्री गणेशाय नमः',
    accent: o.accent,
    fonts: { body: TINOS, header: "'Noto Serif Devanagari', 'Tinos', serif" },
    docxFonts: { body: 'Times New Roman', header: 'Times New Roman', devanagari: 'Mangal' },
    colors: { text: o.text, label: o.label },
    page: { contentLeft: 88, contentTop, compactTop: 128, contentWidth: 460, contentBottom: 80, labelWidth: 175, rowH: 24, fontSize: 13.4, sectionGap: 22, ...o.page },
    heading: { style: 'tag', size: 14.5, weight: 700, color: o.tag[1], bg: o.tag[0], letterSpacing: 0.2, upper: false, height: 24, marginBottom: 8, radius: 1, ...o.heading },
    header: { y: headerY, size: 18, color: ink, weight: 700, letterSpacing: 0.3, upper: false, logo: { ...logo, color: ink } },
    photo: { x: 568, y: contentTop, w: 160, h: 205, ...o.photo },
    art: once(() => ({ kind: 'svg' as const, markup: o.art() })),
  };
}

export const swarna = classic({
  id: 'swarna', name: 'Swarna', description: 'Gold scroll frame on warm beige',
  accent: '#c18a2e', label: '#2b2118', text: '#2b2118', tag: ['#f0b552', '#3d1f05'], art: swarnaArt,
});

export const gulaal = classic({
  id: 'gulaal', name: 'Gulaal', description: 'Gold frame on a yellow-to-pink blush',
  accent: '#d9579b', label: '#7a2e62', text: '#2a1a22', tag: ['#eaa646', '#3d1f05'], art: gulaalArt,
});

export const jamuni = classic({
  id: 'jamuni', name: 'Jamuni', description: 'Purple swirl corners, maroon headings',
  accent: '#8b2a6a', label: '#8b2a6a', text: '#2a1a22', tag: ['#7b1a4a', '#ffffff'], art: jamuniArt,
  photo: { border: '2px solid #5a1838' },
});

export const mehfil = classic({
  id: 'mehfil', name: 'Mehfil', description: 'Woven magenta and gold ribbons',
  accent: '#97286a', label: '#c0612a', text: '#222222', tag: ['#e4844a', '#ffffff'], art: mehfilArt,
  logo: { y: 66, h: 54 }, page: { compactTop: 136 },
});

export const tulsi = classic({
  id: 'tulsi', name: 'Tulsi', description: 'Leafy green vines with gold flowers',
  accent: '#6f8f3a', label: '#7d6a1c', text: '#222222', tag: ['#c9a53e', '#2a2208'], art: tulsiArt,
});

export const neel = classic({
  id: 'neel', name: 'Neel', description: 'Blue watercolour wash, white frame',
  accent: '#3d8ca3', label: '#8a5a12', text: '#13262c', tag: ['#ffffff', '#123c4a'], art: neelArt, ink: '#123c4a',
  photo: { border: '3px solid #ffffff' },
});

export const patjhad = classic({
  id: 'patjhad', name: 'Patjhad', description: 'Autumn maple leaves on soft grey',
  accent: '#d9772a', label: '#b0602a', text: '#222222', tag: ['#ebb24c', '#3b2205'], art: patjhadArt,
});

export const kajal = classic({
  id: 'kajal', name: 'Kajal', description: 'Dark filigree frame on slate grey',
  accent: '#3a433d', label: '#121513', text: '#121513', tag: ['#262c28', '#f2efe6'], art: kajalArt,
  photo: { border: '2px solid #232824' },
});

export const sona = classic({
  id: 'sona', name: 'Sona', description: 'Art-deco gold lines with a sand border',
  accent: '#c3964b', label: '#a6761f', text: '#222222', tag: ['#d8a84e', '#2e1c04'], art: sonaArt,
});

export const kandeel = classic({
  id: 'kandeel', name: 'Kandeel', description: 'Hanging lanterns on amber, large headings',
  accent: '#e8a63c', label: '#9a6614', text: '#2a1c0c', tag: ['', ''], art: kandeelArt,
  heading: { style: 'plain', size: 19, weight: 700, color: '#2a1c0c', height: 28, marginBottom: 6 },
  page: { compactTop: 140 },
});
