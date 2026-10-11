import type { BioData, Field, FieldKey, Section } from './types';
import { DEFAULT_ADJUST } from './photoFilters';

export const uid = () =>
  (globalThis.crypto && 'randomUUID' in globalThis.crypto
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
  ).slice(0, 12);

const f = (label: string, value = '', key?: FieldKey): Field => ({ id: uid(), label, value, key });

export function sampleData(): BioData {
  const sections: Section[] = [
    {
      id: uid(),
      title: 'Personal Details',
      fields: [
        f('Name', 'Full Name', 'name'),
        f('Gender', 'Male'),
        f('Date of Birth', '1 January 2000', 'dob'),
        f('Place of Birth', 'City, State', 'pob'),
        f('Time of Birth', '10:00 AM'),
        f('Rashi', 'Mesh (Aries)'),
        f('Nakshatra', 'Ashwini'),
        f('Height', `5' 8"`),
        f('Marital Status', 'Never Married'),
        f('Manglik', 'No'),
        f('Religion/Caste', 'Religion / Caste'),
        f('Complexion', 'Fair'),
        f('Gotra', 'Gotra'),
        f('Languages Known', 'Hindi, English'),
        f('Highest Education', 'B.Tech / B.E.'),
        f('Job/Occupation', 'Occupation, Company'),
        f('Annual Income', '5 - 10 LPA'),
      ],
    },
    {
      id: uid(),
      title: 'Family Details',
      fields: [
        f("Father's Name", "Father's Full Name"),
        f("Father's Occupation", 'Business'),
        f("Mother's Name", "Mother's Full Name"),
        f("Mother's Occupation", 'Home Maker'),
        f('Total Brothers', '1'),
        f('Total Sisters', '1'),
      ],
    },
    {
      id: uid(),
      title: 'Contact Details',
      fields: [
        f('Contact Person', 'Name (Relation)'),
        f('Contact Number', '+91 00000 00000'),
        f('Email ID', 'name@example.com'),
        f('Residential Address', 'House No., Area, City, State - PIN'),
      ],
    },
  ];
  return {
    templateId: 'zari',
    headerText: 'ॐ श्री गणेशाय नमः',
    headerEdited: false,
    showLogo: true,
    hideEmpty: false,
    photo: { src: null, zoom: 1, x: 0, y: 0, adjust: DEFAULT_ADJUST },
    logo: { src: null, recolor: true },
    sections,
  };
}

/** Same fields, every value emptied. */
export function clearedValues(d: BioData): BioData {
  return {
    ...d,
    sections: d.sections.map((s) => ({ ...s, fields: s.fields.map((x) => ({ ...x, value: '' })) })),
  };
}

export const newField = (): Field => f('New field');
export const newSection = (): Section => ({ id: uid(), title: 'New Section', fields: [f('New field')] });
