import { useState } from 'react';
import type { Field } from '../types';
import { CODECS, CUSTOM, HEIGHTS, currentFormat, kindOf } from '../fieldTypes';
import { LIMITS } from '../normalize';

const OTHER = '\u0000other';

/** The value box for one field: a dropdown, date/time picker or height list when the label is a known one, else plain text. */
export function ValueInput({ field, onChange }: { field: Field; onChange: (patch: Partial<Field>) => void }) {
  const [other, setOther] = useState(false);
  const kind = kindOf(field);

  const text = (autoFocus = false) => (
    <input
      className="value-input"
      value={field.value}
      aria-label={`${field.label} value`}
      placeholder="Value"
      maxLength={LIMITS.value}
      autoFocus={autoFocus}
      onChange={(e) => onChange({ value: e.target.value })}
    />
  );

  if (!kind) return text();

  if (kind.type === 'select') {
    const custom = other || (!!field.value && !kind.options.includes(field.value));
    return (
      <div className="value-combo">
        <select
          className="value-input"
          aria-label={`${field.label} value`}
          value={custom ? OTHER : field.value}
          onChange={(e) => {
            const v = e.target.value;
            setOther(v === OTHER);
            onChange({ value: v === OTHER ? '' : v });
          }}
        >
          <option value="">Select…</option>
          {kind.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
          <option value={OTHER}>Other (type it)…</option>
        </select>
        {custom && text(other)}
      </div>
    );
  }

  const codec = CODECS[kind.type];
  const fmt = currentFormat(codec, field);
  const canon = codec.parse(field.value);
  const show = (c: string) => (c ? codec.formats[fmt](c) : '');

  return (
    <div className="value-combo">
      {fmt === CUSTOM ? (
        text()
      ) : kind.type === 'height' ? (
        <select className="value-input" aria-label={`${field.label} value`} value={canon ?? ''} onChange={(e) => onChange({ value: show(e.target.value) })}>
          <option value="">Select…</option>
          {HEIGHTS.map((h) => (
            <option key={h} value={h}>{codec.formats[fmt](h)}</option>
          ))}
        </select>
      ) : (
        <input
          type={kind.type}
          className="value-input"
          aria-label={`${field.label} value`}
          value={canon ?? ''}
          onChange={(e) => onChange({ value: show(e.target.value) })}
        />
      )}
      <select
        className="value-input fmt"
        aria-label={`${field.label} format`}
        value={fmt}
        onChange={(e) => {
          const id = e.target.value;
          // free text that can't be read as a date/time/height is cleared so the picker starts empty
          onChange({ fmt: id, value: id === CUSTOM ? field.value : canon ? codec.formats[id](canon) : '' });
        }}
      >
        {Object.entries(codec.formats).map(([id, f]) => (
          <option key={id} value={id}>Show as {f(canon ?? codec.sample)}</option>
        ))}
        <option value={CUSTOM}>Type my own</option>
      </select>
    </div>
  );
}
