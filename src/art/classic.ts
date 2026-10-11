/**
 * Artwork for the "classic" templates: coloured backgrounds with gold frames, swirls, vines, leaves and
 * lanterns. Same rules as svg.ts: plain SVG strings on the 794 x 1123 page, no external assets.
 * Filter / gradient ids are prefixed per template because several pages can be on screen at once.
 */
import { cornersAt, cornerOrnament, leafShape, lens, mulberry32, n, polar, rpetal, spiral } from './svg';

const W = 794;
const H = 1123;

const svg = (body: string, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;

const frameRect = (inset: number, color: string, sw: number, rx = 0) =>
  `<rect x="${inset}" y="${inset}" width="${W - 2 * inset}" height="${H - 2 * inset}" rx="${rx}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;

/** Symmetric scroll flourish centred on (x,y); its centre leaf points "up" before rotation. */
function scrollMotif(x: number, y: number, color: string, s = 1, rot = 0, sw = 1.8) {
  const half = `<path d="M6,-2 C20,-18 46,-20 60,-6 C72,6 64,24 50,22 C40,20 40,8 49,7"/>
    <path d="M60,-6 C80,-16 104,-14 122,-2"/>
    <path d="${spiral(126, 4, 0.8, 7, 1.7, 270, 1)}"/>
    <path d="M28,6 C40,18 60,30 86,26"/>
    ${leafShape(86, 26, 18, -20, color, color, 0.8)}
    ${leafShape(98, -10, 14, -150, color, color, 0.8)}`;
  return `<g transform="translate(${n(x)},${n(y)}) rotate(${rot}) scale(${s})" fill="none" stroke="${color}" stroke-width="${n(sw / s)}" stroke-linecap="round">
    <g>${half}</g><g transform="scale(-1,1)">${half}</g>
    <path d="${lens(24, 8)}" fill="${color}" stroke="none"/>
    <circle cx="0" cy="7" r="3" fill="${color}" stroke="none"/>
  </g>`;
}

/** Gold double frame with scroll corners and a flourish in the middle of each side. */
function goldFrame(c: string) {
  return `${frameRect(20, c, 3)}${frameRect(28, c, 1)}
    ${cornersAt(W, H, 14, c, 2, true, 150)}
    ${scrollMotif(W / 2, 24, c, 1, 180)}${scrollMotif(W / 2, H - 24, c, 1, 0)}
    ${scrollMotif(24, H / 2, c, 0.9, 90)}${scrollMotif(W - 24, H / 2, c, 0.9, -90)}`;
}

/** Soft, blurred colour clouds that read as a watercolour wash. */
function wash(seed: number, colors: string[], count: number, filterId: string, opacity = 0.55) {
  const r = mulberry32(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const cx = r() * W;
    const cy = r() * H;
    out.push(
      `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(120 + r() * 220)}" ry="${n(70 + r() * 140)}" transform="rotate(${n(r() * 180)} ${n(cx)} ${n(cy)})" fill="${colors[i % colors.length]}" opacity="${opacity}"/>`,
    );
  }
  return `<g filter="url(#${filterId})">${out.join('')}</g>`;
}
const blurFilter = (id: string, sd: number) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

/* ------------------------------------------------------------------ Swarna / Gulaal: gold frame */

export function swarnaArt() {
  return svg(`<rect width="${W}" height="${H}" fill="#f4efe5"/>${goldFrame('#c18a2e')}`);
}

export function gulaalArt() {
  return svg(
    `<rect width="${W}" height="${H}" fill="url(#gl-bg)"/>${goldFrame('#bf8a26')}`,
    `<linearGradient id="gl-bg" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0" stop-color="#fbeaa0"/><stop offset=".45" stop-color="#fbd2cf"/><stop offset="1" stop-color="#f6a9ea"/>
    </linearGradient>`,
  );
}

/* ------------------------------------------------------------------ Jamuni: purple swirls */

