/**
 * Original decorative artwork, generated as SVG strings (no external assets, so it renders the
 * same in the preview, in PDF export and when rasterised as the DOCX background).
 */

export type Rng = () => number;

export const n = (x: number) => String(Math.round(x * 100) / 100);

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = (r: Rng, a: number, b: number) => a + (b - a) * r();

export function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

const ring = (cx: number, cy: number, r: number, color: string, sw: number, dash?: string) =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${color}" stroke-width="${sw}"${
    dash ? ` stroke-dasharray="${dash}" stroke-linecap="round"` : ''
  }/>`;

/** Pointed petal, base at (0,0), tip at (0,-L). */
export function lens(L: number, W: number, skew = 0) {
  return (
    `M0,0 C${n(-W * 0.95)},${n(-L * 0.22)} ${n(-W * 0.75 + skew)},${n(-L * 0.78)} ${n(skew * 0.5)},${n(-L)} ` +
    `C${n(W * 0.75 + skew)},${n(-L * 0.78)} ${n(W * 0.95)},${n(-L * 0.22)} 0,0 Z`
  );
}

/** Rounded, broad petal. */
export function rpetal(L: number, W: number, skew = 0) {
  return (
    `M0,0 C${n(-W)},${n(-L * 0.12)} ${n(-W * 1.15 + skew)},${n(-L * 0.72)} ${n(-W * 0.35 + skew)},${n(-L * 0.96)} ` +
    `Q${n(skew)},${n(-L * 1.05)} ${n(W * 0.35 + skew)},${n(-L * 0.96)} ` +
    `C${n(W * 1.15 + skew)},${n(-L * 0.72)} ${n(W)},${n(-L * 0.12)} 0,0 Z`
  );
}

export function spiral(cx: number, cy: number, r0: number, r1: number, turns: number, startDeg = 0, dir = 1) {
  const steps = Math.max(8, Math.round(turns * 30));
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = r1 + (r0 - r1) * t;
    const a = startDeg + dir * turns * 360 * t;
    const [x, y] = polar(cx, cy, r, a);
    d += `${i === 0 ? 'M' : 'L'}${n(x)},${n(y)} `;
  }
  return d.trim();
}

/* ------------------------------------------------------------------ mandala watermark */

export function mandala(
  cx: number,
  cy: number,
  o: { blue?: string; pink?: string; opacity?: number; scale?: number } = {},
) {
  const blue = o.blue ?? '#dce7ea';
  const pink = o.pink ?? '#f3d9d7';
  const out: string[] = [];

  const petals = (count: number, r0: number, r1: number, wd: number, color: string, sw: number, offset = 0, inner = true) => {
    const s: string[] = [];
    for (let i = 0; i < count; i++) {
      const a = offset + (360 * i) / count;
      let body = `<path d="${lens(r1 - r0, wd)}"/>`;
      if (inner) {
        body += `<path d="${lens((r1 - r0) * 0.7, wd * 0.6)}" transform="translate(0,${n(-(r1 - r0) * 0.04)})"/>`;
      }
      s.push(`<g transform="translate(${cx},${cy}) rotate(${n(a)}) translate(0,${n(-r0)})">${body}</g>`);
    }
    return `<g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round">${s.join('')}</g>`;
  };

  const scallops = (count: number, r: number, rad: number, color: string, sw: number) => {
    const s: string[] = [];
    for (let i = 0; i < count; i++) {
      const [x0, y0] = polar(cx, cy, r, (360 * i) / count);
      const [x1, y1] = polar(cx, cy, r, (360 * (i + 1)) / count);
      s.push(`M${n(x0)},${n(y0)} A${rad},${rad} 0 0 1 ${n(x1)},${n(y1)}`);
    }
    return `<path d="${s.join(' ')}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
  };

  const paisley = (r: number, deg: number, scale: number, color: string, sw: number) => {
    const [x, y] = polar(cx, cy, r, deg);
    const d = 'M0,0 C16,-8 36,2 34,26 C32,50 4,60 -10,46 C-22,33 -10,16 6,20 C16,23 18,34 9,38';
    const d2 = 'M4,-4 C20,-14 44,-2 42,28';
    return `<g transform="translate(${n(x)},${n(y)}) rotate(${n(deg)}) scale(${scale})" fill="none" stroke="${color}" stroke-width="${n(
      sw / scale,
    )}" stroke-linecap="round"><path d="${d}"/><path d="${d2}"/></g>`;
  };

  const tulip = (x: number, y: number, s: number, deg: number, color: string, sw: number) => {
    const centre = 'M0,0 C-11,-14 -9,-36 0,-50 C9,-36 11,-14 0,0 Z';
    const left = 'M0,0 C-24,-6 -32,-28 -24,-44 C-13,-37 -4,-22 0,0';
    const right = 'M0,0 C24,-6 32,-28 24,-44 C13,-37 4,-22 0,0';
    const leafs = 'M0,6 C-8,16 -24,18 -34,10 M0,6 C8,16 24,18 34,10';
    return `<g transform="translate(${x},${y}) rotate(${deg}) scale(${s})" fill="none" stroke="${pink}" stroke-width="${n(
      sw / s,
    )}" stroke-linejoin="round" stroke-linecap="round"><path d="${left}"/><path d="${right}"/><path d="${centre}"/><path d="${leafs}"/></g>`;
  };

  out.push(ring(cx, cy, 428, blue, 3, '1 9'));
  out.push(scallops(24, 414, 34, blue, 1.8));
  out.push(scallops(48, 402, 14, pink, 1.3));
  out.push(petals(12, 238, 402, 56, blue, 2.0, 15));
  for (let k = 0; k < 12; k++) {
    out.push(paisley(352, 30 * k, 0.9, blue, 1.6));
    out.push(paisley(352, 30 * k + 15, 0.55, pink, 1.4));
  }
  out.push(ring(cx, cy, 232, blue, 1.6));
  out.push(scallops(60, 226, 9, blue, 1.4));
  out.push(petals(48, 236, 262, 7, blue, 1.1, 0, false));
  out.push(ring(cx, cy, 214, blue, 1.4));
  for (let i = 0; i < 18; i++) {
    const [x, y] = polar(cx, cy, 206, (360 * i) / 18 + 10);
    out.push(ring(Math.round(x * 10) / 10, Math.round(y * 10) / 10, 3.2, blue, 1.4));
  }
  out.push(petals(36, 140, 176, 8, blue, 1.1, 5, false));
  out.push(petals(18, 126, 212, 30, blue, 1.8));
  out.push(ring(cx, cy, 120, blue, 1.4, '1 7'));
  out.push(petals(12, 16, 114, 27, pink, 1.9));
  out.push(petals(12, 16, 76, 18, pink, 1.7, 15));
  out.push(ring(cx, cy, 16, pink, 2.2));
  out.push(ring(cx, cy, 8, pink, 2.0));
  out.push(ring(cx, cy, 36, pink, 2.4, '1 6'));
  for (const [x, y, s, deg] of [
    [258, 336, 0.9, -25],
    [582, 300, 0.9, 20],
    [640, 392, 0.8, 55],
    [96, 520, 0.8, -65],
    [736, 548, 0.95, 70],
    [262, 958, 0.9, -150],
    [520, 1004, 0.9, 175],
    [738, 900, 0.8, 130],
    [150, 770, 0.8, -100],
  ] as const) {
    // tulips are positioned relative to the 926x1311 reference page, so shift them with the centre
    out.push(tulip(x - 460 + cx, y - 650 + cy, s, deg, pink, 1.6));
  }
  const sc = o.scale ?? 1;
  return `<g opacity="${o.opacity ?? 0.72}" transform="translate(${cx},${cy}) scale(${sc}) translate(${-cx},${-cy})">${out.join('')}</g>`;
}

