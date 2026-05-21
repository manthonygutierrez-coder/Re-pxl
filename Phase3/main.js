// Re-pxl — App En

    // Load pixel icon sprite sheet
    fetch('assets/icons-pixel.svg')
      .then(r => r.text())
      .then(svg => {
        const el = document.getElementById('icon-sprite-root');
        if (el) el.innerHTML = svg;
      })
      .catch(() => console.warn('Re-pxl: icon sprite not found at assets/icons-pixel.svg'));
try Point
// Requires: ALL modules. This file must load last.

function init() {

    State.zoom = window.innerWidth < 900 ? 5 : 8;

    initGlowWebGL();

    resizeCanvas();

    ctx.imageSmoothingEnabled = false;

     
    const pCanvas = document.createElement('canvas');

    pCanvas.width = State.res; pCanvas.height = State.res;

    pCanvas.style.width = '100%'; pCanvas.style.height = '100%';

    pCanvas.style.objectFit = 'contain'; pCanvas.style.imageRendering = 'pixelated';

    document.getElementById('anim-preview').appendChild(pCanvas);

    animCtx = pCanvas.getContext('2d');

     
    document.getElementById('wand-threshold').oninput = e => State.wandThreshold = e.target.value;

    const angleSlider = document.getElementById('sel-angle');

    if (angleSlider) {

      angleSlider.oninput = (e) => {

        State.selection.angle = parseFloat(e.target.value);

        updateSelectionCanvas();

        drawGrid();

      };

    }


    setupListeners();

    Palettes.render();

     
    State.frames = [{

      layers: [{ name: "Layer 1", data: new ImageData(State.res, State.res), visible: true }]

    }];

    State.currentFrame = 0;

    State.currentLayer = 0;

    State.selectedLayers = new Set([0]);

    loadFrame(0);

     
    drawGrid();

    startPlayback();

     
    requestAnimationFrame(animateLoop);

  }


  function animateLoop(time) {

renderGlowWebGL(time);

    if (State.selection.active || State.selection.isDrawing) {

      drawGrid();

    }

    requestAnimationFrame(animateLoop);

  }

  window.onload = init;
