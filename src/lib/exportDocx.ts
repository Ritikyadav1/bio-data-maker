import {
  AlignmentType,
  BorderStyle,
  Document,
  FrameAnchorType,
  Header,
  HeightRule,
  HorizontalPositionRelativeFrom,
  ImageRun,
  LineRuleType,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  TextWrappingType,
  VerticalAlign,
  VerticalPositionRelativeFrom,
  WidthType,
  type FileChild,
  type IRunOptions,
} from 'docx';
import type { BioData } from '../types';
import { clean } from '../normalize';
import type { Layout } from '../templates/types';
import { identityLines, placed, visibleSections } from '../templates/content';
import { PAGE_H, PAGE_W, TAG_PAD } from '../templates/LayoutPage';
import { captureSurface } from './capture';
import { resolveLogo, resolvePhoto } from './assets';
import { dataUrlToBytes, downloadBlob, loadImage } from './image';

const T = (px: number) => Math.round(px * 15); // px (96dpi) -> twips
const EMU = (px: number) => Math.round(px * 9525);
const HP = (px: number) => Math.max(2, Math.round(px * 1.5)); // px -> half-points
const hex = (c: string) => c.replace('#', '').toUpperCase();

const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } as const;
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE } as const;

function floatingAt(x: number, y: number, behind: boolean) {
  return {
    horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: EMU(x) },
    verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: EMU(y) },
    behindDocument: behind,
    allowOverlap: true,
    lockAnchor: true,
    wrap: { type: TextWrappingType.NONE },
  } as const;
}

/** Rendered width of a heading in px, so a Word 'tag' box hugs its text like the preview does. */
function textWidth(text: string, h: Layout['heading'], family: string) {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = `${h.weight} ${h.size}px ${family}`;
  return ctx.measureText(text).width + h.letterSpacing * text.length;
}

/** Every run goes through here: characters that are illegal in XML would make Word reject the whole file. */
const run = (o: IRunOptions & { text: string }) => new TextRun({ ...o, text: clean(o.text) });

function lines(text: string): TextRun[] {
  return text.split('\n').map(
    (t, i) => run({ text: t, break: i > 0 ? 1 : 0 }),
  );
}

/**
 * Word version of the current design: the template artwork sits behind the text as a full-page picture,
 * and everything else (header, headings, rows, photo, logo) is real, editable Word content.
 */