/* ------------------------------------------------------------------ grey line-art flowers */

const INK = '#3b3b3d';

export function leaf(x: number, y: number, L: number, W: number, deg: number, sw = 1.4, veins = 7, ink = INK) {
  const parts = [
    `<path d="${lens(L, W)}" fill="#fafafa" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`,
    `<path d="M0,${n(-L * 0.04)} L0,${n(-L * 0.92)}" stroke="${ink}" stroke-width="${n(sw * 0.8)}" fill="none"/>`,
  ];
  for (let i = 0; i < veins; i++) {
    const t = 0.14 + (0.72 * i) / (veins - 1);
    const wv = W * 0.82 * Math.pow(Math.sin(Math.PI * Math.min(0.98, t + 0.05)), 0.8);
    parts.push(
      `<path d="M0,${n(-L * t)} Q${n(wv * 0.5)},${n(-L * (t + 0.05))} ${n(wv)},${n(-L * (t + 0.17))}" stroke="${ink}" stroke-width="0.8" fill="none" opacity=".8"/>`,
      `<path d="M0,${n(-L * t)} Q${n(-wv * 0.5)},${n(-L * (t + 0.05))} ${n(-wv)},${n(-L * (t + 0.17))}" stroke="${ink}" stroke-width="0.8" fill="none" opacity=".8"/>`,
    );
  }
  return `<g transform="translate(${n(x)},${n(y)}) rotate(${n(deg)})">${parts.join('')}</g>`;
}

