import { Component, type ErrorInfo, type ReactNode } from 'react';
import { STORAGE_KEY, savedRaw } from '../store';
import { downloadBlob } from '../lib/image';

/**
 * Last line of defence: if rendering ever throws, show a recovery screen instead of a blank page,
 * with a way to rescue the saved data before starting over.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Biodata Maker crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const raw = savedRaw();
    return (
      <div className="crash" role="alert">
        <h1>Something went wrong</h1>
        <p>The page hit an unexpected error. Your details are still saved in this browser.</p>
        <p className="muted">{this.state.error.message}</p>
        <div className="btn-row">
          <button className="btn primary" onClick={() => location.reload()}>Reload the page</button>
          {raw && (
            <button className="btn" onClick={() => downloadBlob(new Blob([raw], { type: 'application/json' }), 'biodata-backup.json')}>
              Download my data
            </button>
          )}
          <button
            className="btn secondary danger"
            onClick={() => {
              if (!confirm('This permanently deletes the saved biodata in this browser. Download your data first if you need it. Continue?')) return;
              try {
                localStorage.removeItem(STORAGE_KEY);
              } catch {
                /* storage blocked: reload anyway */
              }
              location.reload();
            }}
          >
            Start fresh
          </button>
        </div>
      </div>
    );
  }
}
