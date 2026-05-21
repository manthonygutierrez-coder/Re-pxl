// Re-pxl — Canvas Sizing, Zoom, Pan, Grid Rendering
// Requires: state.js, webgl.js

function getContrastColor(hex) {

    if (!hex) return '#ffffff';

    if (hex.indexOf('#') === 0) hex = hex.slice(1);

    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

    if (hex.length !== 6) return '#ffffff';

    const r = parseInt(hex.slice(0, 2), 16);

    const g = parseInt(hex.slice(2, 4), 16);

    const b = parseInt(hex.slice(4, 6), 16);

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? '#000000' : '#ffffff';

  }

function resizeCanvas() {

    const physicalSize = State.res * State.zoom;

    DOM.stack.style.width = `${physicalSize}px`;

    DOM.stack.style.height = `${physicalSize}px`;


    if (DOM.main.width !== State.res) {

      [DOM.main, DOM.bgLayers, DOM.fgLayers, DOM.onion, DOM.selection, DOM.glow].forEach(c => {

        c.width = State.res; c.height = State.res;

        c.style.width = '100%'; c.style.height = '100%';

        if (c.getContext('2d')) c.getContext('2d').imageSmoothingEnabled = false;

      });

    }


    DOM.overlay.width = physicalSize; 

    DOM.overlay.height = physicalSize;

    DOM.overlay.style.width = '100%'; 

    DOM.overlay.style.height = '100%';

    DOM.overlay.getContext('2d').imageSmoothingEnabled = false;

     
    if(DOM.zoomVal) DOM.zoomVal.innerText = `${State.zoom}x`;

    drawGrid();

     
    if (typeof updatePaletteScrollIndicators === 'function') {

      updatePaletteScrollIndicators();

    }

  }


  function adjustZoom(delta) {

    const nextZoom = State.zoom + delta;

    if (nextZoom >= State.minZoom && nextZoom <= State.maxZoom) {

      State.zoom = nextZoom;

      resizeCanvas();

       
      const zoomModule = document.getElementById('module-zoom-container');

      if (zoomModule) {

        zoomModule.classList.remove('glow-in', 'glow-out');

        void zoomModule.offsetWidth; 

        zoomModule.classList.add(delta > 0 ? 'glow-in' : 'glow-out');

         
        clearTimeout(zoomModule.glowTimeout);

        zoomModule.glowTimeout = setTimeout(() => {

          zoomModule.classList.remove('glow-in', 'glow-out');

        }, 300);

      }

    }

  }

function updatePanTransform() {

    DOM.stack.style.transform = `translate(${Math.round(State.panX)}px, ${Math.round(State.panY)}px)`;

  }


  function resetView() {

    State.panX = 0; State.panY = 0; State.zoom = window.innerWidth < 900 ? 5 : 8;

    updatePanTransform();

    resizeCanvas();

  }

function drawGrid() {

    const octx = DOM.overlay.getContext('2d');

    const w = DOM.overlay.width; const h = DOM.overlay.height;

    octx.clearRect(0, 0, w, h);

     
    if (State.showGrid) {

      octx.fillStyle = 'rgba(255, 255, 255, 0.1)';

      for (let i = 0; i <= State.res; i++) {

        octx.fillRect(i * State.zoom, 0, 1, h);

        octx.fillRect(0, i * State.zoom, w, 1);

      }

    }


    if (State.selection.active || State.selection.isDrawing) {

      const z = State.zoom;

      octx.save();

       
      octx.fillStyle = 'rgba(0, 0, 0, 0.5)';

      octx.fillRect(0, 0, w, h);

       
      octx.globalCompositeOperation = 'destination-out';

      octx.fillStyle = '#fff';


      if (State.selection.active) {

        octx.save();

        const pivotX = (State.selection.x + State.selection.w * State.selection.pivot.x) * z;

        const pivotY = (State.selection.y + State.selection.h * State.selection.pivot.y) * z;

        octx.translate(pivotX, pivotY);

        if (State.selection.angle !== 0) octx.rotate(State.selection.angle * Math.PI / 180);

        octx.scale(State.selection.flipH ? -1 : 1, State.selection.flipV ? -1 : 1);

        octx.translate(-pivotX, -pivotY);

        octx.fillRect(State.selection.x * z, State.selection.y * z, State.selection.w * z, State.selection.h * z);

        octx.restore();

      } else if (State.selectMode === 'lasso' && State.selection.isDrawing) {

        octx.beginPath();

        State.selection.path.forEach((p, i) => {

          if (i === 0) octx.moveTo(p.x * z + z/2, p.y * z + z/2);

          else octx.lineTo(p.x * z + z/2, p.y * z + z/2);

        });

        octx.fill();

      } else if (State.selectMode === 'rect' && State.selection.isDrawing) {

        octx.fillRect(State.selection.x * z, State.selection.y * z, State.selection.w * z, State.selection.h * z);

      }


      octx.globalCompositeOperation = 'source-over';

       
      octx.strokeStyle = '#fff'; octx.lineWidth = 1.5;

      octx.setLineDash([4, 4]); octx.lineDashOffset = -(Date.now() / 40) % 8;

       
      if (State.selection.active && (State.selection.angle !== 0 || State.selection.flipH || State.selection.flipV)) {

        const pivotX = (State.selection.x + State.selection.w * State.selection.pivot.x) * z;

        const pivotY = (State.selection.y + State.selection.h * State.selection.pivot.y) * z;

        octx.translate(pivotX, pivotY);

        octx.rotate(State.selection.angle * Math.PI / 180);

        octx.scale(State.selection.flipH ? -1 : 1, State.selection.flipV ? -1 : 1);

        octx.translate(-pivotX, -pivotY);

      }

       
      if (State.selectMode === 'lasso' && State.selection.isDrawing) {

        octx.beginPath();

        State.selection.path.forEach((p, i) => {

          if (i === 0) octx.moveTo(p.x * z + z/2, p.y * z + z/2);

          else octx.lineTo(p.x * z + z/2, p.y * z + z/2);

        });

        octx.stroke();

        octx.strokeStyle = '#000'; octx.lineDashOffset = -(Date.now() / 40) % 8 + 4;

        octx.stroke();

      } else if (State.selection.active || (State.selectMode === 'rect' && State.selection.isDrawing)) {

        octx.strokeRect(State.selection.x * z, State.selection.y * z, State.selection.w * z, State.selection.h * z);

        octx.strokeStyle = '#000'; octx.lineDashOffset = -(Date.now() / 40) % 8 + 4;

        octx.strokeRect(State.selection.x * z, State.selection.y * z, State.selection.w * z, State.selection.h * z);

      }

       
      octx.restore();

       
      if (State.selection.active) {

        const pX = (State.selection.x + State.selection.w * State.selection.pivot.x) * z;

        const pY = (State.selection.y + State.selection.h * State.selection.pivot.y) * z;

        octx.beginPath();

        octx.arc(pX, pY, 5, 0, Math.PI * 2);

        octx.fillStyle = '#ff00ff';

        octx.fill();

        octx.strokeStyle = '#ffffff';

        octx.lineWidth = 1.5;

        octx.stroke();

      }

    }

  }
