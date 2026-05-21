# Assets & Figma Export Guide

## Directory Structure

```
Re-pxl/
├── assets/
│   ├── figma-exports/
│   │   ├── components/
│   │   │   ├── toolbar.svg
│   │   │   ├── palette.svg
│   │   │   ├── timeline.svg
│   │   │   ├── modals.svg
│   │   │   └── buttons/
│   │   │       ├── btn-primary.svg
│   │   │       ├── btn-secondary.svg
│   │   │       └── btn-icon.svg
│   │   ├── icons/
│   │   │   ├── tool-brush.svg
│   │   │   ├── tool-eraser.svg
│   │   │   ├── tool-select.svg
│   │   │   ├── play.svg
│   │   │   ├── pause.svg
│   │   │   ├── plus.svg
│   │   │   └── more/
│   │   └── design-tokens.json
│   ├── design-system/
│   │   ├── colors.json
│   │   ├── typography.json
│   │   └── spacing.json
│   └── README.md (this file)
├── styles/
├── js/
├── components/
└── index.html
```

## Exporting from Figma

### Step 1: Prepare Figma File
1. Open your Figma design
2. Select component or frame you want to export
3. Right-click → "Export"

### Step 2: Export Settings
- **Format:** SVG (for components and icons)
- **Scale:** 1x (maintain original size)
- **Include "Copy link"** option for documentation

### Step 3: Save to Assets
```bash
# SVG exports go here
assets/figma-exports/components/
assets/figma-exports/icons/

# Design tokens go here
assets/design-system/
```

### Step 4: Document Exports
Update this file with:
- Component name
- Figma link
- Export date
- Version

---

## Component Exports Checklist

### UI Components
- [ ] Toolbar
- [ ] Palette
- [ ] Timeline
- [ ] Modal/Dialog
- [ ] Popover
- [ ] Button variants
- [ ] Icon buttons
- [ ] Color swatches

### Icons to Export
- [ ] Drawing tools (brush, eraser, select)
- [ ] Playback controls (play, pause, stop)
- [ ] UI controls (menu, settings, help)
- [ ] Common actions (plus, minus, delete, save)

### Design Tokens to Export
- [ ] Color palette (JSON)
- [ ] Typography styles (JSON)
- [ ] Spacing values (JSON)
- [ ] Shadow definitions (JSON)
- [ ] Border radius values (JSON)

---

## Using Figma Exports in Code

### SVG Components in HTML
```html
<!-- Use as background image -->
<button style="background-image: url('./assets/figma-exports/icons/tool-brush.svg')"></button>

<!-- Use as <img> tag -->
<img src="./assets/figma-exports/icons/tool-brush.svg" alt="Brush Tool" />

<!-- Inline SVG for more control -->
<button class="icon-btn">
  <svg class="icon" viewBox="0 0 24 24">
    <!-- SVG content -->
  </svg>
</button>
```

### Design Tokens in JavaScript
```javascript
import designTokens from './assets/design-system/colors.json';

const primaryColor = designTokens.colors.accent.primary;
// #2563EB
```

### Design Tokens in CSS
```css
@import url('./styles/design-tokens.css');

.button {
  background-color: var(--color-accent-primary);
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
}
```

---

## Managing Updates

### When Figma Changes
1. Re-export affected components
2. Replace files in `assets/figma-exports/`
3. Update version number
4. Test in browser
5. Commit with message: `assets: update [component-name] from Figma`

### Version Control
```json
// assets/figma-exports/components/toolbar.svg
<!-- Figma Export v2.1.0 | Updated 2026-05-01 -->
```

---

## Optimization

### SVG Optimization
After exporting from Figma:
1. Use [SVGO](https://github.com/svg/svgo) to optimize
2. Compress with [TinyPNG](https://tinypng.com/)
3. Check for unused attributes

```bash
# Install SVGO
npm install -g svgo

# Optimize SVG
svgo --folder assets/figma-exports/icons/
```

### File Size Targets
- Icons: < 2KB each
- Components: < 5KB each
- Ensure performance isn't impacted

---

## Documentation Template

When adding new exports, document like this:

```markdown
## Component: Toolbar
- **Figma Link:** [View in Figma](https://figma.com/...)
- **Location:** `assets/figma-exports/components/toolbar.svg`
- **Version:** 1.0.0
- **Last Updated:** 2026-04-30
- **Status:** Ready for implementation
- **Notes:** 
  - Includes responsive breakpoints
  - Figma buttons map to `.icon-btn` class
  - Colors use CSS variables
```

---

## Color System Integration

### Export Colors as JSON
```json
{
  "colors": {
    "accent": {
      "primary": "#2563EB",
      "primaryHover": "#1D4ED8",
      "success": "#22C55E",
      "error": "#EF4444"
    },
    "text": {
      "primary": "#111827",
      "secondary": "#4B5563",
      "disabled": "#9CA3AF"
    }
  }
}
```

### Use in CSS
```css
:root {
  --color-accent-primary: #2563EB;
  --color-accent-primary-hover: #1D4ED8;
  /* etc */
}
```

---

## Best Practices

1. **Consistency:** Export components from Figma once, reuse code
2. **Documentation:** Link every export back to Figma
3. **Versioning:** Track version numbers for components
4. **Optimization:** Optimize all SVG files before committing
5. **Testing:** Test exports in all browsers
6. **Performance:** Monitor asset file sizes

---

## Troubleshooting

### SVG Not Displaying
- Check file path is correct
- Verify SVG has viewBox attribute
- Check for missing closing tags
- Test in browser DevTools

### Colors Not Matching
- Verify color hex codes match Figma
- Check for color profiles in SVG
- Use DevTools to inspect applied colors
- Re-export from Figma if colors are off

### Performance Issues
- Optimize SVG with SVGO
- Use CSS sprites for multiple icons
- Lazy load large components
- Monitor bundle size

---

## Resources

- **Figma File:** [Simple Canvas UI Design](https://figma.com/make/A0qpfzKL4iRcDnAw8BS9kc/Simple-Canvas-UI-Design)
- **Design System:** See `DESIGN.md`
- **SVGO Optimizer:** https://github.com/svg/svgo
- **SVG Best Practices:** https://developer.mozilla.org/en-US/docs/Web/SVG

---

*Last Updated: 2026-04-30*
*Status: Ready for Figma exports*