export function flower(
  r: Rng,
  cx: number,
  cy: number,
  count: number,
  L: number,
  W: number,
  rot0: number,
  jitter = 12,
  curl = 10,
  ink = INK,
) {
  const petals: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = rot0 + (360 * i) / count + rnd(r, -jitter, jitter) * 0.5;
    const l = L * rnd(r, 0.9, 1.08);
    const w = W * rnd(r, 0.92, 1.08);
    const sk = rnd(r, -curl, curl);
    const body: string[] = [
      `<path d="${rpetal(l, w, sk)}" fill="#fcfcfc" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/>`,
      `<path d="M0,${n(-l * 0.05)} Q${n(sk * 0.3)},${n(-l * 0.5)} ${n(sk * 0.5)},${n(-l * 0.9)}" stroke="${ink}" stroke-width="0.9" fill="none"/>`,
    ];
    for (let k = 1; k < 7; k++) {
      const t = 0.12 + 0.1 * k;
      body.push(
        `<path d="M${n(sk * 0.3 * t)},${n(-l * t)} Q${n(w * 0.35)},${n(-l * (t + 0.08))} ${n(w * 0.55 * (1 - t * 0.6))},${n(-l * (t + 0.22))}" stroke="${ink}" stroke-width="0.7" fill="none" opacity=".75"/>`,
        `<path d="M${n(sk * 0.3 * t)},${n(-l * t)} Q${n(-w * 0.35)},${n(-l * (t + 0.08))} ${n(-w * 0.55 * (1 - t * 0.6))},${n(-l * (t + 0.22))}" stroke="${ink}" stroke-width="0.7" fill="none" opacity=".75"/>`,
      );
    }
    for (let k = 0; k < 9; k++) {
      const ang = rnd(r, -0.55, 0.55);
      const r0 = l * rnd(r, 0.04, 0.12);
      const r1 = r0 + l * rnd(r, 0.12, 0.28);
      body.push(
        `<path d="M${n(r0 * Math.sin(ang))},${n(-r0 * Math.cos(ang))} L${n(r1 * Math.sin(ang))},${n(-r1 * Math.cos(ang))}" stroke="${ink}" stroke-width="1.1" opacity=".55" fill="none" stroke-linecap="round"/>`,
      );
    }
    petals.push(`<g transform="translate(${n(cx)},${n(cy)}) rotate(${n(a)})">${body.join('')}</g>`);
  }
  const stamens: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = rot0 + 20 + i * 60 + rnd(r, -10, 10);
    const sl = L * rnd(r, 0.42, 0.6);
    stamens.push(
      `<g transform="translate(${n(cx)},${n(cy)}) rotate(${n(a)})"><path d="M0,0 Q${n(sl * 0.12)},${n(-sl * 0.55)} ${n(sl * 0.05)},${n(-sl)}" stroke="${ink}" stroke-width="1.2" fill="none"/><ellipse cx="${n(
        sl * 0.05,
      )}" cy="${n(-sl)}" rx="3.2" ry="6" fill="${ink}" opacity=".85"/></g>`,
    );
  }
  const centre = `<circle cx="${n(cx)}" cy="${n(cy)}" r="7" fill="#fff" stroke="${ink}" stroke-width="1.4"/>`;
  return petals.join('') + stamens.join('') + centre;
}

