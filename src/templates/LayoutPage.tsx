import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { BioData } from '../types';
import type { Layout } from './types';
import { identityLines, placed, visibleSections } from './content';
import { resolveLogo, resolvePhoto } from '../lib/assets';
import { useAsync } from '../lib/hooks';
import { adjustKey } from '../photoFilters';

export const PAGE_W = 794;
export const PAGE_H = 1123;
/** horizontal padding inside a 'tag' heading */
export const TAG_PAD = 8;

const S = 'var(--s, 1)';
const px = (v: number) => `calc(${v}px * ${S})`;

interface Props {
  layout: Layout;
  data: BioData;
  /** Export mode: no editor placeholders. */
  exporting?: boolean;
  id?: string;
}

/** Renders one A4 page for any Layout. Content shrinks automatically if it would overflow the page. */
export function LayoutPage({ layout, data, exporting = false, id }: Props) {
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const L = placed(layout, data);
  const p = L.page;

  const photoUrl = useAsync(
    () => resolvePhoto(data, L.photo.w, L.photo.h),
    [data.photo.src, data.photo.zoom, data.photo.x, data.photo.y, adjustKey(data.photo.adjust), L.photo.w, L.photo.h],
  );
  const logoUrl = useAsync(() => resolveLogo(data, L.header.logo?.color), [
    data.showLogo,
    data.logo.src,
    data.logo.recolor,
    L.id,
  ]);

  const art = useMemo(() => layout.art(), [layout]);
  const sections = visibleSections(data, L);
  const identity = L.identity ? identityLines(data) : null;
  const headerText = data.headerText.trim();

  const fit = () => {
    const page = pageRef.current;
    const content = contentRef.current;
    if (!page || !content) return;
    const avail = PAGE_H - p.contentTop - p.contentBottom;
    let s = 1;
    page.style.setProperty('--s', '1');
    while (content.offsetHeight > avail && s > 0.6) {
      s = Math.round((s - 0.03) * 100) / 100;
      page.style.setProperty('--s', String(s));
    }
  };
  useLayoutEffect(fit);
  useEffect(() => {
    document.fonts?.ready.then(fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L.id]);

  const fs = p.fontSize;
  const lineH = fs * 1.4;
  const rowPad = Math.max(0, (p.rowH - lineH) / 2);
  const h = L.heading;

  const headingEl = (title: string) => {
    const base: CSSProperties = {
      fontSize: px(h.size),
      fontWeight: h.weight,
      color: h.color,
      letterSpacing: `${h.letterSpacing}px`,
      textTransform: h.upper ? 'uppercase' : 'none',
      height: px(h.height),
      lineHeight: px(h.height),
      marginBottom: px(h.marginBottom),
      whiteSpace: 'nowrap',
    };
    if (h.style === 'pill' || h.style === 'tag') {
      const pill = h.style === 'pill';
      return (
        <div style={{ display: 'flex', justifyContent: pill ? 'center' : 'flex-start', marginBottom: px(h.marginBottom) }}>
          <div
            style={{
              ...base,
              marginBottom: 0,
              width: pill ? px(h.pillW ?? 190) : undefined,
              padding: pill ? undefined : `0 ${px(TAG_PAD)}`,
              background: h.bg,
              borderRadius: pill ? 999 : h.radius,
              textAlign: 'center',
            }}
          >
            {title}
          </div>
        </div>
      );
    }
    return (
      <div
        style={{
          ...base,
          textAlign: h.style === 'center' ? 'center' : 'left',
          textDecoration: h.style === 'underline' ? 'underline' : 'none',
          textUnderlineOffset: '3px',
        }}
      >
        {title}
      </div>
    );
  };

  return (
    <div
      ref={pageRef}
      id={id}
      className="bd-page"
      style={{
        width: PAGE_W,
        height: PAGE_H,
        fontFamily: L.fonts.body,
        color: L.colors.text,
      }}
    >
      {art.kind === 'svg' ? (
        <div className="bd-art" dangerouslySetInnerHTML={{ __html: art.markup }} />
      ) : (
        <div className="bd-art" style={{ backgroundImage: `url(${art.src})`, backgroundSize: '100% 100%' }} />
      )}

      <div className="bd-fg">
        {L.header.logo && logoUrl && (
          <div
            style={{
              position: 'absolute',
              top: L.header.logo.y,
              left: 0,
              width: PAGE_W,
              height: L.header.logo.h,
              backgroundImage: `url(${logoUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}

        {headerText && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: L.header.y,
              width: PAGE_W,
              textAlign: 'center',
              fontFamily: L.fonts.header,
              fontSize: L.header.size,
              lineHeight: `${L.header.size * 1.5}px`,
              fontWeight: L.header.weight,
              color: L.header.color,
              letterSpacing: `${L.header.letterSpacing}px`,
              textTransform: L.header.upper ? 'uppercase' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {headerText}
          </div>
        )}

        {(photoUrl || !exporting) && (
          <div
            style={{
              position: 'absolute',
              left: L.photo.x,
              top: L.photo.y,
              width: L.photo.w,
              height: L.photo.h,
              overflow: 'hidden',
              border: L.photo.border,
              borderRadius: L.photo.radius,
              background: photoUrl ? undefined : '#f3f1ee',
              outline: photoUrl ? undefined : '1px dashed #c9c2b8',
              outlineOffset: -1,
            }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
            ) : (
              <div className="bd-photo-ph">Photo</div>
            )}
          </div>
        )}

        {identity && L.identity && (
          <div style={{ position: 'absolute', left: L.identity.x, top: L.identity.y, width: PAGE_W - L.identity.x - 60 }}>
            {identity.name && (
              <div style={{ fontSize: L.identity.nameSize, fontWeight: 700, color: L.identity.color, lineHeight: 1.25, marginBottom: L.identity.gap }}>
                {identity.name}
              </div>
            )}
            {identity.lines.map((t) => (
              <div key={t} style={{ fontSize: L.identity!.lineSize, color: L.identity!.lineColor, lineHeight: 1.4, marginBottom: L.identity!.gap }}>
                {t}
              </div>
            ))}
          </div>
        )}

        <div ref={contentRef} style={{ position: 'absolute', left: p.contentLeft, top: p.contentTop, width: p.contentWidth }}>
          {sections.map((sec, i) => (
            <div key={sec.id} style={{ marginTop: i ? px(p.sectionGap) : 0 }}>
              {headingEl(sec.title)}
              {sec.fields.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    fontSize: px(fs),
                    lineHeight: px(lineH),
                    paddingTop: px(rowPad),
                    paddingBottom: px(rowPad),
                  }}
                >
                  <div style={{ width: p.labelWidth, flex: 'none', paddingRight: 6, color: L.colors.label }}>{f.label}</div>
                  <div style={{ flex: 1, minWidth: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                    {f.value.trim() ? `: ${f.value.trim()}` : ':'}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