function swirlCluster(c: string, size: number) {
  const k = size / 220;
  const s = [
    cornerOrnament(c, 3, true, 220),
    `<path d="${spiral(150, 34, 1.5, 20, 2.2, 90, 1)}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>`,
    `<path d="${spiral(36, 150, 1.5, 20, 2.2, 0, -1)}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>`,
    `<path d="${spiral(196, 18, 1, 10, 1.8, 180, 1)}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
    `<path d="${spiral(18, 196, 1, 10, 1.8, 90, -1)}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
    `<path d="M170,30 C210,40 250,20 290,14 M30,170 C40,210 20,250 14,290" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
  ];
  for (const [x, y, r] of [[84, 84, 5], [120, 66, 3.5], [66, 120, 3.5], [240, 30, 3], [30, 240, 3]] as const) {
    s.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`);
  }
  return `<g transform="scale(${n(k)})">${s.join('')}</g>`;
}

export function jamuniArt() {
  const c = '#8b2a6a';
  return svg(`<rect width="${W}" height="${H}" fill="#fdf4ec"/>
    <g transform="translate(${W - 6},6) scale(-1,1)">${swirlCluster(c, 230)}</g>
    <g transform="translate(6,${H - 6}) scale(1,-1)">${swirlCluster(c, 230)}</g>
    <g transform="translate(10,10)">${cornerOrnament(c, 2.2, true, 110)}</g>
    <g transform="translate(${W - 10},${H - 10}) scale(-1,-1)">${cornerOrnament(c, 2.2, true, 110)}</g>`);
}

/* ------------------------------------------------------------------ Mehfil: woven ribbons top and bottom */

