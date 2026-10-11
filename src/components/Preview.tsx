import { useEffect, useRef, useState } from 'react';
import type { BioData } from '../types';
import type { Layout } from '../templates/types';
import { LayoutPage, PAGE_H, PAGE_W } from '../templates/LayoutPage';

/** Shows the A4 page scaled to fit the available width. */
export function Preview({ layout, data }: { layout: Layout; data: BioData }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1.1, Math.max(0.3, (el.clientWidth - 24) / PAGE_W)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="preview" ref={box}>
      <div className="sheet" style={{ width: PAGE_W * scale, height: PAGE_H * scale }}>
        <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
          <LayoutPage layout={layout} data={data} />
        </div>
      </div>
    </div>
  );
}
