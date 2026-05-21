# Re-pxl Design System

## Figma Design
- **Link:** [drawing-and-anim8tion-mAker](https://www.figma.com/design/KYTXEJnFUE4ixf1fjIR5mE/drawing-and-anim8tion-mAker?node-id=2-3)
- **Status:** Implementation in progress
- **Branch:** `figma-ui-redesign`
- **Last Updated:** 2026-05-20

---

## Color Palette

### Device Shell & Background
- **Body Background:** `#1a1a1d` (dark gray)
- **Device Shell:** `#2c2c34` (medium gray)
- **Panel Outer:** `#1e1e23` (dark panel)

### Orange Module Shell
- **Orange Fill:** `#e67e22` (module headers, borders)
- **Orange Border:** `#ba5e0c` (4px border, depth)
- **Orange Shadow:** `rgba(0, 0, 0, 0.4)` (drop shadow)

### Canvas Module
- **Canvas Outer:** `#2d3e40` (dark teal)
- **Canvas Upper:** `#5d7e3a` (solid green)
- **Canvas Lower (dark):** `#3a5038` (checker pattern)
- **Canvas Lower (light):** `#4a6446` (checker pattern)

### Accent & Active States
- **Accent Teal:** `#4ecdc4` (active tool, selection)
- **Accent Teal Glow:** `rgba(78, 205, 196, 0.4)` (glow effect)

### Text Colors
- **Text on Orange:** `rgba(0, 0, 0, 0.8)` (dark text on orange)
- **Text on Dark:** `#e8e8e8` (light text)
- **Text on Teal:** `#1a1a1d` (dark text on teal buttons)
- **Text Dim:** `rgba(255, 255, 255, 0.4)` (secondary text)

### System Colors
- **Danger:** `#e74c3c` (red)
- **Success:** `#2ecc71` (green)
- **Border:** `#111` (dark black for button borders)

---

## Typography

### Font Families
- **Display:** `VT323` (monospace, retro style)
- **UI:** `Courier New` (monospace, counter display)
- **Body:** `Inter`, system-ui (standard sans-serif)

### Font Sizes
- **Title (MARK CUBE):** 24px
- **Module Label (DRAWING):** 18px
- **Label (TIME, PALETTE):** 14px
- **Small (SOLID, PRESET):** 12px
- **Counter (F: 01):** 11px

### Letter Spacing
- **Title:** -1.2px
- **Labels:** 1px

---

## Spacing System

All spacing uses a 4px base grid:

- **xs:** 4px
- **sm:** 8px
- **md:** 12px
- **lg:** 16px
- **xl:** 24px
- **2xl:** 32px

### Module Spacing
- **Gap between modules:** 10px
- **Gap in bento grid (TIME + PALETTE):** 12px
- **Padding inside modules:** 8px
- **Padding inside panels:** 15px

---

## Border Radius

- **Device Shell:** 10px
- **Modules:** 10px
- **Inner Panels:** 8px
- **Canvas Border:** 5px
- **Buttons:** 4px
- **Corner Screws:** 3px

---

## Component Specifications

### Device Shell
- **Width:** 380px (centered on desktop, full-width on mobile)
- **Border:** 4px solid #111 (black)
- **Border Radius:** 10px
- **Background:** #2c2c34
- **Shadow:** `inset -8px -8px 0px 0px rgba(0,0,0,0.3), 0 30px 30px rgba(0,0,0,0.6)`
- **Padding:** 18px

### Module (Orange Panel)
- **Background:** #e67e22 (orange)
- **Border:** 4px solid #ba5e0c (dark orange)
- **Border Radius:** 10px
- **Padding:** 8px
- **Shadow:** 0px 4px 0px rgba(0,0,0,0.4)

### Button (Tactile Press)
- **Size:** 40×40px (standard), 32×32px (small), 28×28px (tiny)
- **Background:** #3a3a3a (dark) or #4ecdc4 (active/teal)
- **Border Top/Left/Right:** 2px solid #111
- **Border Bottom:** 4px solid #111 (creates tactile depth)
- **Border Radius:** 4px
- **Active Press:** Border bottom becomes 2px, element translates down 2px
- **Shadow:** 0px 3px 3px rgba(0,0,0,0.3)

### Swatch (5-Column Grid)
- **Size:** 28×28px per swatch
- **Grid Columns:** 5 equal columns
- **Gap:** 8px between swatches
- **Active/Selected:** Teal border, glow effect, scale 1.05
- **Border Radius:** 4px
- **Shadow:** 0px 3px 6px rgba(0,0,0,0.3)

### Canvas Area
- **Background:** #2d3e40 (dark teal)
- **Border (outer):** 3px solid #1a1a1d
- **Border (inner):** 3px solid #000
- **Border Radius:** 5px
- **Checkerboard:** Green (#3a5038 / #4a6446) pattern
- **Cursor:** crosshair when drawing

### Toolbar Bar
- **Height:** 36px
- **Background:** #e67e22 (orange)
- **Border:** 4px solid #ba5e0c
- **Border Radius:** 10px 10px 6px 6px
- **Padding:** 4px 28px
- **Contains:** Grill lines, device title

### Grill Lines
- **3 horizontal lines** inside toolbar
- **Size:** 22×4px each
- **Gap:** 6px between lines
- **Opacity:** 25% black

### TIME Module
- **Width:** 113px (fixed)
- **Height:** 135px (in bento grid)
- **Contains:** Frame preview (86×95px) + frame counter + play/pause

### PALETTE Module
- **Width:** Flexible (grows to fill bento grid)
- **Height:** 135px
- **Contains:** 5-column swatch grid (15 swatches visible)

### Tools Section
- **Background:** #1e1e23 (dark panel)
- **Border:** 4px solid #111
- **Border Radius:** 10px
- **Padding:** 16px 24px
- **Shadow:** `inset 0px 2px 10px 0px rgba(0,0,0,0.6)`
- **Contains:** 2 rows of buttons with dividers

### Footer Grill
- **3 horizontal bars** (48px, 32px, 48px widths)
- **Opacity:** 30% black
- **Gap:** 24px between bars
- **Border Radius:** 9999px (fully rounded)

---

## Layout Grid

### Device Shell (Column Layout)
```
Display: flex
Flex-direction: column
Gap: 10px (between modules)
Width: 380px
Padding: 18px
```

### Bento Mid (2-Column Grid)
```
Display: grid
Grid-template-columns: 113px 1fr
Gap: 12px
Align-items: stretch
```

### Tools Row 1
```
Display: flex
Align-items: center
Justify-content: space-between
Height: 40px
```

### Tools Row 2 (Mode Bar)
```
Display: flex
Align-items: center
Gap: 6px
Background: rgba(0,0,0,0.4) (recessed)
Border: 2px solid #111
Padding: 10px 18px
```

---

## Animation & Transitions

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### Pop In (Help Bubbles)
```css
@keyframes popIn {
  0%   { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}
/* Duration: 0.4s, Easing: cubic-bezier(0.175, 0.885, 0.32, 1.275) */
```

### Tooltip Directions
- **Below (top buttons):** Slide up from below
- **Above (bottom buttons):** Slide down from above
- **Left (right-side buttons):** Slide from right
- **Right (left-side buttons):** Slide from left

### Button Press
```css
Transition: transform 0.05s
On active: translateY(2px) scale(0.98)
```

---

## Responsive Design

### Desktop (>420px)
- Device shell centered on page
- Side bumpers visible
- Full padding around device

### Mobile (≤420px)
- Device shell fills full viewport width
- Side bumpers hidden
- No left/right borders (edge-to-edge)
- Min height: 100vh

---

## Accessibility

- All buttons have `aria-label` attributes
- Focus-visible ring uses accent teal color
- Text contrast meets WCAG AA standards
- Tooltips use `data-tooltip` attributes
- Help overlay (?) provides contextual hints
- Reduced motion respected with `@media (prefers-reduced-motion: reduce)`

---

## Implementation Notes

### CSS Variables
All colors and sizing use CSS custom properties defined in `styles/design-tokens.css`. This allows for easy theme switching or dynamic updates.

### Tactile Button Style
The 4px bottom border creates a 3D pressed effect unique to retro handheld devices. The active state (2px border + 2px translate) mimics physical button press feedback.

### Pixel-Perfect Canvas
All canvas rendering uses `image-rendering: pixelated` to maintain sharp pixel art without anti-aliasing.

### Device Shell Centering
The device is centered horizontally using flexbox on `#app-body`. On mobile, the device fills the viewport width and is top-aligned.

---

## Figma Tokens Export

If exporting design tokens from Figma, ensure these categories are included:
- Colors (all palette values)
- Typography (font families, sizes, weights, line-height)
- Spacing (gaps, padding, margins)
- Border radii
- Shadows (box-shadow values)
- Animations (keyframes, timing functions, durations)

---

*Last Updated: 2026-05-20*  
*Source: Figma — drawing-and-anim8tion-mAker (KYTXEJnFUE4ixf1fjIR5mE)*