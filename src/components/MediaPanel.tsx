import { useRef, useState, type ChangeEvent } from 'react';
import type { BioData } from '../types';
import type { Layout } from '../templates/types';
import { resolvePhoto } from '../lib/assets';
import { useAsync } from '../lib/hooks';
import { fileToDataUrl } from '../lib/image';
import { LIMITS } from '../normalize';
import { ADJUST_RANGES, DEFAULT_ADJUST, PRESETS, adjustKey, sameAdjust } from '../photoFilters';
import type { PhotoAdjust } from '../types';

const ADJUSTERS: [keyof PhotoAdjust, string][] = [
  ['brightness', 'Brightness'],
  ['contrast', 'Contrast'],
  ['saturate', 'Colour'],
  ['warmth', 'Warmth'],
  ['smooth', 'Smooth skin'],
  ['sharpen', 'Sharpen'],
];

type Update = (fn: (d: BioData) => BioData) => void;

export function MediaPanel({ data, update, layout }: { data: BioData; update: Update; layout: Layout }) {
  const photoInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const { w, h } = layout.photo;
  const preview = useAsync(() => resolvePhoto(data, w, h, 1.5), [data.photo.src, data.photo.zoom, data.photo.x, data.photo.y, adjustKey(data.photo.adjust), w, h]);
  const hasLogo = !!layout.header.logo;

  const [error, setError] = useState<{ slot: 'photo' | 'logo'; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const setPhoto = (patch: Partial<BioData['photo']>) => update((d) => ({ ...d, photo: { ...d.photo, ...patch } }));

  /** Shared upload handler: validates, converts, and reports problems next to the button instead of failing silently. */
  const upload = (slot: 'photo' | 'logo', apply: (src: string) => void) => async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      apply(slot === 'photo' ? await fileToDataUrl(file, 1400, false) : await fileToDataUrl(file, 900, true));
    } catch (err) {
      setError({ slot, msg: err instanceof Error ? err.message : 'Could not use that image.' });
    } finally {
      setBusy(false);
    }
  };
  const errorFor = (slot: 'photo' | 'logo') =>
    error?.slot === slot && (
      <p className="error" role="alert">
        {error.msg}
      </p>
    );

  return (
    <div className="stack">
      <div className="card">
        <div className="card-title">Photo</div>
        <div className="photo-row">
          <div className="photo-thumb" style={{ aspectRatio: `${w} / ${h}` }}>
            {preview ? <img src={preview} alt="Cropped preview" /> : <span>No photo</span>}
          </div>
          <div className="stack tight">
            <input
              ref={photoInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={upload('photo', (src) => setPhoto({ src, zoom: 1, x: 0, y: 0, adjust: DEFAULT_ADJUST }))}
            />
            <button className="btn" disabled={busy} onClick={() => photoInput.current?.click()}>
              {busy ? 'Processing…' : data.photo.src ? 'Replace photo' : 'Upload photo'}
            </button>
            {data.photo.src && (
              <button className="btn secondary" onClick={() => setPhoto({ src: null, zoom: 1, x: 0, y: 0, adjust: DEFAULT_ADJUST })}>Remove photo</button>
            )}
          </div>
        </div>
        {errorFor('photo')}
        {data.photo.src && (
          <div className="stack tight">
            <label className="slider">Zoom
              <input type="range" min={1} max={3} step={0.01} value={data.photo.zoom} onChange={(e) => setPhoto({ zoom: +e.target.value })} />
            </label>
            <label className="slider">Left / Right
              <input type="range" min={-100} max={100} step={1} value={data.photo.x} onChange={(e) => setPhoto({ x: +e.target.value })} />
            </label>
            <label className="slider">Up / Down
              <input type="range" min={-100} max={100} step={1} value={data.photo.y} onChange={(e) => setPhoto({ y: +e.target.value })} />
            </label>

            <div className="card-head">
              <span className="card-subtitle">Adjust look</span>
              {!sameAdjust(data.photo.adjust, DEFAULT_ADJUST) && (
                <button className="link" onClick={() => setPhoto({ adjust: DEFAULT_ADJUST })}>Reset</button>
              )}
            </div>
            <div className="chips" role="group" aria-label="Photo presets">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  className={`chip ${sameAdjust(p.adjust, data.photo.adjust) ? 'on' : ''}`}
                  aria-pressed={sameAdjust(p.adjust, data.photo.adjust)}
                  onClick={() => setPhoto({ adjust: p.adjust })}
                >
                  {p.name}
                </button>
              ))}
            </div>
            {ADJUSTERS.map(([key, label]) => {
              const [min, max] = ADJUST_RANGES[key];
              const v = data.photo.adjust[key];
              return (
                <label className="slider" key={key}>
                  {label}
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={1}
                    value={v}
                    onChange={(e) => setPhoto({ adjust: { ...data.photo.adjust, [key]: +e.target.value } })}
                  />
                  <span className="slider-val">{ADJUST_RANGES[key][2] === 0 ? v : v - 100 > 0 ? `+${v - 100}` : v - 100}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Header</div>
        <label className="stack tight">
          <span className="muted">Text above the details</span>
          <input
            className="value-input"
            value={data.headerText}
            placeholder="e.g. ॐ श्री गणेशाय नमः"
            maxLength={LIMITS.header}
            onChange={(e) => update((d) => ({ ...d, headerText: e.target.value, headerEdited: true }))}
          />
        </label>
        <button className="link" onClick={() => update((d) => ({ ...d, headerText: layout.defaultHeader, headerEdited: false }))}>
          Use this template's default text
        </button>
      </div>

      <div className="card">
        <div className="card-title">Logo</div>
        {!hasLogo && <p className="muted">This template has no logo slot.</p>}
        <label className="check">
          <input type="checkbox" checked={data.showLogo} onChange={(e) => update((d) => ({ ...d, showLogo: e.target.checked }))} />
          Show logo{hasLogo && ' above the header text'}
        </label>
        <input
          ref={logoInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          hidden
          onChange={upload('logo', (src) => update((d) => ({ ...d, logo: { ...d.logo, src }, showLogo: true })))}
        />
        <div className="btn-row">
          <button className="btn" disabled={busy} onClick={() => logoInput.current?.click()}>Upload your logo</button>
          {data.logo.src && (
            <button className="btn secondary" onClick={() => update((d) => ({ ...d, logo: { ...d.logo, src: null } }))}>Use built-in</button>
          )}
        </div>
        {errorFor('logo')}
        {data.logo.src && (
          <label className="check">
            <input type="checkbox" checked={data.logo.recolor} onChange={(e) => update((d) => ({ ...d, logo: { ...d.logo, recolor: e.target.checked } }))} />
            Black-on-white logo: remove white and match the template colour
          </label>
        )}
      </div>

      <button
        className="btn secondary"
        onClick={() =>
          update((d) => ({ ...d, showLogo: true, logo: { src: null, recolor: true }, headerText: layout.defaultHeader, headerEdited: false }))
        }
      >
        Use template defaults for logo &amp; header
      </button>
    </div>
  );
}
