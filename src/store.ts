import { useCallback, useEffect, useRef, useState } from 'react';
import type { BioData } from './types';
import { normalize } from './normalize';
import { getLayout } from './templates';
import { clearImageCaches } from './lib/image';

/** The only thing this app stores: the biodata itself, in this one localStorage key. */
export const STORAGE_KEY = 'biodata-maker:v1';

/** Deletes anything else under our prefix (left by older versions), so the app never keeps more than one entry. */
function removeStrayKeys() {
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith('biodata-maker:') && k !== STORAGE_KEY) localStorage.removeItem(k);
  }
}

function load(): BioData {
  try {
    removeStrayKeys();
  } catch {
    /* best effort; must never stop the real data loading below */
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // unreadable JSON throws and falls through to fresh sample data, which the next save replaces it with
    return normalize(raw == null ? null : JSON.parse(raw));
  } catch {
    /* storage blocked (privacy mode / disabled site data) or corrupt: start fresh, saving reports any problem */
    return normalize(null);
  }
}

/** The raw saved JSON, for the crash screen's "download my data" button. */
export function savedRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function useBiodata() {
  const [data, setData] = useState<BioData>(load);
  /** false while saving works; true once the browser refused (storage full or blocked) */
  const [saveFailed, setSaveFailed] = useState(false);
  const latest = useRef(data);
  /** set by resetAll so nothing (debounce or tab-close save) writes the old data back */
  const wiped = useRef(false);

  const save = useCallback(() => {
    if (wiped.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latest.current));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }, []);

  useEffect(() => {
    latest.current = data;
    const t = window.setTimeout(save, 300);
    return () => window.clearTimeout(t);
  }, [data, save]);

  // don't lose the last keystrokes if the tab is closed inside the 300 ms debounce
  useEffect(() => {
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, [save]);

  const update = useCallback((fn: (d: BioData) => BioData) => setData((d) => fn(d)), []);

  const setTemplate = useCallback((id: string) => {
    setData((d) => {
      const next = getLayout(id);
      const prev = getLayout(d.templateId);
      // follow the template's default header unless the user typed their own
      const follow = !d.headerEdited || d.headerText === prev.defaultHeader;
      return { ...d, templateId: id, headerText: follow ? next.defaultHeader : d.headerText, headerEdited: follow ? false : d.headerEdited };
    });
  }, []);

  /** Forget everything: saved data and in-memory image caches, then reload into a clean first-visit state. */
  const resetAll = useCallback(() => {
    wiped.current = true;
    clearImageCaches();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage blocked: nothing was saved anyway */
    }
    location.reload();
  }, []);

  return { data, setData, update, setTemplate, saveFailed, resetAll };
}
