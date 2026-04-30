# Modular Refactoring Migration Guide

## Overview
This document outlines the step-by-step process to migrate from the monolithic `index.html` to a modular architecture with separated CSS, JavaScript, and HTML components.

---

## Current Progress ✅

### Phase 1: Design System & CSS Structure
- ✅ Created `DESIGN.md` with Figma design specifications
- ✅ Extracted modular CSS files:
  - `styles/design-tokens.css` - CSS variables and theme tokens
  - `styles/base.css` - Global base styles
  - `styles/layout.css` - Layout and positioning
  - `styles/components.css` - UI component styles
  - `styles/toolbar.css` - Toolbar-specific styles
  - `styles/palette.css` - Color palette styles
  - `styles/popovers.css` - Popover and modal styles
  - `styles/timeline.css` - Timeline component styles
  - `styles/tooltips.css` - Tooltip and help system styles

---

## Next Steps (TO DO)

### Phase 2: HTML Structure Refactoring
This phase requires breaking down the monolithic `index.html` into modular components:

#### Step 1: Create HTML Component Files
```
html/
├── header.html         # Top toolbar with brand & actions
├── toolbar.html        # Tool selection toolbar
├── canvas.html         # Canvas area with layer stack
├── sidebar-left.html   # Left sidebar (tools)
├── sidebar-right.html  # Right sidebar (palette, zoom)
├── footer.html         # Bottom timeline & controls
├── modals/
│   ├── layers.html
│   ├── export.html
│   ├── view-settings.html
│   └── palette-generator.html
└── components/
    ├── color-swatch.html
    ├── frame-thumbnail.html
    └── animation-preview.html
```

#### Step 2: Extract JavaScript into Modules
```
js/
├── config.js           # Configuration constants
├── core/
│   ├── canvas.js       # Canvas initialization & management
│   ├── layers.js       # Layer system
│   ├── animation.js    # Animation timeline
│   └── tools.js        # Tool system
├── ui/
│   ├── toolbar.js      # Toolbar interactions
│   ├── palette.js      # Color palette
│   ├── popovers.js     # Modal/popover logic
│   └── tooltips.js     # Tooltip system
├── utils/
│   ├── dom.js          # DOM manipulation utilities
│   ├── colors.js       # Color utilities
│   ├── history.js      # Undo/redo system
│   └── export.js       # Export utilities
└── app.js              # Main application entry point
```

#### Step 3: Create New Modular HTML
Create a new `index-modular.html` that:
- Links all CSS files in `<head>`
- Contains minimal HTML structure (just containers)
- Links all JS modules at end of `<body>`
- Uses semantic HTML5 elements

---

## Detailed Implementation Tasks

### Task A: Extract Canvas Code (High Priority)
**File:** `js/core/canvas.js`

Current code location in `index.html`:
- Canvas initialization (around line 91-127)
- Canvas rendering logic (scattered throughout)
- Layer management (lines 115-122)

**Deliverable:**
```javascript
// js/core/canvas.js
export class CanvasManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvases = {
      onion: null,
      bgLayers: null,
      main: null,
      fgLayers: null,
      selection: null,
      glow: null,
      overlay: null
    };
    this.init();
  }

  init() {
    // Initialize all canvases
  }

  resize(width, height) {
    // Handle resizing logic
  }

  render() {
    // Render frame
  }
}
```

### Task B: Extract Tool System (High Priority)
**File:** `js/core/tools.js`

Current elements scattered in index.html:
- Tool selection logic
- Brush implementation
- Selection tool
- Magic wand
- Transform tools

**Deliverable:** Create Tool class with polymorphism for each tool type.

### Task C: Extract Layer System (Medium Priority)
**File:** `js/core/layers.js`

Current code:
- Layer stack management
- Layer visibility/locking
- Layer reordering

### Task D: Extract Animation Timeline (Medium Priority)
**File:** `js/core/animation.js`

Current code:
- Frame management
- Timeline UI
- Animation playback

### Task E: Extract Palette System (Medium Priority)
**File:** `js/ui/palette.js`

Current code:
- Color selection
- Color grid rendering
- Active colors tracking

### Task F: Extract UI/Event Handlers (Lower Priority)
**File:** `js/ui/*.js`

Current scattered event listeners and UI logic.

---

## Migration Strategy

### Option 1: Gradual (Recommended)
1. Create new `index-modular.html` with new structure
2. Incrementally move JS code to modules
3. Test each module as extracted
4. Run both versions simultaneously during transition
5. Deprecate old `index.html` once stable

### Option 2: Complete Rewrite
1. Create entire new modular structure from scratch
2. Higher risk, but cleaner codebase
3. Requires more upfront work

---

## Testing Checklist

Before merging to main, verify:

- [ ] All canvas rendering works correctly
- [ ] Tool selection and switching works
- [ ] Layer creation/deletion/reordering works
- [ ] Animation timeline functions
- [ ] Color palette and selection works
- [ ] All popovers/modals open/close
- [ ] Tooltips display correctly
- [ ] Keyboard shortcuts still work
- [ ] Mobile responsiveness maintained
- [ ] No console errors
- [ ] Performance comparable to original

---

## File Size & Impact

**Original Structure:**
- `index.html`: ~156KB (monolithic)

**New Structure (Estimated):**
- CSS: ~20KB (split across 9 files)
- HTML: ~15KB (split across components)
- JS: ~100KB (split across modules)
- **Total**: ~135KB (better organization, similar size)

**Benefits:**
- Easier to maintain and debug
- Better performance with code splitting
- Easier to test individual modules
- Clearer separation of concerns
- Easier to implement features

---

## Figma Integration Points

During refactoring, integrate Figma design tokens:

1. **Colors:** Use `design-tokens.css` color variables
2. **Spacing:** Use `--space-*` variables consistently
3. **Typography:** Apply `--font-*` variables
4. **Components:** Map Figma components to HTML modules
5. **Responsive:** Apply Figma responsive breakpoints

---

## Timeline Estimate

- **Phase 2 (HTML + Core JS):** 4-6 hours
- **Phase 3 (Feature JS):** 6-8 hours
- **Phase 4 (Testing & Polish):** 2-4 hours
- **Total:** 12-18 hours of development

---

## Notes for Implementation

1. **Preserve Existing Functionality:** Don't change behavior, only structure
2. **Use ES6 Modules:** Use `export`/`import` for module system
3. **Maintain Canvas Performance:** Keep rendering optimized
4. **Test Early & Often:** Test each module independently
5. **Version Control:** Commit frequently with clear messages
6. **Documentation:** Add JSDoc comments to functions

---

## Quick Start for Next Developer

To continue this work:

1. Review `DESIGN.md` for color/spacing tokens
2. Review all CSS files in `styles/` folder
3. Start with `Task A: Extract Canvas Code`
4. Create `js/core/canvas.js` following the template above
5. Test thoroughly before moving to next task
6. Update this document as you progress

---

*Last Updated: 2026-04-30*
*Status: Design System Complete - Awaiting HTML/JS Extraction*
