# Assets Guide - Figma Integration

## Overview
This document outlines how to export assets from Figma and integrate them into the Re-pxl repository.

---

## Asset Structure

```
assets/
├── figma-exports/
│   ├── icons/
│   │   ├── brush.svg
│   │   ├── eraser.svg
│   │   ├── selection.svg
│   │   └── ...
│   ├── components/
│   │   ├── toolbar.svg
│   │   ├── palette.svg
│   │   ├── timeline.svg
│   │   └── modals.svg
│   └── design-system.json
├── design-system/
│   ├── colors.json
│   └── tokens.json
└── README.md
```

---

## Exporting from Figma

### 1. Icons
**From Figma:** Simple Canvas UI Design → Components → Icons

**Export Settings:**
- Format: SVG
- Suffix: None
- Color: Inherit from design

**Destination:** `assets/figma-exports/icons/`

**Icons to Export:**
- Brush
- Eraser
- Selection
- Hand/Pan
- Zoom In/Out
- Layer
- View Options
- Export
- Settings

### 2. Components
**From Figma:** Simple Canvas UI Design → Components → UI Components

**Export Settings:**
- Format: SVG or PNG
- Include Variant: All states
- Suffix: `-default`, `-hover`, `-active`

**Destination:** `assets/figma-exports/components/`

**Components to Export:**
- Toolbar (full component)
- Palette Grid
- Timeline
- Modal Dialogs
- Buttons (all states)

### 3. Design Tokens
**From Figma:** Export → Design System JSON

**To Export:**
- Color palette
- Spacing system
- Typography
- Border radius
- Shadows

**Destination:** `assets/figma-exports/design-system.json`

---

## Integration Steps

### Step 1: Create Directories
```bash
mkdir -p assets/figma-exports/{icons,components}
mkdir -p assets/design-system
```

### Step 2: Export Assets from Figma
1. Open [Simple Canvas UI Design](https://figma.com/make/A0qpfzKL4iRcDnAw8BS9kc/Simple-Canvas-UI-Design)
2. Right-click component → Export
3. Select format and save to appropriate directory

### Step 3: Update CSS with New Assets
Reference exported SVGs in `styles/components.css`:
```css
.icon-brush {
  background-image: url('/assets/figma-exports/icons/brush.svg');
}

.icon-eraser {
  background-image: url('/assets/figma-exports/icons/eraser.svg');
}
```

### Step 4: Update HTML Templates
Use exported components in `components/` directory:
```html
<!-- Before -->
<div class="toolbar">...</div>

<!-- After -->
<div class="toolbar" id="toolbar-container"></div>
<script>
  fetch('/components/toolbar.svg')
    .then(r => r.text())
    .then(html => document.getElementById('toolbar-container').innerHTML = html);
</script>
```

---

## Color Mapping

### Figma Design → CSS Variables
```
Figma Color          → CSS Variable              → Current Value
─────────────────────────────────────────────────────────────────
#FFFFFF              → --color-canvas-bg        → (update)
#F9FAFB              → --color-toolbar-bg       → (update)
#2563EB              → --color-accent-primary   → (update)
#1D4ED8              → --color-accent-primary-hover → (update)
#22C55E              → --color-success          → (update)
#EF4444              → --color-error            → (update)
#E5E7EB              → --color-border           → (update)
#6B7280              → --color-icon-inactive    → (update)
#111827              → --color-text-primary     → (update)
#4B5563              → --color-text-secondary   → (update)
#9CA3AF              → --color-text-disabled    → (update)
```

See `styles/design-tokens.css` for current mappings.

---

## Icon Usage

### Via CSS Background
```css
.tool-button.brush {
  background-image: url('/assets/figma-exports/icons/brush.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
```

### Via HTML
```html
<button class="icon-btn">
  <svg class="icon" data-icon="brush"></svg>
</button>
```

### Via JavaScript
```javascript
const icon = document.querySelector('[data-icon="brush"]');
icon.innerHTML = await fetch('/assets/figma-exports/icons/brush.svg').then(r => r.text());
```

---

## Design System JSON Format

Once exported from Figma, the design system JSON should look like:

```json
{
  "colors": [
    {
      "name": "Canvas Background",
      "value": "#FFFFFF",
      "token": "--color-canvas-bg"
    },
    {
      "name": "Primary Accent",
      "value": "#2563EB",
      "token": "--color-accent-primary"
    }
  ],
  "spacing": [
    { "name": "xs", "value": "4px", "token": "--space-xs" },
    { "name": "sm", "value": "8px", "token": "--space-sm" }
  ],
  "typography": [
    {
      "name": "Heading Large",
      "size": "18px",
      "weight": "700",
      "token": "--font-size-lg"
    }
  ]
}
```

---

## Verification Checklist

- [ ] All icons exported from Figma
- [ ] All components exported
- [ ] Design system JSON exported
- [ ] SVG files optimized (remove unnecessary code)
- [ ] CSS variables updated in `design-tokens.css`
- [ ] Icons integrated into HTML
- [ ] Components tested in browser
- [ ] No broken image references
- [ ] Responsive behavior verified
- [ ] Performance acceptable

---

## Best Practices

1. **Optimize SVGs** - Use tools like SVGO to reduce file size
2. **Consistent Naming** - Use kebab-case for file names
3. **Version Control** - Commit all exports to git
4. **Documentation** - Keep this file updated
5. **Testing** - Test assets in all supported browsers
6. **Accessibility** - Add proper alt text and aria labels
7. **Performance** - Use image optimization tools
8. **Caching** - Set proper cache headers

---

*Last Updated: 2026-05-01*
*Figma Design:** [Simple Canvas UI Design](https://figma.com/make/A0qpfzKL4iRcDnAw8BS9kc/Simple-Canvas-UI-Design)