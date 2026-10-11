export type FieldKey = 'name' | 'dob' | 'pob';

export interface Field {
  id: string;
  /** Marks fields a template may show in a special place (e.g. the identity block). */
  key?: FieldKey;
  label: string;
  value: string;
  /** Chosen display format for date / time / height fields (see fieldTypes.ts). */
  fmt?: string;
}

export interface Section {
  id: string;
  title: string;
  fields: Field[];
}

/** Photo look adjustments in percent; ranges and presets live in photoFilters.ts. */
export interface PhotoAdjust {
  brightness: number;
  contrast: number;
  /** 0 = black & white */
  saturate: number;
  /** sepia amount */
  warmth: number;
  /** 0..100, edge-aware smoothing of skin tones */
  smooth: number;
  /** 0..100, unsharp mask */
  sharpen: number;
}

export interface PhotoState {
  src: string | null;
  /** 1 = cover the frame, up to 3x */
  zoom: number;
  /** -100..100, moves the visible window horizontally */
  x: number;
  /** -100..100, moves the visible window vertically */
  y: number;
  adjust: PhotoAdjust;
}

export interface LogoState {
  /** null = the built-in Shree Ganesh logo */
  src: string | null;
  /** Re-colour an uploaded black-on-white logo to the template colour */
  recolor: boolean;
}

export interface BioData {
  templateId: string;
  headerText: string;
  headerEdited: boolean;
  showLogo: boolean;
  hideEmpty: boolean;
  photo: PhotoState;
  logo: LogoState;
  sections: Section[];
}
