# Biodata Maker

A static React + TypeScript app (Vite) for building marriage bio-data sheets. Edit fields, add or remove sections and rows, upload a photo and a logo, pick a template, and export **PDF**, **Word (.docx)**, **PNG** or print. Everything runs in the browser; data is stored in `localStorage`, so no backend is needed.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build -> dist/
npm run preview    # serve dist/ locally
```

## Deploy to Vercel

`vercel.json` is already set up (framework `vite`, output `dist`).

- **GitHub:** push the repo, then *Add New Project* in Vercel and import it. No settings need changing.
- **CLI:** `npm i -g vercel && vercel --prod`

## How it works

One `Layout` object per template (pixel coordinates on a 794 x 1123 A4 grid) drives the live preview, PDF/PNG export and the Word export, so a template is defined once.

```
src/
  types.ts, defaults.ts      data model + sample data
  store.ts                   state + localStorage persistence
  templates/
    types.ts                 Layout / ArtSource types
    layouts.ts               built-in templates (zari, aangan, ivory, marigold, aparajita + the "classic"
                             family: swarna, gulaal, jamuni, mehfil, tulsi, neel, patjhad, kajal, sona, kandeel)
    imageLayout.ts           helper for templates whose background is an image
    index.ts                 template registry
    LayoutPage.tsx           renders one A4 page from a Layout
  art/svg.ts, art/classic.ts generated SVG artwork (mandala, flowers, corners, vines, lanterns ...)
  fieldTypes.ts              dropdown options + date/time/height formats, picked by field label
  lib/                       image helpers, html2canvas capture, PDF / DOCX export
  components/                editor panels
```

## Adding a new template

**Option A - background is an image (easiest).** Put the artwork (A4 ratio, ideally 1588 x 2246 px, with no text on it) in `public/templates/my-template.png`, then add to `src/templates/layouts.ts`:

```ts
export const myTemplate = imageLayout({
  ...zari,                       // start from an existing layout, override what differs
  id: 'my-template',
  name: 'My Template',
  description: 'Short blurb shown in the picker',
  bg: '/templates/my-template.png',
  page:  { ...zari.page, contentLeft: 105, contentTop: 170, contentWidth: 480, labelWidth: 150 },
  photo: { ...zari.photo, x: 595, y: 190, w: 130, h: 170 },
});
```

**Option B - generated artwork.** Write a function in `src/art/svg.ts` returning SVG markup and set `art: () => ({ kind: 'svg', markup })` in a full `Layout`.

Then add the layout to the array in `src/templates/index.ts`. It shows up in the Templates tab automatically, with a live thumbnail.

Tips for matching a screenshot: measure positions in pixels at A4 = 794 x 1123 (`contentLeft/Top`, `labelWidth`, `rowH`, photo box, logo `y`/`h`). Open the app, switch to the template, and compare against the reference side by side.

## Notes and limits

- **PDF** is an image-based A4 render (exact look). **Print** uses the browser dialog, which produces a vector PDF with selectable text.
- **Word** keeps the artwork as a full-page picture behind real, editable text. Fonts fall back to Arial/Georgia/Mangal if the original fonts are not installed, and pill headings become shaded rectangles.
- The bundled Ganesh logo (`public/assets/ganesh-logo.png`) has a faint stock-site watermark. Upload a clean, licensed logo from the *Photo & Logo* tab, or replace that file.
- Generic placeholder data ("Full Name", "City, State" ...) is loaded on first run. Use *Save -> Clear all values* to start blank, or *Save -> Reset everything* to return to the placeholders.
- *Save* tab: export/import your data as JSON to move it between devices.