function branch(
  pts: [number, number][],
  leaves: [number, number, number, number, number][],
  bud: [number, number, number, number, number],
) {
  const d = `M${n(pts[0][0])},${n(pts[0][1])} Q${pts
    .slice(1)
    .map(([x, y]) => `${n(x)},${n(y)}`)
    .join(' ')}`;
  const s = [`<path d="${d}" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`];
  for (const [x, y, L, W, deg] of leaves) s.push(leaf(x, y, L, W, deg, 1.2, 4));
  const [bx, by, bl, bw, bd] = bud;
  s.push(
    `<g transform="translate(${n(bx)},${n(by)}) rotate(${n(bd)})"><path d="${lens(bl, bw)}" fill="#fafafa" stroke="${INK}" stroke-width="1.3"/><path d="M0,${n(
      -bl * 0.1,
    )} L0,${n(-bl * 0.85)}" stroke="${INK}" stroke-width="0.8"/></g>`,
  );
  return s.join('');
}

/** "Zari": lily corners (top-right, bottom-left) + mandala, on the 926x1311 reference grid. */
export function zariArt() {
  const r1 = mulberry32(5);
  const tr = [
    leaf(752, 150, 54, 21, 240, 1.4, 5),
    leaf(782, 160, 50, 19, 205, 1.4, 5),
    leaf(730, 138, 46, 17, 262, 1.4, 5),
    leaf(818, 164, 40, 16, 186, 1.4, 4),
    flower(r1, 886, 44, 6, 132, 58, -8, 18, 14),
  ].join('');
  const r2 = mulberry32(9);
  const bl = [
    branch(
      [
        [58, 1196],
        [62, 1150],
        [98, 1098],
      ],
      [
        [62, 1160, 34, 12, 20],
        [70, 1138, 32, 11, -35],
        [82, 1118, 30, 10, 38],
        [88, 1108, 26, 9, -30],
      ],
      [98, 1098, 26, 9, 28],
    ),
    leaf(20, 1150, 60, 20, 40, 1.4, 5),
    leaf(70, 1280, 70, 22, 130, 1.4, 6),
    leaf(10, 1292, 62, 20, 160, 1.4, 5),
    flower(r2, 20, 1240, 6, 128, 44, 35, 24, 18),
  ].join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 926 1311" width="794" height="1123" preserveAspectRatio="none">${mandala(
    460,
    650,
  )}${tr}${bl}</svg>`;
}

/* ------------------------------------------------------------------ ornate corners */

export function leafShape(x: number, y: number, len: number, deg: number, fill: string, color: string, sw: number) {
  const d = `M0,0 C${n(len * 0.3)},${n(-len * 0.28)} ${n(len * 0.8)},${n(-len * 0.22)} ${n(len)},0 C${n(len * 0.8)},${n(len * 0.22)} ${n(len * 0.3)},${n(len * 0.28)} 0,0 Z`;
  return `<path d="${d}" transform="translate(${n(x)},${n(y)}) rotate(${n(deg)})" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

