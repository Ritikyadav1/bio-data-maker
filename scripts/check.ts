// Self-check for field parsing/formatting and for cleaning untrusted data. Run: npm run check
import { CODECS, CUSTOM, currentFormat, kindOf } from '../src/fieldTypes.ts';
import { LIMITS, clean, imageSrc, looksLikeBiodata, normalize } from '../src/normalize.ts';
import { DEFAULT_ADJUST, PRESETS } from '../src/photoFilters.ts';
import { adjustColours, applyLook, blur } from '../src/lib/retouch.ts';

const eq = (a: unknown, b: unknown, what: string) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${what}: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
};
const { date, time, height } = CODECS;

for (const s of ['14 March 1996', '14 Mar 1996', '14-03-1996', '14/3/1996', '1996-03-14', 'March 14, 1996', '14th March, 1996'])
  eq(date.parse(s), '1996-03-14', `date ${s}`);
eq(date.parse('31-13-1996'), null, 'bad month');
eq(date.parse('sometime in 96'), null, 'free text date');
eq(date.formats['dd-mm-yyyy']('1991-10-10'), '10-10-1991', 'dd-mm-yyyy');
eq(date.formats['d month yyyy']('1996-03-14'), '14 March 1996', 'long date');

eq(time.parse('06:45 AM'), '06:45', '12h am');
eq(time.parse('2:49 PM'), '14:49', '12h pm');
eq(time.parse('12:10 am'), '00:10', 'midnight');
eq(time.parse('18:45'), '18:45', '24h');
eq(time.formats['12h']('00:10'), '12:10 AM', 'format midnight');
eq(time.formats['12h']('14:49'), '02:49 PM', 'format pm');

eq(height.parse(`5' 9"`), '69', 'ft symbol');
eq(height.parse('5 feet 8 inches (173 cm)'), '68', 'ft words');
eq(height.parse('5 ft 2 in'), '62', 'ft in');
eq(height.parse('175 cm'), '69', 'cm');
eq(height.formats['ft-in-cm']('68'), '5 feet 8 inches (173 cm)', 'ft-in-cm');
eq(height.formats['ft-in-cm']('60'), '5 feet (152 cm)', 'whole feet');

eq(currentFormat(date, { value: '14 March 1996' }), 'd month yyyy', 'infer long');
eq(currentFormat(date, { value: '' }), 'dd-mm-yyyy', 'empty -> first');
eq(currentFormat(date, { value: 'approx 1996' }), CUSTOM, 'unparseable -> custom');
eq(currentFormat(height, { value: `5' 9"`, fmt: 'cm' }), 'cm', 'saved choice wins');

eq(kindOf({ label: "Father's Occupation" })?.type, 'select', 'label lookup');
eq(kindOf({ label: 'Birth Date' })?.type, 'date', 'alias label');
eq(kindOf({ label: 'DOB (as per records)' })?.type, undefined, 'non-exact label');
eq(kindOf({ label: 'Anything', key: 'dob' })?.type, 'date', 'dob key');

eq(currentFormat(date, { value: '14 March 1996', fmt: 'constructor' }), 'd month yyyy', 'prototype key as fmt ignored');

/* ---------- normalize: anything in, valid BioData out ---------- */
for (const junk of [null, undefined, 42, 'x', [], [1, 2], true]) eq(normalize(junk).sections.length > 0, true, `junk ${String(junk)}`);

const bad = normalize({
  headerText: 5,
  hideEmpty: 'yes',
  templateId: { evil: 1 },
  photo: { src: 'https://tracker.example/pixel.png', zoom: 1e9, x: NaN, y: -500 },
  logo: { src: 'javascript:alert(1)', recolor: 'no' },
  sections: [null, 7, { id: 'a', title: { t: 1 }, fields: [null, { id: 'a', key: 'evil', label: 9, value: 'ok\u0000\u000b!', fmt: '__proto__' }] }],
});
eq(bad.headerText, '5', 'number header -> string');
eq(bad.hideEmpty, false, 'non-bool -> default');
eq(bad.templateId, 'zari', 'bad template id -> default');
eq([bad.photo.src, bad.photo.zoom, bad.photo.x, bad.photo.y], [null, 3, 0, -100], 'photo src dropped, numbers clamped');
eq([bad.logo.src, bad.logo.recolor], [null, true], 'logo src dropped');
eq(bad.sections.length, 3, 'null / number sections become empty sections');
const f = bad.sections[2].fields[1];
eq([f.key, f.label, f.value, f.fmt], [undefined, '9', 'ok!', undefined], 'field cleaned');
const ids = bad.sections.flatMap((s) => [s.id, ...s.fields.map((x) => x.id)]);
eq(new Set(ids).size, ids.length, 'duplicate ids made unique');
eq(normalize({ sections: [] }).sections, [], 'empty section list is kept');
eq(normalize({ sections: Array(500).fill({ fields: Array(500).fill({}) }) }).sections.length, LIMITS.sections, 'section cap');
eq(normalize({ sections: [{ fields: [{ value: 'x'.repeat(5000) }] }] }).sections[0].fields[0].value.length, LIMITS.value, 'value cap');
eq(Object.prototype.hasOwnProperty.call(normalize(JSON.parse('{"__proto__":{"polluted":1},"sections":[]}')), 'polluted'), false, 'no proto keys copied');
eq(({} as Record<string, unknown>).polluted, undefined, 'Object.prototype untouched');

