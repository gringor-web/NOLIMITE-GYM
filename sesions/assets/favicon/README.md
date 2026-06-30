# Favicon & brand-icon system

This folder holds the full favicon set referenced from `index.html`.

## Files

| File | Status | Purpose |
|------|--------|---------|
| `favicon.svg` | ✅ Ready (editable) | Modern scalable favicon. Source of truth for the brand mark. |
| `site.webmanifest` | ✅ Ready (editable) | PWA manifest (name, theme color, icons). |
| `favicon.ico` | ⬜ Drop in | Legacy fallback (16/32/48px) for old browsers. |
| `apple-touch-icon.png` | ⬜ Drop in | iOS home-screen icon, **180×180**, no transparency. |
| `android-chrome-192x192.png` | ⬜ Drop in | Android / PWA icon, **192×192**. |
| `android-chrome-512x512.png` | ⬜ Drop in | Android / PWA splash icon, **512×512**. |

The SVG already works in every modern browser, so the site renders a correct
icon today. The four raster files above are placeholders to add for full
legacy/iOS/Android coverage — drop them in with the **exact names** above and no
HTML changes are needed.

## Generate the raster files from `favicon.svg`

**Option A — online (fastest):** upload `favicon.svg` to
<https://realfavicongenerator.net> and export with these names.

**Option B — local with ImageMagick + a PNG render:**

```bash
# 512 base PNG from the SVG (needs a renderer like rsvg-convert or Inkscape)
rsvg-convert -w 512 -h 512 favicon.svg -o android-chrome-512x512.png
rsvg-convert -w 192 -h 192 favicon.svg -o android-chrome-192x192.png
rsvg-convert -w 180 -h 180 favicon.svg -o apple-touch-icon.png

# Multi-resolution .ico
magick android-chrome-512x512.png -define icon:auto-resize=16,32,48 favicon.ico
```

## Rebranding for another gym client

1. Edit colors/shape in `favicon.svg` (currently `#0A0A0A` background,
   `#E4002B` accent — match the site's `--color-bg` / `--color-accent`).
2. Re-export the four raster files (same names).
3. Update `name` / `short_name` / colors in `site.webmanifest`.

No changes to `index.html` or the layout are required.