export async function exportDocx(layout: Layout, data: BioData, filename: string) {
  const L = placed(layout, data);
  const p = L.page;
  const h = L.heading;

  const bg = (await captureSurface({ scale: 2, bgOnly: true })).toDataURL('image/png');
  const photo = await resolvePhoto(data, L.photo.w, L.photo.h);
  const logo = await resolveLogo(data, L.header.logo?.color);

  const font = (kind: 'body' | 'header') => ({
    ascii: L.docxFonts[kind],
    hAnsi: L.docxFonts[kind],
    cs: L.docxFonts.devanagari,
    eastAsia: L.docxFonts[kind],
  });

  /* ---------- header part: artwork, logo, photo, header text, identity block ---------- */
  const imgRuns: ImageRun[] = [
    new ImageRun({
      type: 'png',
      data: dataUrlToBytes(bg),
      transformation: { width: PAGE_W, height: PAGE_H },
      floating: floatingAt(0, 0, true),
    }),
  ];
  if (logo && L.header.logo) {
    const im = await loadImage(logo);
    const lh = L.header.logo.h;
    const lw = (lh * im.naturalWidth) / im.naturalHeight;
    imgRuns.push(
      new ImageRun({
        type: 'png',
        data: dataUrlToBytes(logo),
        transformation: { width: lw, height: lh },
        floating: floatingAt((PAGE_W - lw) / 2, L.header.logo.y, false),
      }),
    );
  }
  if (photo) {
    imgRuns.push(
      new ImageRun({
        type: 'jpg',
        data: dataUrlToBytes(photo),
        transformation: { width: L.photo.w, height: L.photo.h },
        floating: floatingAt(L.photo.x, L.photo.y, false),
      }),
    );
  }

  const headerChildren: Paragraph[] = [
    new Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT }, children: imgRuns }),
  ];
  // Positioned text frames live in the body: Word and LibreOffice only honour page-anchored frames there.
  const frames: Paragraph[] = [];

  const frame = (x: number, y: number, w: number, hgt: number) =>
    ({
      type: 'absolute',
      position: { x: T(x), y: T(y) },
      width: T(w),
      height: T(hgt),
      anchor: { horizontal: FrameAnchorType.PAGE, vertical: FrameAnchorType.PAGE },
    }) as const;

  const headerText = data.headerText.trim();
  if (headerText) {
    frames.push(
      new Paragraph({
        frame: frame(0, L.header.y, PAGE_W, L.header.size * 1.7),
        alignment: AlignmentType.CENTER,
        children: [
          run({
            text: L.header.upper ? headerText.toUpperCase() : headerText,
            bold: L.header.weight >= 600,
            color: hex(L.header.color),
            size: HP(L.header.size),
            characterSpacing: Math.round(L.header.letterSpacing * 15),
            font: font('header'),
          }),
        ],
      }),
    );
  }

  if (L.identity) {
    const id = L.identity;
    const { name, lines: extra } = identityLines(data);
    let y = id.y;
    const w = PAGE_W - id.x - 60;
    if (name) {
      frames.push(
        new Paragraph({
          frame: frame(id.x, y, w, id.nameSize * 1.5),
          children: [run({ text: name, bold: true, color: hex(id.color), size: HP(id.nameSize), font: font('body') })],
        }),
      );
      y += id.nameSize * 1.25 + id.gap;
    }
    for (const t of extra) {
      frames.push(
        new Paragraph({
          frame: frame(id.x, y, w, id.lineSize * 1.6),
          children: [run({ text: t, color: hex(id.lineColor), size: HP(id.lineSize), font: font('body') })],
        }),
      );
      y += id.lineSize * 1.4 + id.gap;
    }
  }

  /* ---------- body: sections ---------- */
  const spacer = (px: number) =>
    new Paragraph({ spacing: { before: 0, after: 0, line: Math.max(20, T(px)), lineRule: LineRuleType.EXACT }, children: [] });

  const body: FileChild[] = [];
  const sections = visibleSections(data, L);

  sections.forEach((sec, i) => {
    const gap = i ? p.sectionGap : 0;
    const title = h.upper ? sec.title.toUpperCase() : sec.title;

    if (h.style === 'pill' || h.style === 'tag') {
      const boxW = h.style === 'pill' ? (h.pillW ?? 190) : textWidth(title, h, L.fonts.body) + 2 * TAG_PAD + 4;
      body.push(spacer(gap));
      body.push(
        new Table({
          alignment: h.style === 'pill' ? AlignmentType.CENTER : AlignmentType.LEFT,
          width: { size: T(boxW), type: WidthType.DXA },
          columnWidths: [T(boxW)],
          layout: TableLayoutType.FIXED,
          borders: { ...noBorders, insideHorizontal: NONE, insideVertical: NONE },
          rows: [
            new TableRow({
              height: { value: T(h.height), rule: HeightRule.EXACT },
              children: [
                new TableCell({
                  width: { size: T(boxW), type: WidthType.DXA },
                  margins: { left: 0, right: 0 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { type: ShadingType.CLEAR, fill: hex(h.bg ?? '#000000'), color: 'auto' },
                  borders: noBorders,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        run({
                          text: title,
                          bold: h.weight >= 600,
                          color: hex(h.color),
                          size: HP(h.size),
                          characterSpacing: Math.round(h.letterSpacing * 15),
                          font: font('body'),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      );
      body.push(spacer(h.marginBottom));
    } else {
      body.push(
        new Paragraph({
          alignment: h.style === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { before: T(gap), after: T(h.marginBottom), line: T(h.height), lineRule: LineRuleType.AT_LEAST },
          children: [
            run({
              text: title,
              bold: h.weight >= 600,
              underline: h.style === 'underline' ? {} : undefined,
              color: hex(h.color),
              size: HP(h.size),
              characterSpacing: Math.round(h.letterSpacing * 15),
              font: font('body'),
            }),
          ],
        }),
      );
    }

    const labelW = T(p.labelWidth);
    const valueW = T(p.contentWidth) - labelW;
    body.push(
      new Table({
        width: { size: T(p.contentWidth), type: WidthType.DXA },
        columnWidths: [labelW, valueW],
        layout: TableLayoutType.FIXED,
        borders: { ...noBorders, insideHorizontal: NONE, insideVertical: NONE },
        rows: sec.fields.map(
          (f) =>
            new TableRow({
              height: { value: T(p.rowH), rule: HeightRule.ATLEAST },
              children: [
                new TableCell({
                  width: { size: labelW, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  borders: noBorders,
                  margins: { top: 0, bottom: 0, left: 0, right: 80 },
                  children: [
                    new Paragraph({
                      children: [run({ text: f.label, color: hex(L.colors.label), size: HP(p.fontSize), font: font('body') })],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: valueW, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  borders: noBorders,
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  children: [
                    new Paragraph({
                      // runs without explicit formatting inherit the document default (font, size, colour)
                      children: [run({ text: ': ' }), ...(f.value.trim() ? lines(f.value.trim()) : [])],
                    }),
                  ],
                }),
              ],
            }),
        ),
      }),
    );
  });

  const doc = new Document({
    creator: 'Biodata Maker',
    title: 'Marriage Bio-Data',
    styles: {
      default: {
        document: {
          run: { font: font('body'), size: HP(p.fontSize), color: hex(L.colors.text) },
          paragraph: { spacing: { before: 0, after: 0 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: {
              top: T(p.contentTop),
              left: T(p.contentLeft),
              right: Math.max(0, T(PAGE_W - p.contentLeft - p.contentWidth)),
              bottom: T(p.contentBottom),
              header: 0,
              footer: 0,
            },
          },
        },
        headers: { default: new Header({ children: headerChildren }) },
        children: [...frames, ...(body.length ? body : [new Paragraph({ children: [] })])],
      },
    ],
  });

  downloadBlob(await Packer.toBlob(doc), filename);
}
