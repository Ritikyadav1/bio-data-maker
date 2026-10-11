export type ArtSource = { kind: 'svg'; markup: string } | { kind: 'image'; src: string };

export interface HeadingStyle {
  /**
   * plain = coloured text, underline = plain + underline, center = centred, pill = centred rounded bar of width pillW,
   * tag = left-aligned box that fits the text
   */
  style: 'plain' | 'underline' | 'center' | 'pill' | 'tag';
  size: number;
  weight: number;
  color: string;
  letterSpacing: number;
  upper: boolean;
  /** box height in px */
  height: number;
  marginBottom: number;
  /** pill / tag only */
  bg?: string;
  pillW?: number;
  /** tag corner radius, px */
  radius?: number;
}

/**
 * Everything that defines a template. All numbers are px on an A4 page of 794 x 1123 (96dpi).
 * The same config drives the on-screen preview, the PDF and the Word export, so a new template
 * is just a new Layout (plus its artwork) registered in templates/index.ts.
 */
export interface Layout {
  id: string;
  name: string;
  description: string;
  /** Header text used when the user has not typed their own. */
  defaultHeader: string;
  /** Used for thumbnails/labels. */
  accent: string;
  fonts: { body: string; header: string };
  /** Fonts for Word (must be installed on the reader's machine). */
  docxFonts: { body: string; header: string; devanagari: string };
  colors: { text: string; label: string };
  page: {
    contentLeft: number;
    contentTop: number;
    /**
     * Optional: where content starts when the header area is empty (logo off and no header text).
     * Content and photo move up by the difference, so the logo slot costs nothing when unused.
     */
    compactTop?: number;
    contentWidth: number;
    /** space kept free at the bottom */
    contentBottom: number;
    labelWidth: number;
    rowH: number;
    fontSize: number;
    sectionGap: number;
  };
  heading: HeadingStyle;
  header: {
    /** top of the header text box */
    y: number;
    size: number;
    color: string;
    weight: number;
    letterSpacing: number;
    upper: boolean;
    /** Centred logo; omit for templates without one. */
    logo?: { y: number; h: number; color: string };
  };
  photo: { x: number; y: number; w: number; h: number; border?: string; radius?: number };
  /** If set, name / date of birth / place of birth are shown here instead of in the rows. */
  identity?: { x: number; y: number; nameSize: number; lineSize: number; color: string; lineColor: string; gap: number };
  /** Artwork behind the content (lazy, so it is only generated when used). */
  art: () => ArtSource;
}
