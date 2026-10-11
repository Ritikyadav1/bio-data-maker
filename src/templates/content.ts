import type { BioData, Field, FieldKey, Section } from '../types';
import type { Layout } from './types';

/** True when the header area shows nothing: no logo (slot missing or switched off) and no header text. */
export const headerEmpty = (d: BioData, layout: Layout) => !(layout.header.logo && d.showLogo) && !d.headerText.trim();

/** The layout with content and photo moved up to `compactTop` when the header area is empty. */
export function placed(layout: Layout, d: BioData): Layout {
  const top = layout.page.compactTop;
  if (top == null || !headerEmpty(d, layout)) return layout;
  const dy = top - layout.page.contentTop;
  return { ...layout, page: { ...layout.page, contentTop: top }, photo: { ...layout.photo, y: layout.photo.y + dy } };
}

export const findByKey = (d: BioData, key: FieldKey): Field | undefined =>
  d.sections.flatMap((s) => s.fields).find((f) => f.key === key);

/** The sections a template should actually print (identity fields moved out, empty ones optionally hidden). */
export function visibleSections(d: BioData, layout: Layout): Section[] {
  return d.sections
    .map((s) => ({
      ...s,
      fields: s.fields.filter((f) => {
        if (layout.identity && f.key) return false;
        if (d.hideEmpty && !f.value.trim()) return false;
        return true;
      }),
    }))
    .filter((s) => s.fields.length > 0);
}

export function identityLines(d: BioData): { name: string; lines: string[] } {
  const name = findByKey(d, 'name')?.value.trim() ?? '';
  const lines: string[] = [];
  for (const k of ['dob', 'pob'] as const) {
    const f = findByKey(d, k);
    if (f && f.value.trim()) lines.push(`${f.label}: ${f.value.trim()}`);
  }
  return { name, lines };
}
