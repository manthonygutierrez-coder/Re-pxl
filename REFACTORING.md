# Re-pxl Refactoring Guide
## Figma-Driven Modular Refactor — Complete Blueprint

**Branch:** `figma-ui-redesign`
**Figma Source:** [drawing-and-anim8tion-mAker](https://www.figma.com/design/KYTXEJnFUE4ixf1fjIR5mE/drawing-and-anim8tion-mAker?node-id=2-3)
**Status:** In Progress — Phase 1-4 CSS complete, Phase 5 onward pending
**Last Updated:** 2026-05-20

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What Exists vs. What Is Needed](#2-what-exists-vs-what-is-needed)
3. [Correct Design Tokens](#3-correct-design-tokens)
4. [Target Layout Architecture](#4-target-layout-architecture)
5. [Phase 1-4 — CSS Extraction (✅ COMPLETE)](#5-phase-1-4--css-extraction--complete)
6. [Phase 5 — HTML Restructure](#6-phase-5--html-restructure)
7. [Phase 6 — JS Module Extraction](#7-phase-6--js-module-extraction)
8. [Phase 7 — Functional Regression Testing](#8-phase-7--functional-regression-testing)
9. [File Structure Target](#9-file-structure-target)
10. [CSS Class Mapping: Old → New](#10-css-class-mapping-old--new)
11. [Known Issues & Decisions](#11-known-issues--decisions)

---

## 1. Project Overview

Re-pxl is a pixel-art animation drawing tool — currently a single monolithic `index.html` (6,636 lines / 153KB) containing all HTML, CSS, and JavaScript inline.

The goal of this refactor is to:

- Apply the **"Retrofitted Future" retro handheld console UI** from the Figma design
- Break the monolith into modular CSS files and separate JS modules
- Preserve **100% of existing functionality** — no features are being removed
- Use the correct design tokens (orange shell, teal accent, retro button styling)
- Adopt the bento grid layout: canvas top, TIME + PALETTE mid, TOOLS bottom

### Source of Truth

| Source | Purpose |
|--------|--------|
| `figma.com/design/KYTXEJnFUE4ixf1fjIR5mE/` | Visual design — authoritative for all colors, spacing, layout |
| `index.html` @ `ec87c7f` | Functional logic — authoritative for all JS behavior to preserve |
| This document | Governs the refactor process end to end |

---

## 2. What Exists vs. What Is Needed

### Phase 1-4 CSS (✅ COMPLETE on `figma-ui-redesign`)

| File | Status |
|------|--------|
| `styles/design-tokens.css` | ✅ Correct Figma tokens (orange #e67e22, teal #4ecdc4) |
| `styles/base.css` | ✅ Reset, fonts, scrollbar, animations |
| `styles/layout.css` | ✅ Device shell, bento grid, canvas, tools layout |
| `styles/components.css` | ✅ Tactile buttons, swatches, modals |
| `styles/toolbar.css` | ✅ Toolbar bar, select toolbar |
| `styles/palette.css` | ✅ 5-column swatch grid, active colors |
| `styles/popovers.css` | ✅ Modals, help overlays |
| `styles/timeline.css` | ✅ TIME module, frame preview, playback |
| `styles/tooltips.css` | ✅ 4-directional tooltip animations |
| `REFACTORING.md` | ✅ Complete task breakdown |
| `DESIGN.md` | ⚠️ Needs update with Figma colors (see Section 3) |

### Phase 5 (TODO) — HTML Structure

- [ ] Update `index.html` — remove inline `<style>`, add `<link>` tags
- [ ] Restructure HTML body from floating panels → device shell bento grid
- [ ] Preserve all canvas IDs and event listeners
- [ ] Load VT323 Google Font

### Phase 6 (TODO) — JavaScript Extraction

- [ ] Create `js/state.js` — shared mutable state
- [ ] Extract `js/canvas.js` — canvas setup & resize
- [ ] Extract `js/tools.js` — tool definitions
- [ ] Extract `js/color.js` — palette management
- [ ] Extract `js/drawing.js` — per-tool draw logic
- [ ] Extract `js/animation.js` — frame management
- [ ] Extract `js/input.js` — event handlers
- [ ] Extract `js/ui.js` — popovers, zoom, UI state
- [ ] Extract `js/export.js` — GIF/PNG/JSON export

### Phase 7 (TODO) — Testing

- [ ] Visual regression testing vs. Figma
- [ ] All drawing tools functional
- [ ] Canvas pan/zoom working
- [ ] Layers, animation, color system working
- [ ] Export/import working
- [ ] Responsive layout at mobile sizes
- [ ] No console errors

---

## 3. Correct Design Tokens

> **Source:** Figma file `KYTXEJnFUE4ixf1fjIR5mE`, node `2:4`
> **Already implemented in `styles/design-tokens.css`** ✅

### Colors

```css
--bg-body:              #1a1a1d;   /* outer page background */
--bg-device:            #2c2c34;   /* main device shell fill */
--shell-orange:         #e67e22;   /* module headers, borders */
--shell-orange-border:  #ba5e0c;   /* 4px border on panels */
--accent-teal:          #4ecdc4;   /* active tool, frame selection */
--text-on-orange:       rgba(0,0,0,0.8);   /* labels on orange */
--text-on-dark:         #e8e8e8;            /* light text */
--text-on-teal:         #1a1a1d;            /* text on teal bg */
```

### Typography

```css
--font-display:    'VT323', monospace;           /* MARK CUBE, labels */
--font-ui:         'Courier New', monospace;    /* frame counter */
--font-body:       'Inter', system-ui, sans-serif;

--text-title:      24px;    /* MARK CUBE */
--text-module:     18px;    /* DRAWING label */
--text-label:      14px;    /* TIME, PALETTE labels */
--text-small:      12px;    /* SOLID, PRESET */
```

### Spacing & Radii

```css
--device-width:        380px;
--radius-device:       10px;
--radius-module:       10px;
--gap-module:          10px;
--gap-bento:           12px;
--border-module:       4px;
--border-canvas:       3px;
--border-btn-h:        4px;   /* tactile bottom press */
```

---

## 4. Target Layout Architecture

The Figma design renders as a **380-390px wide device** (centered on desktop, full-width on mobile) containing:

```
┌─────────────────────────────────────────┐
│  MARK CUBE  [grill]                     │  ← Toolbar bar (orange)
├─────────────────────────────────────────┤
│  DRAWING  [⚙]                           │  ← Canvas module header
│  ┌────────────────────────────────────┐ │
│  │  Canvas area (green bg)            │ │  ← Canvas with stack layers
│  │  [pixel grid with checkerboard]    │ │
│  └────────────────────────────────────┘ │
├──────────────────┬──────────────────────┤
│ TIME    [F:01]   │ PALETTE    [PRESET]  │  ← Bento mid (2-col grid)
│ ▶ ⏸             │ [5×3 swatches]       │
├──────────────────┴──────────────────────┤
│ [↩↪] │ [✏][🖌][✂] [□] [○] [⊕] [▦]    │  ← Tools section
├─────────────────────────────────────────┤
│        [── ─── ──]                      │  ← Footer grill
└─────────────────────────────────────────┘
```

**CSS Grid for bento mid:**
```css
.bento-mid {
  display: grid;
  grid-template-columns: 113px 1fr;
  gap: 12px;
}
```

---

## 5. Phase 1-4 — CSS Extraction (✅ COMPLETE)

All CSS files have been created on the `figma-ui-redesign` branch with correct Figma tokens.

**Checklist — Phase 1-4**
- [x] All 9 CSS files created with correct colors
- [x] Design tokens match Figma (orange #e67e22, teal #4ecdc4)
- [x] Layout grid properly structured (device shell, bento mid)
- [x] Buttons have tactile press effect (4px bottom border)
- [x] Palette renders as 5-column grid
- [x] Timeline has frame preview + counter
- [x] All animations defined (fade, pop-in, tooltips)
- [ ] `index.html` updated to link CSS files (Phase 5)
- [ ] `DESIGN.md` updated with correct tokens (Phase 5)

---

## 6. Phase 5 — HTML Restructure

### Step 5.1 — Update `index.html` `<head>`

Replace the entire inline `<style>` block with `<link>` tags:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Re-pxl</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="styles/design-tokens.css">
  <link rel="stylesheet" href="styles/base.css">
  <link rel="stylesheet" href="styles/layout.css">
  <link rel="stylesheet" href="styles/components.css">
  <link rel="stylesheet" href="styles/toolbar.css">
  <link rel="stylesheet" href="styles/palette.css">
  <link rel="stylesheet" href="styles/popovers.css">
  <link rel="stylesheet" href="styles/timeline.css">
  <link rel="stylesheet" href="styles/tooltips.css">
</head>
```

### Step 5.2 — Restructure HTML body

Replace the current `<body>` structure (floating panels) with the device shell layout:

```html
<body>
  <div id="app-body">
    <div id="device-shell">
      <!-- Corner screws -->
      <div class="screw screw-tl"></div>
      <div class="screw screw-tr"></div>
      <div class="screw screw-bl"></div>
      <div class="screw screw-br"></div>

      <!-- Side bumpers -->
      <div class="bumper bumper-left"></div>
      <div class="bumper bumper-right"></div>

      <!-- Toolbar bar -->
      <div class="toolbar-bar">
        <div class="grill-lines">
          <span></span><span></span><span></span>
        </div>
        <span class="device-title">MARK CUBE</span>
      </div>

      <!-- Drawing module -->
      <div class="module module-drawing">
        <div class="module-header">
          <span class="module-label">DRAWING</span>
          <button class="btn-dark btn-icon" id="btn-settings" aria-label="Settings">⚙</button>
        </div>
        <div class="module-body">
          <div class="canvas-outer">
            <div class="canvas-inner-border">
              <!-- All canvas layers preserved exactly -->
              <canvas id="onion-canvas"></canvas>
              <canvas id="bg-layers-canvas"></canvas>
              <canvas id="main-canvas"></canvas>
              <canvas id="fg-layers-canvas"></canvas>
              <canvas id="selection-canvas"></canvas>
              <canvas id="glow-canvas"></canvas>
              <canvas id="overlay-canvas"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Bento mid: TIME + PALETTE -->
      <div class="bento-mid">
        <div class="module module-time">
          <div class="module-header">
            <span class="module-label">TIME</span>
          </div>
          <div class="module-body">
            <div class="frame-preview-wrap">
              <canvas id="frame-preview-canvas"></canvas>
              <div class="frame-counter">F: <span id="frame-num">01</span></div>
            </div>
            <div class="playback-controls">
              <button class="btn-dark btn-icon" id="btn-play" aria-label="Play">▶</button>
              <button class="btn-dark btn-icon" id="btn-pause" aria-label="Pause">⏸</button>
            </div>
          </div>
        </div>

        <div class="module module-palette">
          <div class="module-header">
            <span class="module-label">PALETTE</span>
            <button class="btn-dark btn-small" id="btn-preset">PRESET</button>
          </div>
          <div class="module-body">
            <div id="palette-grid" class="palette-grid-5col" role="list" aria-label="Color palette">
              <!-- Swatches injected by color.js -->
            </div>
          </div>
        </div>
      </div>

      <!-- Tools section -->
      <div class="module-tools">
        <div class="tools-row-1">
          <div class="tools-group-history">
            <button class="btn-dark btn-icon" id="btn-undo" aria-label="Undo">↩</button>
            <button class="btn-dark btn-icon" id="btn-redo" aria-label="Redo">↪</button>
          </div>
          <div class="tools-divider"></div>
          <div class="tools-group-main">
            <button class="btn-dark btn-icon tool-btn" data-tool="eraser" aria-label="Eraser">✂</button>
            <button class="btn-teal btn-icon tool-btn active" data-tool="pencil" aria-label="Pencil">✏</button>
            <button class="btn-dark btn-icon tool-btn" data-tool="select" aria-label="Select">▭</button>
          </div>
        </div>
        <div class="tools-row-2">
          <button class="btn-teal btn-mode active" id="btn-mode-solid" aria-label="Solid mode">
            <span class="mode-icon">□</span>
            <span class="mode-label">SOLID</span>
          </button>
          <button class="btn-dark btn-icon" id="btn-mode-fill" aria-label="Fill">○</button>
          <button class="btn-dark btn-icon" id="btn-mode-eyedrop" aria-label="Eyedropper">⊕</button>
          <button class="btn-dark btn-icon btn-grid" id="btn-grid" aria-label="Grid">▦</button>
        </div>
      </div>

      <!-- Footer grill -->
      <div class="footer-grill">
        <span></span><span></span><span></span>
      </div>

    </div><!-- #device-shell -->
  </div><!-- #app-body -->

  <!-- Popovers & modals (preserved from current layout) -->
  <div id="select-toolbar" class="select-toolbar"></div>
  <div id="layers-popover" class="popover"></div>
  <div id="view-popover" class="popover"></div>
  <div id="forge-popover" class="popover"></div>
  <div id="export-popover" class="popover"></div>
  <div id="palette-popover" class="popover"></div>
  <div class="help-backdrop"></div>
  <div class="modal-overlay" id="modal-overlay"></div>

  <!-- Existing inline script (to be extracted to js/main.js in Phase 6) -->
  <script>
    // ... existing app logic ...
  </script>
</body>
```

### Step 5.3 — Update `DESIGN.md`

Replace outdated color palette with Section 3 values (or reference this document).

**Checklist — Phase 5**
- [ ] Inline `<style>` removed from `index.html`
- [ ] All `<link rel="stylesheet">` tags added
- [ ] VT323 font loads
- [ ] HTML body restructured to device shell
- [ ] All canvas IDs preserved in new location
- [ ] Bento grid mid section renders
- [ ] Tools section renders
- [ ] Corner screws visible
- [ ] Footer grill renders
- [ ] App opens in browser — no visual regression vs. current version
- [ ] `DESIGN.md` updated

---

## 7. Phase 6 — JS Module Extraction

The `index.html` `<script>` block is ~5,400 lines and must be split into focused modules.

### Module Structure

```
js/
├── state.js          ← Shared mutable state singleton
├── canvas.js         ← Canvas setup, layer stack, resize
├── tools.js          ← Tool definitions, active tool
├── color.js          ← Palette, active FG/BG color
├── drawing.js        ← Per-tool draw logic (pencil, eraser, fill, etc.)
├── animation.js      ← Frame management, playback, onion skin
├── input.js          ← Pointer, touch, keyboard events
├── ui.js             ← Popovers, zoom, hide-UI toggle
└── export.js         ← GIF/PNG/JSON export & load
```

### Shared State Pattern

**`js/state.js`:**
```javascript
export const state = {
  currentTool: 'pencil',
  brushSize: 1,
  currentColor: '#000000',
  palette: [],
  frames: [],
  currentFrame: 0,
  zoom: 1,
  canvasW: 64,
  canvasH: 64,
  layers: [],
  activeLayer: 0,
  isPlaying: false,
};
```

### Loading Order (end of `<body>`)

```html
<script type="module" src="js/state.js"></script>
<script type="module" src="js/canvas.js"></script>
<script type="module" src="js/color.js"></script>
<script type="module" src="js/tools.js"></script>
<script type="module" src="js/drawing.js"></script>
<script type="module" src="js/animation.js"></script>
<script type="module" src="js/input.js"></script>
<script type="module" src="js/ui.js"></script>
<script type="module" src="js/export.js"></script>
```

### Module Extraction Checklist

- [ ] `js/state.js` created
- [ ] `js/canvas.js` extracted and tested
- [ ] `js/tools.js` extracted and tested
- [ ] `js/color.js` extracted and tested
- [ ] `js/drawing.js` extracted and tested
- [ ] `js/animation.js` extracted and tested
- [ ] `js/input.js` extracted and tested
- [ ] `js/ui.js` extracted and tested
- [ ] `js/export.js` extracted and tested
- [ ] All features verified working

---

## 8. Phase 7 — Functional Regression Testing

### Drawing Tools
- [ ] Pencil draws correctly
- [ ] Eraser works
- [ ] Flood fill works
- [ ] Magic wand selection works
- [ ] Lasso selection works
- [ ] Move selection works
- [ ] Line/rect/circle shape tools work
- [ ] Eyedropper picks color

### Canvas
- [ ] Pinch-to-zoom works
- [ ] Pan (two-finger / middle mouse) works
- [ ] Zoom buttons work
- [ ] Zoom level displays
- [ ] Canvas resizes on window resize
- [ ] Pixel grid displays at high zoom
- [ ] Checkerboard transparency shows

### Layers
- [ ] Add/delete/rename layers
- [ ] Layer visibility toggle
- [ ] Layer reorder (drag)
- [ ] Active layer indicator correct

### Animation
- [ ] Add frame
- [ ] Delete frame
- [ ] Duplicate frame
- [ ] Play/pause loop
- [ ] FPS control
- [ ] Onion skinning toggle
- [ ] Frame preview renders

### Palette & Color
- [ ] Select color from palette
- [ ] FG/BG color swap
- [ ] Custom color picker
- [ ] "IN USE" colors show
- [ ] AI palette prompt works

### Export
- [ ] Export PNG (current frame)
- [ ] Export GIF (all frames)
- [ ] Export sprite sheet
- [ ] Save project JSON
- [ ] Load project JSON

### UI
- [ ] All popovers open/close
- [ ] Help overlay shows
- [ ] Hide UI toggle works
- [ ] Responsive at mobile sizes
- [ ] No console errors

---

## 9. File Structure Target

```
Re-pxl/
├── index.html                  ← restructured, CSS/JS externalized
├── styles/
│   ├── design-tokens.css       ← ✅ Figma tokens (orange, teal, etc.)
│   ├── base.css                ← ✅ Reset, fonts, scrollbar
│   ├── layout.css              ← ✅ Device shell, bento grid, canvas
│   ├── components.css          ← ✅ Modules, buttons, swatches
│   ├── toolbar.css             ← ✅ Toolbar bar, grill
│   ├── palette.css             ← ✅ 5-col grid, tactile swatches
│   ├── popovers.css            ← ✅ Modals, help overlays
│   ├── timeline.css            ← ✅ TIME module, frame preview
│   └── tooltips.css            ← ✅ Tooltip animations
├── js/
│   ├── state.js                ← Shared state (Phase 6)
│   ├── canvas.js               ← Canvas setup (Phase 6)
│   ├── tools.js                ← Tools (Phase 6)
│   ├── color.js                ← Palette (Phase 6)
│   ├── drawing.js              ← Draw logic (Phase 6)
│   ├── animation.js            ← Frames & playback (Phase 6)
│   ├── input.js                ← Event handlers (Phase 6)
│   ├── ui.js                   ← Popovers & UI (Phase 6)
│   └── export.js               ← Export & import (Phase 6)
├── assets/
│   └── figma-exports/          ← Exported SVG icons
├── DESIGN.md                   ← Updated with correct tokens
├── REFACTORING.md              ← This document
└── ASSETS.md                   ← Figma export guide
```

---

## 10. CSS Class Mapping: Old → New

| Old element | New location | Status |
|------------|-------------|--------|
| `#workspace-root` | `#app-body` | Renamed |
| `.canvas-area` | `.canvas-outer` | Renamed |
| `#canvas-stack` | `.canvas-inner-border` | Renamed |
| `.layout-top` | `.toolbar-bar` | Renamed |
| `.layout-bottom` | `.module-tools` | Renamed |
| `.layout-right` | `.module-palette` | Moved to bento-mid |
| `.module-timeline` | `.module-time` | Renamed |
| `--accent: #7c4dff` | `--accent-teal: #4ecdc4` | Changed |
| `--bg-deep: #0f0f12` | `--bg-body: #1a1a1d` | Changed |
| `--bg-panel: #1a1a20` | `--bg-device: #2c2c34` | Changed |

---

## 11. Known Issues & Decisions

### Design token correction
Previous scaffolding contained Stitch default colors. All values have been replaced with the correct Figma design (orange #e67e22, teal #4ecdc4). ✅

### Layout change: full-screen canvas → device shell
The current app renders canvas full-screen with floating panels. The Figma design uses a centered 380px device shell. On mobile (≤420px viewport), the device shell fills the screen. ✅

### Timeline strip → frame preview
The horizontal scrolling timeline is replaced by a single frame preview in the TIME module. Multi-frame access via a popover (similar to current popovers). No functionality lost. ✅

### VT323 font
Loaded from Google Fonts with monospace fallback. ✅

### Touch support
All existing touch event handlers must be preserved. The device shell layout preserves `touch-action: none` on canvas. ✅

---

## Next Steps

**Immediate (Phase 5):**
1. Update `index.html` to link all CSS files
2. Remove inline `<style>` block
3. Restructure HTML body to device shell layout
4. Test visual appearance vs. Figma design
5. Commit to `figma-ui-redesign` branch

**Then (Phase 6-7):**
1. Extract JavaScript modules
2. Run full regression test suite
3. Create Pull Request to `main`
4. Merge and deploy

---

*This document is the single source of truth for the Re-pxl refactor.*  
*All changes should reference the relevant phase and checklist item.*  
*Last updated: 2026-05-20*