import { useEffect, useState } from 'react';

/** Runs an async factory whenever `deps` change; keeps the previous value until the new one is ready. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): T | undefined {
  const [value, setValue] = useState<T>();
  useEffect(() => {
    let cancelled = false;
    fn()
      .then((v) => {
        if (!cancelled) setValue(v);
      })
      .catch(() => {
        if (!cancelled) setValue(undefined);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
