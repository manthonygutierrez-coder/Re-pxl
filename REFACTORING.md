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

**Steps:**
1. Create `js/ui/` directory
2. Extract modal/popover opening/closing logic
3. Create controllers for toolbar, palette, timeline
4. Implement event delegation for module interactions
5. Update index.html to use module manager

**Testing Checklist:**
- [ ] Modules show/hide correctly
- [ ] State persists between interactions
- [ ] UI toggle works
- [ ] No console errors

---

### Task C: Extract Tool System 🔄 MEDIUM PRIORITY
**Time:** 2-3 hours | **Difficulty:** Medium

**Current State:** Tool logic mixed in main code  
**Goal:** Create tool factory and controller system

**File Structure:**
```
js/tools/
├── tool-factory.js          ← NEW
├── brush-tool.js           ← NEW
├── eraser-tool.js          ← NEW
└── selection-tool.js       ← NEW
```

**Template - `js/tools/tool-factory.js`:**
```javascript
/**
 * Tool Factory
 * Creates and manages drawing tools
 */

export class ToolFactory {
  constructor() {
    this.tools = {};
    this.activeTool = null;
  }

  /**
   * Register a tool
   */
  register(toolName, toolClass) {
    this.tools[toolName] = toolClass;
  }

  /**
   * Create tool instance
   */
  createTool(toolName, canvas) {
    const ToolClass = this.tools[toolName];
    if (!ToolClass) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    return new ToolClass(canvas);
  }

  /**
   * Activate tool
   */
  activateTool(toolName, canvas) {
    if (this.activeTool) {
      this.activeTool.deactivate();
    }
    this.activeTool = this.createTool(toolName, canvas);
    this.activeTool.activate();
    return this.activeTool;
  }
}

export default ToolFactory;
```

**Steps:**
1. Create `js/tools/` directory
2. Extract each tool's logic into separate files
3. Implement common tool interface
4. Create factory pattern controller
5. Update index.html to use factory

**Testing Checklist:**
- [ ] All tools activate/deactivate
- [ ] Tool switching works smoothly
- [ ] Tool options update correctly
- [ ] No state leakage between tools

---

### Task D: Extract Animation System 🔄 MEDIUM PRIORITY
**Time:** 2-3 hours | **Difficulty:** Medium

**Current State:** Frame/animation logic scattered  
**Goal:** Dedicated animation controller

**File Structure:**
```
js/animation/
├── animation-controller.js   ← NEW
├── frame-manager.js         ← NEW
└── playback-engine.js       ← NEW
```

**Template - `js/animation/frame-manager.js`:**
```javascript
/**
 * Frame Manager
 * Manages animation frames and layers
 */

export class FrameManager {
  constructor() {
    this.frames = [];
    this.currentFrame = 0;
    this.fps = 24;
  }

  /**
   * Add frame
   */
  addFrame(frameData) {
    this.frames.push({
      id: this.frames.length,
      data: frameData,
      timestamp: Date.now()
    });
  }

  /**
   * Delete frame
   */
  deleteFrame(frameIndex) {
    this.frames.splice(frameIndex, 1);
  }

  /**
   * Get frame
   */
  getFrame(frameIndex) {
    return this.frames[frameIndex];
  }

  /**
   * Get total frames
   */
  getTotalFrames() {
    return this.frames.length;
  }

  /**
   * Move to frame
   */
  gotoFrame(frameIndex) {
    if (frameIndex >= 0 && frameIndex < this.frames.length) {
      this.currentFrame = frameIndex;
      return true;
    }
    return false;
  }
}

export default FrameManager;
```

**Steps:**
1. Create `js/animation/` directory
2. Extract frame management logic
3. Create playback engine
4. Implement animation preview
5. Update timeline UI to use manager

**Testing Checklist:**
- [ ] Frames create/delete correctly
- [ ] Timeline displays all frames
- [ ] Playback works
- [ ] Frame navigation works

---

### Task E: Extract Color System 🔄 MEDIUM PRIORITY
**Time:** 1.5-2 hours | **Difficulty:** Low-Medium

**Current State:** Color palette logic mixed in code  
**Goal:** Dedicated color manager with Figma tokens

**File Structure:**
```
js/color/
├── color-manager.js         ← NEW
├── palette-system.js        ← NEW
└── theme-manager.js         ← NEW
```