eq(imageSrc('data:image/png;base64,iVBORw0KGgo='), 'data:image/png;base64,iVBORw0KGgo=', 'png data url ok');
eq(imageSrc('data:image/svg+xml;base64,PHN2Zz4='), null, 'svg data url rejected');
eq(imageSrc('data:image/png;base64,abc"onerror=x'), null, 'garbage after base64 rejected');
eq(clean('a\u0000b\tc\nd\uD800e😀'), 'ab\tc\nde😀', 'control chars + lone surrogate stripped, emoji kept');
eq([looksLikeBiodata({ name: 'pkg' }), looksLikeBiodata({ sections: [] })], [false, true], 'import sniffing');

for (const id of [...Object.keys(date.formats), ...Object.keys(time.formats), ...Object.keys(height.formats), CUSTOM])
  eq(normalize({ sections: [{ fields: [{ fmt: id }] }] }).sections[0].fields[0].fmt, id, `format id ${id} survives a save`);
/* ---------- photo adjustments ---------- */
eq(normalize({ sections: [] }).photo.adjust, DEFAULT_ADJUST, 'old saves get default adjustments');
eq(normalize({ sections: [], photo: { adjust: { brightness: 999, contrast: 'x', saturate: -5, warmth: 12.6, smooth: 500, sharpen: -1 } } }).photo.adjust,
  { brightness: 150, contrast: 100, saturate: 0, warmth: 13, smooth: 100, sharpen: 0 }, 'adjustments clamped and rounded');
const px = (...rgb: number[]) => Uint8ClampedArray.from(rgb.flatMap((v, i) => (i % 3 === 2 ? [v, 255] : [v])));
const look = (rgb: number[], a: Partial<typeof DEFAULT_ADJUST>) => { const p = px(...rgb); adjustColours(p, { ...DEFAULT_ADJUST, ...a }); return [...p].filter((_, i) => i % 4 !== 3); };
eq(look([12, 130, 250], {}), [12, 130, 250], 'default adjust leaves pixels alone');
eq(look([100, 100, 100], { brightness: 150 }), [150, 150, 150], 'brightness 150%');
eq(look([200, 50, 128], { contrast: 150 }), [236, 11, 128], 'contrast 150% around mid-grey');
const bw = look([200, 60, 30], { saturate: 0 });
eq(bw[0] === bw[1] && bw[1] === bw[2], true, 'saturate 0 -> grey');
eq(look([255, 255, 255], { warmth: 100 }), [255, 255, 239], 'full sepia on white (spec matrix)');
const dot = new Uint8ClampedArray(9 * 9 * 4); dot[(4 * 9 + 4) * 4] = 255;
const spread = blur(dot, 9, 9, 1);
eq(spread[(4 * 9 + 4) * 4] < 255 && spread[(4 * 9 + 3) * 4] > 0, true, 'blur spreads a bright dot');
const flat = new Uint8ClampedArray(20 * 20 * 4).fill(90);
eq(blur(flat, 20, 20, 3).every((v, i) => i % 4 === 3 || v === 90), true, 'blur keeps a flat image flat (edges repeat)');
// skin smoothing lowers grain on skin-tone noise
const W = 60, H = 60, skin = new Uint8ClampedArray(W * H * 4);
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 36;
for (let i = 0; i < skin.length; i += 4) { const n = rnd(); skin[i] = 205 + n; skin[i + 1] = 150 + n; skin[i + 2] = 125 + n; skin[i + 3] = 255; }
const sd = (p: Uint8ClampedArray) => { const v = [...p].filter((_, i) => i % 4 === 0); const m = v.reduce((a, b) => a + b) / v.length; return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length); };
const before = sd(skin); applyLook(skin, W, H, { ...DEFAULT_ADJUST, smooth: 100 });
eq(sd(skin) < before * 0.6, true, `smooth skin cuts grain (${before.toFixed(1)} -> ${sd(skin).toFixed(1)})`);
for (const p of PRESETS) eq(normalize({ sections: [], photo: { adjust: p.adjust } }).photo.adjust, p.adjust, `preset ${p.name} within ranges`);

console.log('checks ok');
