import { useRef } from 'react';
import type { BioData } from '../types';
import { clearedValues } from '../defaults';
import { looksLikeBiodata, normalize } from '../normalize';
import { downloadBlob } from '../lib/image';

/** An export holds at most two compressed images plus text, far below this. */
const MAX_IMPORT_MB = 20;

export function DataPanel({ data, setData, onResetAll }: { data: BioData; setData: (d: BioData) => void; onResetAll: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="stack">
      <div className="card">
        <div className="card-title">Save &amp; load</div>
        <p className="muted">Your work is saved in this browser automatically. Export a file to keep a copy or move it to another device.</p>
        <div className="btn-row">
          <button
            className="btn"
            onClick={() => downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'biodata.json')}
          >
            Export data (.json)
          </button>
          <button className="btn secondary" onClick={() => input.current?.click()}>Import data</button>
          <input
            ref={input}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              if (file.size > MAX_IMPORT_MB * 1024 * 1024) {
                alert(`That file is too large to be a biodata export (over ${MAX_IMPORT_MB} MB).`);
                return;
              }
              let parsed: unknown;
              try {
                parsed = JSON.parse(await file.text());
              } catch {
                alert('That file could not be read. Choose a .json file made with "Export data".');
                return;
              }
              if (!looksLikeBiodata(parsed)) {
                alert('That file is not a biodata export (it has no sections). Nothing was changed.');
                return;
              }
              if (confirm('Replace everything you have now with the contents of this file?')) setData(normalize(parsed));
            }}
          />
        </div>
      </div>
      <div className="card">
        <div className="card-title">Start over</div>
        <p className="muted">
          Only your biodata is stored, in this browser only (nothing is uploaded). <b>Reset everything</b> deletes it and starts
          fresh with the sample.
        </p>
        <div className="btn-row">
          <button className="btn secondary" onClick={() => confirm('Empty every value but keep the fields?') && setData(clearedValues(data))}>
            Clear all values
          </button>
          <button
            className="btn secondary danger"
            onClick={() =>
              confirm('Reset everything? This permanently deletes your details, photo and logo from this browser and reloads the app. Export your data first if you want a copy.') &&
              onResetAll()
            }
          >
            Reset everything
          </button>
        </div>
      </div>
    </div>
  );
}