**Template - `js/color/color-manager.js`:**
```javascript
/**
 * Color Manager
 * Manages active colors and palette
 */

export class ColorManager {
  constructor() {
    this.foregroundColor = '#000000';
    this.backgroundColor = '#ffffff';
    this.recentColors = [];
    this.maxRecent = 16;
  }

  /**
   * Set foreground color
   */
  setForegroundColor(color) {
    this.foregroundColor = color;
    this.addToRecent(color);
    this.dispatchEvent('colorchange', { color, type: 'foreground' });
  }

  /**
   * Set background color
   */
  setBackgroundColor(color) {
    this.backgroundColor = color;
    this.addToRecent(color);
    this.dispatchEvent('colorchange', { color, type: 'background' });
  }

  /**
   * Add color to recent
   */
  addToRecent(color) {
    const index = this.recentColors.indexOf(color);
    if (index > -1) {
      this.recentColors.splice(index, 1);
    }
    this.recentColors.unshift(color);
    if (this.recentColors.length > this.maxRecent) {
      this.recentColors.pop();
    }
  }

  /**
   * Get recent colors
   */
  getRecentColors() {
    return [...this.recentColors];
  }

  /**
   * Dispatch custom event
   */
  dispatchEvent(eventType, detail) {
    document.dispatchEvent(new CustomEvent(`color:${eventType}`, { detail }));
  }
}

export default ColorManager;
```

**Steps:**
1. Create `js/color/` directory
2. Extract color palette logic
3. Create theme system referencing design tokens
4. Add Figma color constants
5. Update palette UI to use manager

**Testing Checklist:**
- [ ] Colors change correctly
- [ ] Recent colors persist
- [ ] Theme switching works
- [ ] Figma colors apply properly

---

### Task F: Extract Input/Event System 🔄 LOW PRIORITY
**Time:** 2 hours | **Difficulty:** Low

**Current State:** Event listeners scattered throughout  
**Goal:** Centralized input/event handling

**File Structure:**
```
js/input/
├── input-manager.js         ← NEW
├── keyboard-handler.js      ← NEW
└── mouse-handler.js         ← NEW
```

**Steps:**
1. Create `js/input/` directory
2. Consolidate all event listeners
3. Create keyboard shortcut system
4. Create mouse event delegation
5. Update index.html to use managers

---

## Phase 3: HTML Structure Update

### Task G: Create Component HTML Templates
**Time:** 1-2 hours | **Difficulty:** Low

Create reusable component templates:
```
components/
├── toolbar.html
├── palette.html
├── timeline.html
├── modals.html
└── README.md
```

**Benefits:**
- Easier to update from Figma
- Reusable across projects
- Better maintainability

---

## Phase 4: Integration Testing

### Testing Checklist
- [ ] All modules load without errors
- [ ] Canvas renders correctly
- [ ] Drawing operations work
- [ ] UI interactions functional
- [ ] Animation system works
- [ ] Color system functional
- [ ] Tool switching smooth
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile responsive

---

## Import Pattern Template

Once modules are created, update `index.html` like this:

```html
<script type="module">
  // Import core modules
  import CanvasManager from './js/core/canvas-manager.js';
  import FrameManager from './js/animation/frame-manager.js';
  import ColorManager from './js/color/color-manager.js';
  import ToolFactory from './js/tools/tool-factory.js';
  import ModuleManager from './js/ui/module-manager.js';

  // Initialize
  const canvas = new CanvasManager();
  const frames = new FrameManager();
  const colors = new ColorManager();
  const tools = new ToolFactory();
  const ui = new ModuleManager();

  // Make available globally if needed
  window.appModules = { canvas, frames, colors, tools, ui };
</script>
```

---

## Figma Integration Points

### Design Tokens to Update
- **Colors:** Reference `styles/design-tokens.css`
- **Spacing:** Use CSS custom properties
- **Typography:** Update from Figma design specs

### When to Update
1. After exporting Figma components
2. Before updating HTML templates
3. After testing responsive behavior
4. Before final PR review

---

## Deployment Strategy

1. **Feature Branch:** `figma-ui-redesign` (current)
2. **Testing:** Run full test suite
3. **Pull Request:** Create detailed PR with:
   - List of all changes
   - Before/after screenshots
   - Testing results
   - Migration notes
4. **Review:** Get feedback from team
5. **Merge:** Merge to `main`
6. **Deploy:** Push to production

---

## Resources & References

- **Figma Design:** [Simple Canvas UI Design](https://figma.com/make/A0qpfzKL4iRcDnAw8BS9kc/Simple-Canvas-UI-Design)
- **Design System:** See `DESIGN.md`
- **CSS Tokens:** `styles/design-tokens.css`
- **Current App:** `index.html` (main reference)

---

## Timeline Estimate

| Task | Time | Priority |
|------|------|----------|
| A: Canvas Manager | 2-3h | ⭐⭐⭐ |
| B: UI Module Manager | 2-3h | ⭐⭐⭐ |
| C: Tool System | 2-3h | ⭐⭐ |
| D: Animation System | 2-3h | ⭐⭐ |
| E: Color System | 1.5-2h | ⭐⭐ |
| F: Input System | 2h | ⭐ |
| G: HTML Templates | 1-2h | ⭐ |
| Integration & Testing | 2-3h | ⭐⭐⭐ |
| **Total** | **15-22h** | — |

---

*Last Updated: 2026-04-30*
*Status: Ready for Phase 2 - JavaScript Extraction*