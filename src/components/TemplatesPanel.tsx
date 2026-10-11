import type { BioData } from '../types';
import { layouts } from '../templates';
import { LayoutPage, PAGE_H, PAGE_W } from '../templates/LayoutPage';

/** Thumbnail scale; small enough that two fit side by side on a 360px-wide phone. */
const THUMB = 0.17;

export function TemplatesPanel({ data, onPick }: { data: BioData; onPick: (id: string) => void }) {
  return (
    <div className="stack">
      <div className="templates">
        {layouts.map((l) => (
          <button key={l.id} className={`tpl ${l.id === data.templateId ? 'active' : ''}`} onClick={() => onPick(l.id)} aria-pressed={l.id === data.templateId}>
            <span className="tpl-thumb" style={{ width: PAGE_W * THUMB, height: PAGE_H * THUMB }}>
              <span style={{ display: 'block', width: PAGE_W, height: PAGE_H, transform: `scale(${THUMB})`, transformOrigin: '0 0', pointerEvents: 'none' }}>
                <LayoutPage layout={l} data={data} />
              </span>
            </span>
            <span className="tpl-name">{l.name}</span>
            <span className="tpl-desc">{l.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
