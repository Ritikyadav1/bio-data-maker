import type { BioData, Section } from '../types';
import { newField, newSection } from '../defaults';
import { KNOWN_LABELS } from '../fieldTypes';
import { LIMITS } from '../normalize';
import { ValueInput } from './ValueInput';

type Update = (fn: (d: BioData) => BioData) => void;

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const out = arr.slice();
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

export function DetailsPanel({ data, update }: { data: BioData; update: Update }) {
  const setSection = (sid: string, fn: (s: Section) => Section) =>
    update((d) => ({ ...d, sections: d.sections.map((s) => (s.id === sid ? fn(s) : s)) }));

  return (
    <div className="stack">
      <label className="check">
        <input type="checkbox" checked={data.hideEmpty} onChange={(e) => update((d) => ({ ...d, hideEmpty: e.target.checked }))} />
        Hide fields that are left empty
      </label>
      <datalist id="field-labels">
        {KNOWN_LABELS.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>

      {data.sections.map((sec, si) => (
        <div className="card" key={sec.id}>
          <div className="card-head">
            <input
              className="title-input"
              value={sec.title}
              maxLength={LIMITS.label}
              aria-label="Section title"
              onChange={(e) => setSection(sec.id, (s) => ({ ...s, title: e.target.value }))}
            />
            <div className="icon-row">
              <button className="icon" title="Move section up" disabled={si === 0} onClick={() => update((d) => ({ ...d, sections: move(d.sections, si, -1) }))}>↑</button>
              <button className="icon" title="Move section down" disabled={si === data.sections.length - 1} onClick={() => update((d) => ({ ...d, sections: move(d.sections, si, 1) }))}>↓</button>
              <button
                className="icon danger"
                title="Delete section"
                onClick={() => {
                  if (confirm(`Delete the section "${sec.title}" and its fields?`)) update((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== sec.id) }));
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {sec.fields.map((f, fi) => (
            <div className="field" key={f.id}>
              <input
                className="label-input"
                value={f.label}
                aria-label="Field name"
                placeholder="Field name"
                list="field-labels"
                maxLength={LIMITS.label}
                onChange={(e) => setSection(sec.id, (s) => ({ ...s, fields: s.fields.map((x) => (x.id === f.id ? { ...x, label: e.target.value } : x)) }))}
              />
              <ValueInput
                field={f}
                onChange={(patch) => setSection(sec.id, (s) => ({ ...s, fields: s.fields.map((x) => (x.id === f.id ? { ...x, ...patch } : x)) }))}
              />
              <div className="icon-row">
                <button className="icon" title="Move up" disabled={fi === 0} onClick={() => setSection(sec.id, (s) => ({ ...s, fields: move(s.fields, fi, -1) }))}>↑</button>
                <button className="icon" title="Move down" disabled={fi === sec.fields.length - 1} onClick={() => setSection(sec.id, (s) => ({ ...s, fields: move(s.fields, fi, 1) }))}>↓</button>
                <button className="icon danger" title="Delete field" onClick={() => setSection(sec.id, (s) => ({ ...s, fields: s.fields.filter((x) => x.id !== f.id) }))}>✕</button>
              </div>
            </div>
          ))}

          <button
            className="link"
            disabled={sec.fields.length >= LIMITS.fieldsPerSection}
            onClick={() => setSection(sec.id, (s) => ({ ...s, fields: [...s.fields, newField()] }))}
          >
            + Add field
          </button>
        </div>
      ))}

      <button
        className="btn secondary"
        disabled={data.sections.length >= LIMITS.sections}
        onClick={() => update((d) => ({ ...d, sections: [...d.sections, newSection()] }))}
      >
        + Add section
      </button>
    </div>
  );
}
