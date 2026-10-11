import type { Field } from './types';

/**
 * Smarter inputs for well-known fields, picked by the field's label (so a field the user adds and
 * names "Gender" gets the dropdown too). The stored value stays plain text, so templates and
 * exports don't care how it was entered.
 */
export type Kind = { type: 'select'; options: string[] } | { type: 'date' | 'time' | 'height' };

const COUNT = ['0', '1', '2', '3', '4', '5'];
const OCCUPATION = ['Home Maker', 'Business', 'Private Job', 'Government Job', 'Self Employed', 'Retired', 'Farmer', 'Not Working'];

const SELECTS: [string[], string[]][] = [
  [['gender', 'sex'], ['Male', 'Female']],
  [['maritalstatus'], ['Single', 'Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce', 'Separated']],
  [['manglik', 'mangalik', 'manglikdosh'], ['Yes', 'No', 'Partial (Anshik)', "Don't Know"]],
  [
    ['rashi', 'moonsign', 'rashisign', 'zodiac'],
    ['Mesh (Aries)', 'Vrishabh (Taurus)', 'Mithun (Gemini)', 'Kark (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)',
      'Vrishchik (Scorpio)', 'Dhanu (Sagittarius)', 'Makar (Capricorn)', 'Kumbh (Aquarius)', 'Meen (Pisces)'],
  ],
  [
    ['nakshatra', 'nakshatram', 'star'],
    ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
      'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
      'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
  ],
  [['complexion', 'skintone'], ['Very Fair', 'Fair', 'Wheatish', 'Wheatish Brown', 'Dusky', 'Dark']],
  [['bloodgroup'], ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
  [['religion'], ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Buddhist', 'Parsi', 'Jewish']],
  [['diet', 'food', 'foodpreference', 'eatinghabits'], ['Vegetarian', 'Eggetarian', 'Non-Vegetarian', 'Vegan', 'Jain']],
  [['bodytype', 'build'], ['Slim', 'Average', 'Athletic', 'Heavy']],
  [['smoking', 'drinking'], ['No', 'Occasionally', 'Yes']],
  [
    ['mothertongue'],
    ['Hindi', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Odia', 'Urdu', 'Sindhi',
      'Marwari', 'Bhojpuri', 'English'],
  ],
  [
    ['highesteducation', 'qualification', 'education'],
    ['10th', '12th', 'Diploma', 'B.A.', 'B.Com', 'B.Sc', 'B.Tech / B.E.', 'BCA', 'BBA', 'MBBS', 'LLB', 'CA', 'M.A.', 'M.Com',
      'M.Sc', 'M.Tech / M.E.', 'MCA', 'MBA', 'MD / MS', 'Ph.D'],
  ],
  [
    ['annualincome', 'income', 'salary', 'package'],
    ['Below 2 LPA', '2 - 5 LPA', '5 - 10 LPA', '10 - 15 LPA', '15 - 25 LPA', '25 - 50 LPA', '50 LPA - 1 Cr', 'Above 1 Cr'],
  ],
  [['fathersoccupation', 'mothersoccupation'], OCCUPATION],
  [
    ['totalbrothers', 'totalsisters', 'marriedbrothers', 'marriedsisters', 'unmarriedbrothers', 'unmarriedsisters', 'brothers',
      'sisters', 'siblings', 'siblingscount'],
    COUNT,
  ],
];

const KINDS = new Map<string, Kind>();
for (const [labels, options] of SELECTS) for (const l of labels) KINDS.set(l, { type: 'select', options });
for (const l of ['dateofbirth', 'dob', 'birthdate']) KINDS.set(l, { type: 'date' });
for (const l of ['timeofbirth', 'birthtime', 'tob']) KINDS.set(l, { type: 'time' });
KINDS.set('height', { type: 'height' });

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

export const kindOf = (f: Pick<Field, 'label' | 'key'>): Kind | undefined =>
  f.key === 'dob' ? { type: 'date' } : KINDS.get(norm(f.label));

/** Suggested names for the "field name" box. */
export const KNOWN_LABELS = [
  'Name', 'Gender', 'Date of Birth', 'Time of Birth', 'Place of Birth', 'Height', 'Marital Status', 'Rashi', 'Nakshatra',
  'Manglik', 'Complexion', 'Blood Group', 'Religion', 'Caste', 'Gotra', 'Mother Tongue', 'Diet', 'Highest Education',
  'College Name', 'Job/Occupation', 'Organization Name', 'Annual Income', "Father's Name", "Father's Occupation",
  "Mother's Name", "Mother's Occupation", 'Total Brothers', 'Married Brothers', 'Total Sisters', 'Married Sisters',
  'Contact Number', 'Email ID', 'Address',
];

/* ---------- formats: each value has a canonical form plus several ways to print it ---------- */

interface Codec {
  /** text -> canonical ('YYYY-MM-DD' / 'HH:MM' / inches), null if not recognised */
  parse: (v: string) => string | null;
  formats: Record<string, (c: string) => string>;
  /** canonical value used to label the format choices when the field is empty */
  sample: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const p2 = (x: number) => String(x).padStart(2, '0');
const ymd = (c: string) => c.split('-').map(Number) as [number, number, number];

function parseDate(v: string): string | null {
  const s = v.trim();
  let d: number, m: number, y: number;
  let r: RegExpMatchArray | null;
  if ((r = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) [y, m, d] = [+r[1], +r[2], +r[3]];
  else if ((r = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/))) [d, m, y] = [+r[1], +r[2], +r[3]];
  else if ((r = s.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\.?,?\s+(\d{4})$/i))) [d, m, y] = [+r[1], month(r[2]), +r[3]];
  else if ((r = s.match(/^([a-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i))) [d, m, y] = [+r[2], month(r[1]), +r[3]];
  else return null;
  if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
  return `${y}-${p2(m)}-${p2(d)}`;
}
function month(name: string) {
  return MONTHS.findIndex((x) => x.slice(0, 3).toLowerCase() === name.slice(0, 3).toLowerCase()) + 1;
}

function parseTime(v: string): string | null {
  const r = v.trim().match(/^(\d{1,2})[:.](\d{2})\s*(?:([ap])\.?\s*m\.?)?$/i);
  if (!r) return null;
  let h = +r[1];
  const min = +r[2];
  if (r[3]) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (r[3].toLowerCase() === 'p' ? 12 : 0);
  }
  return h < 24 && min < 60 ? `${p2(h)}:${p2(min)}` : null;
}

function parseHeight(v: string): string | null {
  let r = v.match(/(\d)\s*(?:'|’|ft\.?|feet|foot)\s*(?:(\d{1,2})\s*(?:"|”|''|in\b|inch|inches)?)?/i);
  if (r) return String(+r[1] * 12 + +(r[2] ?? 0));
  r = v.match(/(\d{2,3}(?:\.\d+)?)\s*cm/i);
  return r ? String(Math.round(+r[1] / 2.54)) : null;
}
const ftIn = (c: string) => [Math.floor(+c / 12), +c % 12] as const;
const cm = (c: string) => Math.round(+c * 2.54);

export const CODECS: Record<'date' | 'time' | 'height', Codec> = {
  date: {
    parse: parseDate,
    sample: '1996-03-14',
    formats: {
      'dd-mm-yyyy': (c) => { const [y, m, d] = ymd(c); return `${p2(d)}-${p2(m)}-${y}`; },
      'dd/mm/yyyy': (c) => { const [y, m, d] = ymd(c); return `${p2(d)}/${p2(m)}/${y}`; },
      'd month yyyy': (c) => { const [y, m, d] = ymd(c); return `${d} ${MONTHS[m - 1]} ${y}`; },
      'd mon yyyy': (c) => { const [y, m, d] = ymd(c); return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`; },
      'month d, yyyy': (c) => { const [y, m, d] = ymd(c); return `${MONTHS[m - 1]} ${d}, ${y}`; },
    },
  },
  time: {
    parse: parseTime,
    sample: '18:45',
    formats: {
      '12h': (c) => { const [h, m] = c.split(':').map(Number); return `${p2(h % 12 || 12)}:${p2(m)} ${h < 12 ? 'AM' : 'PM'}`; },
      '24h': (c) => c,
    },
  },
  height: {
    parse: parseHeight,
    sample: '69',
    formats: {
      'ft-in': (c) => { const [f, i] = ftIn(c); return `${f}' ${i}"`; },
      'ft-in-cm': (c) => { const [f, i] = ftIn(c); return `${f} feet${i ? ` ${i} inch${i > 1 ? 'es' : ''}` : ''} (${cm(c)} cm)`; },
      'ft in': (c) => { const [f, i] = ftIn(c); return `${f} ft ${i} in`; },
      cm: (c) => `${cm(c)} cm`,
    },
  },
};

/** Heights offered in the dropdown, in inches (4'0" .. 7'0"). */
export const HEIGHTS = Array.from({ length: 37 }, (_, i) => String(48 + i));

export const CUSTOM = 'custom';

/** The format a field is currently shown in: the saved choice, else whichever format reproduces the text. */
export function currentFormat(codec: Codec, f: Pick<Field, 'value' | 'fmt'>): string {
  if (f.fmt === CUSTOM) return CUSTOM;
  const canon = codec.parse(f.value);
  if (f.value.trim() && !canon) return CUSTOM;
  if (f.fmt && Object.prototype.hasOwnProperty.call(codec.formats, f.fmt)) return f.fmt;
  const ids = Object.keys(codec.formats);
  return (canon && ids.find((id) => codec.formats[id](canon) === f.value.trim())) || ids[0];
}
