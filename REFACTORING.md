# Refactoring Guide - Modular Architecture

## Overview
This guide walks you through migrating from the monolithic `index.html` to a modular, maintainable architecture that integrates your Figma design system.

**Total Estimated Time:** 12-18 hours  
**Priority:** High → Medium → Low  
**Branch:** `figma-ui-redesign`

---

## Phase 2: JavaScript Extraction

### Task A: Extract Canvas Manager ⭐ PRIORITY
**Time:** 2-3 hours | **Difficulty:** High

**Current State:** Canvas initialization and manipulation mixed in main index.html  
**Goal:** Separate canvas logic into dedicated module

**File Structure:**
```
js/
├── core/
│   ├── canvas-manager.js      ← NEW
│   ├── layer-system.js        ← NEW
│   └── animation-engine.js    ← NEW
└── ui/
    └── (other UI modules)
```

**Template - `js/core/canvas-manager.js`:**
```javascript
/**
 * Canvas Manager
 * Handles canvas initialization, rendering, and drawing operations
 */

export class CanvasManager {
  constructor(containerId = 'canvas-stack') {
    this.container = document.getElementById(containerId);
    this.canvases = {};
    this.ctx = {};
    this.initialized = false;
  }

  /**
   * Initialize all canvas layers
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  initialize(width = 800, height = 600) {
    const layerIds = [
      'onion-canvas',
      'bg-layers-canvas',
      'main-canvas',
      'fg-layers-canvas',
      'selection-canvas',
      'glow-canvas',
      'overlay-canvas'
    ];

    layerIds.forEach(id => {
      const canvas = document.getElementById(id);
      if (!canvas) {
        throw new Error(`Canvas element not found: ${id}`);
      }
      this.canvases[id] = canvas;
      this.ctx[id] = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
    });

    this.initialized = true;
    return this;
  }

  /**
   * Get specific canvas layer
   */
  getCanvas(layerId) {
    return this.canvases[layerId];
  }

  /**
   * Get specific context
   */
  getContext(layerId) {
    return this.ctx[layerId];
  }

  /**
   * Clear all canvases
   */
  clearAll() {
    Object.keys(this.ctx).forEach(id => {
      const canvas = this.canvases[id];
      this.ctx[id].clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  /**
   * Resize all canvases
   */
  resize(width, height) {
    Object.keys(this.canvases).forEach(id => {
      const canvas = this.canvases[id];
      canvas.width = width;
      canvas.height = height;
    });
  }
}

export default CanvasManager;
```

**Steps:**
1. Create `js/core/` directory
2. Extract canvas-related code from index.html into `canvas-manager.js`
3. Export the `CanvasManager` class
4. Add to `index.html`: `<script type="module" src="js/core/canvas-manager.js"></script>`
5. Update initialization code to use the module

**Testing Checklist:**
- [ ] Canvas loads without errors
- [ ] All layers render correctly
- [ ] Drawing operations work
- [ ] Zoom/pan functions work

---

### Task B: Extract UI Module Manager ⭐ PRIORITY
**Time:** 2-3 hours | **Difficulty:** High

**Current State:** UI interactions scattered throughout code  
**Goal:** Centralize UI module visibility, interactions, and state

**File Structure:**
```
js/ui/
├── module-manager.js         ← NEW
├── toolbar-controller.js     ← NEW
├── palette-controller.js     ← NEW
└── timeline-controller.js    ← NEW
```

**Template - `js/ui/module-manager.js`:**
```javascript
/**
 * UI Module Manager
 * Controls visibility, state, and interactions of UI modules
 */

export class ModuleManager {
  constructor() {
    this.modules = {};
    this.activeModule = null;
    this.isUIHidden = false;
  }

  /**
   * Register a module
   */
  register(name, moduleElement) {
    this.modules[name] = {
      element: moduleElement,
      visible: true,
      state: {}
    };
    return this;
  }

  /**
   * Show module
   */
  show(name) {
    if (this.modules[name]) {
      this.modules[name].element.style.opacity = '1';
      this.modules[name].element.style.pointerEvents = 'auto';
      this.modules[name].visible = true;
    }
  }

  /**
   * Hide module
   */
  hide(name) {
    if (this.modules[name]) {
      this.modules[name].element.style.opacity = '0';
      this.modules[name].element.style.pointerEvents = 'none';
      this.modules[name].visible = false;
    }
  }

  /**
   * Toggle UI visibility
   */
  toggleUI() {
    this.isUIHidden = !this.isUIHidden;
    document.body.classList.toggle('hide-ui', this.isUIHidden);
  }

  /**
   * Get module state
   */
  getState(name) {
    return this.modules[name]?.state || {};
  }

  /**
   * Set module state
   */
  setState(name, state) {
    if (this.modules[name]) {
      this.modules[name].state = { ...this.modules[name].state, ...state };
    }
  }
}

export default ModuleManager;
```

**Testing Checklist:**
- [ ] Modules show/hide correctly
- [ ] State persists between interactions
- [ ] UI toggle works
- [ ] No console errors

---

## Timeline Estimate

| Task | Time | Priority |
|------|------|----------|
| A: Canvas Manager | 2-3h | ⭐⭐⭐ |
| B: UI Module Manager | 2-3h | ⭐⭐⭐ |
| Integration & Testing | 2-3h | ⭐⭐⭐ |
| **Total** | **6-9h** | — |

---

*Last Updated: 2026-05-01*
*Status: Ready for JavaScript Extraction*