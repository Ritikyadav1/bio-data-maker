import { useState } from 'react';
import { useBiodata } from './store';
import { getLayout } from './templates';
import { LayoutPage } from './templates/LayoutPage';
import { EXPORT_SURFACE_ID } from './lib/capture';
import { exportPdf, exportPng } from './lib/exportPdf';
import { exportDocx } from './lib/exportDocx';
import { findByKey } from './templates/content';
import { DetailsPanel } from './components/DetailsPanel';
import { MediaPanel } from './components/MediaPanel';
import { TemplatesPanel } from './components/TemplatesPanel';
import { DataPanel } from './components/DataPanel';
import { Preview } from './components/Preview';

type Tab = 'details' | 'media' | 'templates' | 'data';
const TABS: { id: Tab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'media', label: 'Photo & Logo' },
  { id: 'templates', label: 'Templates' },
  { id: 'data', label: 'Save' },
];

export default function App() {
  const { data, setData, update, setTemplate, saveFailed, resetAll } = useBiodata();
  const [tab, setTab] = useState<Tab>('details');
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [busy, setBusy] = useState<string | null>(null);
  const layout = getLayout(data.templateId);

  const baseName = () => {
    const n = findByKey(data, 'name')?.value.trim();
    return `Biodata${n ? '-' + n.replace(/[^\wऀ-ॿ]+/g, '-').slice(0, 60) : ''}`;
  };

  const run = async (label: string, fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(label);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      alert(`Could not create the ${label}. ${e instanceof Error ? e.message : ''}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="om">ॐ</span> <span className="brand-name">Biodata Maker</span>
        </div>
        <div className="actions">
          <button className="btn primary" disabled={!!busy} onClick={() => run('PDF', () => exportPdf(`${baseName()}.pdf`))}>
            {busy === 'PDF' ? 'Making…' : <><span className="hide-sm">Download </span>PDF</>}
          </button>
          <button className="btn" disabled={!!busy} onClick={() => run('Word file', () => exportDocx(layout, data, `${baseName()}.docx`))}>
            {busy === 'Word file' ? 'Making…' : <><span className="hide-sm">Download </span>Word</>}
          </button>
          <button className="btn secondary" disabled={!!busy} onClick={() => run('image', () => exportPng(`${baseName()}.png`))}>
            {busy === 'image' ? 'Making…' : 'Image'}
          </button>
          <button className="btn secondary hide-sm" onClick={() => window.print()} title="Opens the print dialog; choose 'Save as PDF' for a vector PDF">
            Print
          </button>
        </div>
      </header>

      {saveFailed && (
        <div className="banner" role="alert">
          Changes can't be saved in this browser (storage is full or blocked), so they will be lost when you close the page.
          Use a smaller photo, or keep a copy with <b>Save → Export data</b>.
        </div>
      )}

      <div className="mobile-switch">
        <button className={view === 'edit' ? 'on' : ''} onClick={() => setView('edit')}>Edit</button>
        <button className={view === 'preview' ? 'on' : ''} onClick={() => setView('preview')}>Preview</button>
      </div>

      <main className={`main view-${view}`}>
        <aside className="panel">
          <nav className="tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="panel-body">
            {tab === 'details' && <DetailsPanel data={data} update={update} />}
            {tab === 'media' && <MediaPanel data={data} update={update} layout={layout} />}
            {tab === 'templates' && (
              <TemplatesPanel
                data={data}
                onPick={(id) => {
                  setTemplate(id);
                  setView('preview');
                }}
              />
            )}
            {tab === 'data' && <DataPanel data={data} setData={setData} onResetAll={resetAll} />}
          </div>
        </aside>

        <section className="stage">
          <Preview layout={layout} data={data} />
        </section>
      </main>

      <footer className="footer">Made by Ritik Yadav</footer>

      {/* Full-size, off-screen copy used for PDF / image / Word capture and for printing. */}
      <div className="export-root" aria-hidden="true">
        <LayoutPage id={EXPORT_SURFACE_ID} layout={layout} data={data} exporting />
      </div>
    </div>
  );
}