function wave(y: number, amp: number, period: number, phase: number, color: string, sw: number, x0 = 60, x1 = W - 60) {
  let d = '';
  for (let x = x0; x <= x1; x += 4) {
    d += `${x === x0 ? 'M' : 'L'}${x},${n(y + amp * Math.sin(phase + ((x - x0) / period) * 2 * Math.PI))} `;
  }
  return `<path d="${d.trim()}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

export function mehfilArt() {
  const m = '#97286a';
  const g = '#d39b35';
  const band = (y: number) => `${wave(y, 9, 110, 0, m, 3.2)}${wave(y, 9, 110, Math.PI, g, 2.2)}`;
  const dots = (x: number) =>
    `<circle cx="${x}" cy="${H / 2}" r="8" fill="${m}"/><circle cx="${x}" cy="${H / 2 - 26}" r="3.5" fill="${g}"/><circle cx="${x}" cy="${H / 2 + 26}" r="3.5" fill="${g}"/>`;
  return svg(`<rect width="${W}" height="${H}" fill="#ffffff"/>
    ${band(34)}${band(H - 34)}
    <path d="M60,58 L${W - 60},58 M60,${H - 58} L${W - 60},${H - 58}" stroke="${g}" stroke-width="1.2"/>
    <path d="M30,150 L30,${H - 150} M${W - 30},150 L${W - 30},${H - 150}" stroke="${g}" stroke-width="1.4"/>
    ${dots(30)}${dots(W - 30)}
    ${cornersAt(W, H, 6, m, 2.4, true, 130)}`);
}

/* ------------------------------------------------------------------ Tulsi: green vines with gold flowers */

function goldFlower(x: number, y: number, R: number, c = '#d6a630') {
  const p: string[] = [];
  for (let i = 0; i < 5; i++) p.push(`<path d="${rpetal(R, R * 0.55)}" transform="translate(${n(x)},${n(y)}) rotate(${i * 72})" fill="${c}" stroke="#a87a17" stroke-width=".8"/>`);
  return p.join('') + `<circle cx="${n(x)}" cy="${n(y)}" r="${n(R * 0.25)}" fill="#8a5a10"/>`;
}

/** A leafy vine from (x0,y0) to (x1,y1). */
function vine(x0: number, y0: number, x1: number, y1: number, seed: number) {
  const r = mulberry32(seed);
  const L = Math.hypot(x1 - x0, y1 - y0);
  const deg = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  const yAt = (x: number) => 5 * Math.sin((x / 70) * 2 * Math.PI);
  let d = '';
  for (let x = 0; x <= L; x += 5) d += `${x ? 'L' : 'M'}${n(x)},${n(yAt(x))} `;
  const parts = [`<path d="${d}" fill="none" stroke="#5d7a2c" stroke-width="1.6"/>`];
  const greens = ['#6f8f3a', '#86a64a', '#58772a'];
  for (let x = 14, side = 1; x < L - 10; x += 22 + r() * 8, side = -side) {
    parts.push(leafShape(x, yAt(x), 18 + r() * 8, side * (40 + r() * 20), greens[Math.floor(r() * 3)], '#4c6922', 0.6));
  }
  for (let x = 90 + r() * 40; x < L - 40; x += 170 + r() * 60) parts.push(goldFlower(x, yAt(x), 8));
  return `<g transform="translate(${n(x0)},${n(y0)}) rotate(${n(deg)})">${parts.join('')}</g>`;
}

export function tulsiArt() {
  const corner = (x: number, y: number) => `${goldFlower(x, y, 16)}${goldFlower(x + (x < W / 2 ? 26 : -26), y, 9)}${goldFlower(x, y + (y < H / 2 ? 26 : -26), 9)}`;
  return svg(`<rect width="${W}" height="${H}" fill="#fbfaf4"/>
    ${vine(26, 70, 26, H - 70, 3)}${vine(W - 26, 70, W - 26, H - 70, 7)}
    ${vine(W - 300, 26, W - 60, 26, 11)}${vine(60, H - 26, 300, H - 26, 13)}${vine(W - 300, H - 26, W - 60, H - 26, 17)}
    ${corner(30, 30)}${corner(W - 30, 30)}${corner(30, H - 30)}${corner(W - 30, H - 30)}`);
}

/* ------------------------------------------------------------------ Neel: blue watercolour, white frame */

export function neelArt() {
  return svg(
    `<rect width="${W}" height="${H}" fill="#b3dbe3"/>
    ${wash(26, ['#8cc5d2', '#c9e8ee', '#6fb1c3', '#a5d4de', '#e2f3f5'], 16, 'nl-blur')}
    ${frameRect(26, '#ffffff', 5)}`,
    blurFilter('nl-blur', 34),
  );
}

/* ------------------------------------------------------------------ Patjhad: autumn maple leaves */

function maple(x: number, y: number, R: number, rot: number, fill: string) {
  // right half outline from the stem round to the top tip, as (angle, radius) pairs; mirrored for the left half
  const half: [number, number][] = [
    [180, 0.12], [160, 0.3], [135, 0.58], [120, 0.38], [102, 0.55], [88, 0.86], [74, 0.52], [62, 0.6], [50, 0.4],
    [34, 0.74], [22, 0.62], [10, 0.82], [0, 1],
  ];
  const pts = [...half, ...half.slice(0, -1).reverse().map(([a, r]) => [-a, r] as [number, number])];
  const d = pts.map(([a, r], i) => { const [px, py] = polar(0, 0, r * R, a); return `${i ? 'L' : 'M'}${n(px)},${n(py)}`; }).join(' ') + ' Z';
  const veins = [0, 88, -88, 135, -135].map((a) => { const [px, py] = polar(0, 0, R * (a === 0 ? 0.9 : Math.abs(a) > 100 ? 0.5 : 0.78), a); return `M0,0 L${n(px)},${n(py)}`; }).join(' ');
  const [sx, sy] = polar(0, 0, R * 0.5, 180);
  return `<g transform="translate(${n(x)},${n(y)}) rotate(${rot})">
    <path d="${d}" fill="${fill}" stroke="#9c4a14" stroke-width="1" stroke-linejoin="round" opacity=".95"/>
    <path d="${veins} M0,0 L${n(sx)},${n(sy)}" stroke="#8a3e10" stroke-width="1.1" fill="none" opacity=".7"/>
  </g>`;
}

export function patjhadArt() {
  return svg(
    `<rect width="${W}" height="${H}" fill="#f2f4f4"/>
    ${wash(27, ['#dde4e8', '#e9eded', '#d3dbe0', '#f7f8f8'], 14, 'pj-blur', 0.7)}
    ${maple(704, 48, 58, 200, '#e38b2c')}${maple(626, 22, 40, 150, '#c9631e')}${maple(772, 140, 34, 245, '#f0a43c')}
    ${maple(744, 1064, 66, -25, '#d9772a')}${maple(660, 1100, 38, 15, '#efa23e')}${maple(784, 960, 30, -70, '#c9631e')}`,
    blurFilter('pj-blur', 40),
  );
}

/* ------------------------------------------------------------------ Kajal: dark filigree frame on grey */

export function kajalArt() {
  const c = '#232824';
  const edge: string[] = [];
  for (const x of [250, W / 2, W - 250]) edge.push(scrollMotif(x, 30, c, 0.55, 180, 1.6), scrollMotif(x, H - 30, c, 0.55, 0, 1.6));
  for (const y of [340, H / 2, H - 340]) edge.push(scrollMotif(30, y, c, 0.55, 90, 1.6), scrollMotif(W - 30, y, c, 0.55, -90, 1.6));
  return svg(`<rect width="${W}" height="${H}" fill="#8f9791"/>
    ${frameRect(10, c, 8)}${frameRect(24, c, 1.5)}
    ${cornersAt(W, H, 16, c, 2.4, true, 170)}${edge.join('')}`);
}

/* ------------------------------------------------------------------ Sona: deco gold frame */

export function sonaArt() {
  const g = '#c3964b';
  const i = 42;
  const sq = (x: number, y: number) =>
    `<rect x="${x - 14}" y="${y - 14}" width="28" height="28" fill="#fffdf8" stroke="${g}" stroke-width="1.6"/><rect x="${x - 6}" y="${y - 6}" width="12" height="12" fill="none" stroke="${g}" stroke-width="1"/>`;
  return svg(`<rect width="${W}" height="${H}" fill="#dbbb86"/>
    <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="4" fill="#fffdf8"/>
    ${frameRect(i, g, 1.6)}${frameRect(i + 7, g, 0.8)}
    ${sq(i + 3, i + 3)}${sq(W - i - 3, i + 3)}${sq(i + 3, H - i - 3)}${sq(W - i - 3, H - i - 3)}`);
}

/* ------------------------------------------------------------------ Kandeel: hanging lanterns on amber */

function lantern(x: number, top: number, len: number, s: number) {
  return `<path d="M${x},${top} L${x},${top + len}" />
  <g transform="translate(${x},${top + len}) scale(${s})">
    <path d="M-10,0 L10,0 L16,10 L-16,10 Z"/>
    <path d="M-16,10 C-34,30 -34,70 -16,90 L16,90 C34,70 34,30 16,10 Z" fill="#fff5e0" fill-opacity=".25"/>
    <path d="M-6,10 C-14,35 -14,65 -6,90 M6,10 C14,35 14,65 6,90 M-27,50 L27,50"/>
    <path d="M-12,90 L12,90 L8,100 L-8,100 Z"/>
    <path d="M0,100 L0,120 M-4,102 L-7,124 M4,102 L7,124"/>
  </g>`;
}

export function kandeelArt() {
  return svg(
    `<rect width="${W}" height="${H}" fill="url(#kd-bg)"/>
    <g fill="none" stroke="#fff4dc" stroke-width="1.6" stroke-linejoin="round" opacity=".8">
      ${lantern(590, 0, 6, 0.75)}${lantern(668, 0, 14, 0.85)}${lantern(752, 0, 34, 0.9)}
      <path d="M0,968 Q120,1020 250,975"/>
      ${lantern(54, 990, 10, 0.75)}${lantern(132, 1000, 14, 0.7)}${lantern(204, 986, 8, 0.72)}
    </g>`,
    `<linearGradient id="kd-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde4b0"/><stop offset="1" stop-color="#f6cb86"/></linearGradient>`,
  );
}