/** Top-left corner flourish, ~170px square. Mirror with scale(-1,1) etc. for other corners. */
export function cornerOrnament(color: string, sw: number, fillLeaves: boolean, size = 170) {
  const k = size / 170;
  const fill = fillLeaves ? color : 'none';
  const p: string[] = [];
  p.push(
    `<path d="M8,160 C8,98 16,56 48,38 C78,22 116,28 162,12" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
    `<path d="M160,64 C120,58 90,64 70,84 C56,100 58,122 76,124 C90,126 98,114 92,104" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
    `<path d="M62,160 C58,120 64,92 84,74" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
    `<path d="${spiral(40, 40, 1.5, 22, 2.3, 30, 1)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="${spiral(24, 80, 1.2, 12, 1.8, 200, -1)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="${spiral(88, 16, 1.2, 11, 1.8, 120, 1)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
    leafShape(64, 46, 30, -24, fill, color, sw * 0.8),
    leafShape(100, 36, 26, -12, fill, color, sw * 0.8),
    leafShape(130, 24, 22, -8, fill, color, sw * 0.8),
    leafShape(34, 100, 28, 78, fill, color, sw * 0.8),
    leafShape(20, 128, 24, 84, fill, color, sw * 0.8),
    leafShape(110, 80, 20, 20, fill, color, sw * 0.8),
  );
  for (const [x, y, r] of [
    [96, 100, 2.4],
    [150, 40, 2],
    [44, 130, 2],
    [124, 56, 1.8],
  ] as const) {
    p.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`);
  }
  return `<g transform="scale(${n(k)})">${p.join('')}</g>`;
}

export function cornersAt(w: number, h: number, inset: number, color: string, sw: number, fillLeaves: boolean, size: number) {
  const o = cornerOrnament(color, sw, fillLeaves, size);
  return [
    `<g transform="translate(${inset},${inset})">${o}</g>`,
    `<g transform="translate(${w - inset},${inset}) scale(-1,1)">${o}</g>`,
    `<g transform="translate(${inset},${h - inset}) scale(1,-1)">${o}</g>`,
    `<g transform="translate(${w - inset},${h - inset}) scale(-1,-1)">${o}</g>`,
  ].join('');
}

export function ivoryArt() {
  const c = '#5d6c84';
  const W = 794;
  const H = 1123;
  const i = 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect x="${i + 4}" y="${i + 4}" width="${W - 2 * i - 8}" height="${H - 2 * i - 8}" fill="none" stroke="${c}" stroke-width="2.4"/>
  <rect x="${i + 11}" y="${i + 11}" width="${W - 2 * i - 22}" height="${H - 2 * i - 22}" fill="none" stroke="${c}" stroke-width="0.8" opacity=".7"/>
  ${cornersAt(W, H, i - 2, c, 1.5, true, 120)}
</svg>`;
}

export function marigoldArt() {
  const c = '#eab04a';
  const W = 794;
  const H = 1123;
  const side = (x: number, flip: boolean) => {
    const t = flip ? `translate(${x},0) scale(-1,1)` : `translate(${x},0)`;
    return `<g transform="${t}">
      <path d="M0,440 L0,560" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M0,700 L0,860" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="${spiral(8, 626, 1, 9, 2, 0, 1)}" fill="none" stroke="${c}" stroke-width="1.6"/>
      <path d="M0,570 C14,590 14,606 0,622 M0,690 C14,672 14,656 0,640" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>
    </g>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${cornersAt(W, H, 28, c, 1.9, true, 150)}
  ${side(42, false)}${side(W - 42, true)}
  <path d="M230,1080 L370,1080 M424,1080 L564,1080" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="${spiral(386, 1080, 1, 10, 2, 0, 1)}" fill="none" stroke="${c}" stroke-width="1.6"/>
  <path d="${spiral(408, 1080, 1, 10, 2, 180, -1)}" fill="none" stroke="${c}" stroke-width="1.6"/>
</svg>`;
}

export function aanganArt() {
  const W = 794;
  const H = 1123;
  const b = '#c25a22';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${mandala(640, 290, { opacity: 0.62, scale: 0.62 })}
  <rect x="7" y="7" width="${W - 14}" height="${H - 14}" fill="none" stroke="${b}" stroke-width="9"/>
  <rect x="17" y="17" width="${W - 34}" height="${H - 34}" fill="none" stroke="#e7c3a8" stroke-width="1.2"/>
</svg>`;
}

/* ------------------------------------------------------------------ watercolour florals */

function wcFlower(r: Rng, cx: number, cy: number, R: number, rot: number, pal: { light: string; mid: string; dark: string }, count = 6) {
  const g: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = rot + (360 * i) / count + rnd(r, -8, 8);
    const len = R * rnd(r, 0.88, 1.08);
    const w = R * rnd(r, 0.5, 0.62);
    const sk = rnd(r, -6, 6);
    g.push(
      `<g transform="translate(${n(cx)},${n(cy)}) rotate(${n(a)})">
        <path d="${rpetal(len, w, sk)}" fill="${pal.light}" opacity=".95" filter="url(#wob)"/>
        <path d="${rpetal(len * 0.74, w * 0.62, sk * 0.6)}" fill="${pal.mid}" opacity=".5" filter="url(#wob)"/>
        <path d="M0,${n(-len * 0.06)} Q${n(sk * 0.3)},${n(-len * 0.45)} ${n(sk * 0.4)},${n(-len * 0.8)}" stroke="${pal.dark}" stroke-width="1" fill="none" opacity=".45"/>
        <path d="${rpetal(len, w, sk)}" fill="none" stroke="${pal.dark}" stroke-width="0.9" opacity=".4"/>
      </g>`,
    );
  }
  g.push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(R * 0.2)}" fill="${pal.dark}" opacity=".55"/>`);
  for (let k = 0; k < 16; k++) {
    const [x, y] = polar(cx, cy, R * rnd(r, 0.1, 0.26), rnd(r, 0, 360));
    g.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(rnd(r, 1.3, 2.6))}" fill="#e4b955" opacity=".95"/>`);
  }
  return g.join('');
}

function wcLeaf(x: number, y: number, L: number, W: number, deg: number, fill: string, dark: string) {
  return `<g transform="translate(${n(x)},${n(y)}) rotate(${n(deg)})">
    <path d="${lens(L, W)}" fill="${fill}" opacity=".9" filter="url(#wob)"/>
    <path d="${lens(L, W)}" fill="none" stroke="${dark}" stroke-width=".9" opacity=".45"/>
    <path d="M0,${n(-L * 0.04)} L0,${n(-L * 0.9)}" stroke="${dark}" stroke-width="1" opacity=".55"/>
  </g>`;
}

function wcCluster(seed: number) {
  const r = mulberry32(seed);
  const light = { light: '#c3d5ec', mid: '#7f9fcf', dark: '#33497d' };
  const navy = { light: '#6f8cc0', mid: '#34528f', dark: '#1d2f5c' };
  const parts: string[] = [];
  parts.push(`<path d="M-10,90 C40,40 130,70 176,160 C214,236 140,318 98,404 C56,486 -10,520 -10,520 Z" fill="#aebfd8" opacity=".28" filter="url(#blur)"/>`);
  // arching leaves along the top
  const leaves: [number, number, number, number, number, string][] = [
    [190, 30, 150, 26, 62, '#5f7fae'],
    [230, 42, 128, 22, 76, '#9db6d6'],
    [300, 16, 120, 20, 84, '#4d6c9d'],
    [330, 54, 88, 18, 96, '#a9bfdc'],
    [20, 330, 110, 24, 150, '#4d6c9d'],
    [40, 430, 100, 22, 170, '#7f9fcf'],
    [6, 250, 120, 24, 20, '#2f4a7c'],
  ];
  for (const [x, y, L, W, deg, fill] of leaves) parts.push(wcLeaf(x, y, L, W, deg, fill, '#233a6a'));
  parts.push(wcFlower(r, 132, 142, 72, 10, light));
  parts.push(wcFlower(r, 72, 70, 38, 40, navy, 5));
  parts.push(wcFlower(r, 88, 330, 34, 80, light, 5));
  parts.push(wcLeaf(128, 300, 60, 14, 105, '#5f7fae', '#233a6a'));
  parts.push(wcLeaf(58, 372, 56, 14, 205, '#3e5d93', '#233a6a'));
  return parts.join('');
}

export function aparajitaArt() {
  const W = 794;
  const H = 1123;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <filter id="wob" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation="0.6"/>
    </filter>
    <filter id="blur"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <g>${wcCluster(21)}</g>
  <g transform="translate(${W},${H}) rotate(180)">${wcCluster(8)}</g>
</svg>`;
}
