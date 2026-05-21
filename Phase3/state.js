// Re-pxl — Shared State & DOM References
// All modules read/write State and DOM directly (global scope).

const State = {

    res: 64, 

    zoom: 8,

    minZoom: 1,

    maxZoom: 32,

    isDrawing: false,

    activeColor: '#FFF1E8',

    tool: 'draw',

    selectMode: 'rect',

    wandThreshold: 0,

    clipboard: [],

    frames: [], 

    currentFrame: 0,

    currentLayer: 0,

    selectedLayers: new Set([0]),

    history: [], 

    redoStack: [],

    mirrorX: false, mirrorY: false,

    showGrid: true, showOnion: true,

    lastX: undefined, lastY: undefined, 

    panX: 0, panY: 0,

    isPanning: false, panStartX: 0, panStartY: 0, initialPanX: 0, initialPanY: 0,

    spaceDown: false,

    userToggledPalette: false,

    selection: {

      active: false, isDrawing: false, isMoving: false, isDraggingPivot: false,

      x: 0, y: 0, w: 0, h: 0, startX: 0, startY: 0,

      angle: 0, flipH: false, flipV: false, pivot: {x: 0.5, y: 0.5},

      path: [], layerData: new Map() // Holds ImageData for each selected layer during transform

    }

  };


  const DOM = {

    area: document.getElementById('canvas-area'),

    stack: document.getElementById('canvas-stack'),

    bgLayers: document.getElementById('bg-layers-canvas'),

    main: document.getElementById('main-canvas'), 

    fgLayers: document.getElementById('fg-layers-canvas'),

    onion: document.getElementById('onion-canvas'),

    overlay: document.getElementById('overlay-canvas'),

    selection: document.getElementById('selection-canvas'),

    glow: document.getElementById('glow-canvas'),

    timeline: document.getElementById('timeline'),

    zoomVal: document.getElementById('zoom-val'),

    toolDraw: document.getElementById('tool-draw'),

    toolErase: document.getElementById('tool-erase'),

    toolFill: document.getElementById('tool-fill'),

    toolSelect: document.getElementById('tool-select'),

    toolPan: document.getElementById('tool-pan'),

    hud: document.getElementById('active-tool-hud')

  };


  const ctx = DOM.main.getContext('2d', { willReadFrequently: true });

  let animCtx; 

  let preActionDataBatch = null; 


  // --- WebGL Selection Glow Logic ---
