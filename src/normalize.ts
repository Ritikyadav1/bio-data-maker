import type { BioData, Field, FieldKey, PhotoAdjust, Section } from './types';
import { ADJUST_RANGES, DEFAULT_ADJUST } from './photoFilters';
import { sampleData, uid } from './defaults';

/** Caps that keep a hand-edited or hostile file from freezing the page or overflowing storage. */
export const LIMITS = {
  sections: 30,
  fieldsPerSection: 100,
  label: 120,
  value: 1000,
  header: 200,
  /** length of an embedded image data URL (~6 MB of image) */
  image: 8_000_000,
};

/**
 * Removes characters that are invisible junk on screen and invalid in XML (they make Word refuse the .docx):
 * C0 controls except tab/newline/CR, DEL, U+FFFE/FFFF and unpaired surrogate halves.
 */
export const clean = (s: string) =>
  s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F￾￿]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');

const str = (v: unknown, max: number, fallback = '') =>
  typeof v === 'string' ? clean(v).slice(0, max) : typeof v === 'number' && Number.isFinite(v) ? String(v) : fallback;
const num = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** Only images embedded as base64 data URLs are kept: never remote links (tracking) or other schemes. */
export const imageSrc = (v: unknown): string | null =>
  typeof v === 'string' && v.length <= LIMITS.image && /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(v) ? v : null;

const adjust = (a: Record<string, unknown>): PhotoAdjust => {
  const out = { ...DEFAULT_ADJUST };
  for (const k of Object.keys(ADJUST_RANGES) as (keyof PhotoAdjust)[]) {
    const [min, max, def] = ADJUST_RANGES[k];
    out[k] = Math.round(num(a[k], min, max, def));
  }
  return out;
};

const KEYS = new Set<FieldKey>(['name', 'dob', 'pob']);

/** True if `x` plausibly came from this app's "Export data", so a random JSON file isn't silently turned into sample data. */
export const looksLikeBiodata = (x: unknown) => Array.isArray(obj(x).sections);

/**
 * Turns anything (old saves, imported files, hand edits) into a valid BioData: wrong types get defaults,
 * strings are cleaned and capped, numbers clamped, ids made unique. Never throws.
 */
export function normalize(x: unknown): BioData {
  const base = sampleData();
  const o = obj(x);
  if (!Object.keys(o).length) return base;

  const seen = new Set<string>();
  const id = (v: unknown) => {
    let s = typeof v === 'string' && /^[\w-]{1,64}$/.test(v) ? v : uid();
    while (seen.has(s)) s = uid();
    seen.add(s);
    return s;
  };

  const field = (raw: unknown): Field => {
    const f = obj(raw);
    return {
      id: id(f.id),
      key: KEYS.has(f.key as FieldKey) ? (f.key as FieldKey) : undefined,
      label: str(f.label, LIMITS.label),
      value: str(f.value, LIMITS.value),
      fmt: typeof f.fmt === 'string' && /^[a-z0-9 ,/-]{1,20}$/.test(f.fmt) ? f.fmt : undefined, // ids like 'dd/mm/yyyy', 'month d, yyyy'
    };
  };
  const section = (raw: unknown): Section => {
    const s = obj(raw);
    return {
      id: id(s.id),
      title: str(s.title, LIMITS.label),
      fields: (Array.isArray(s.fields) ? s.fields.slice(0, LIMITS.fieldsPerSection) : []).map(field),
    };
  };

  const photo = obj(o.photo);
  const logo = obj(o.logo);
  return {
    templateId: typeof o.templateId === 'string' ? o.templateId.slice(0, 40) : base.templateId,
    headerText: str(o.headerText, LIMITS.header, base.headerText),
    headerEdited: bool(o.headerEdited, false),
    showLogo: bool(o.showLogo, base.showLogo),
    hideEmpty: bool(o.hideEmpty, base.hideEmpty),
    photo: {
      src: imageSrc(photo.src),
      zoom: num(photo.zoom, 1, 3, 1),
      x: num(photo.x, -100, 100, 0),
      y: num(photo.y, -100, 100, 0),
      adjust: adjust(obj(photo.adjust)),
    },
    logo: { src: imageSrc(logo.src), recolor: bool(logo.recolor, true) },
    // an empty list is a valid choice (user deleted every section), only a missing/broken one falls back
    sections: Array.isArray(o.sections) ? o.sections.slice(0, LIMITS.sections).map(section) : base.sections,
  };
}
