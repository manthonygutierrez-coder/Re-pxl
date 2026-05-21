// Re-pxl — Drawing Tools, Selection, Flood Fill, Clipboard
// Requires: state.js, canvas.js, history.js, layers.js, color.js, webgl.js

function setSelectMode(mode) {

    State.selectMode = mode;

    document.getElementById('sel-rect').classList.toggle('active', mode === 'rect');

    document.getElementById('sel-lasso').classList.toggle('active', mode === 'lasso');

    document.getElementById('sel-wand').classList.toggle('active', mode === 'wand');

    document.getElementById('wand-threshold-container').style.display = mode === 'wand' ? 'flex' : 'none';

  }


  function resetSelectionTransform() {

    State.selection.pivot = {x: 0.5, y: 0.5};

    State.selection.angle = 0;

    State.selection.flipH = false;

    State.selection.flipV = false;

    const angleSlider = document.getElementById('sel-angle');

    if (angleSlider) angleSlider.value = 0;

    updateSelectionCanvas();

    drawGrid();

  }


  function commitSelection() {

    if (State.selection.active && State.selection.layerData && State.selection.layerData.size > 0) {

      const actions = preActionDataBatch || [];

       
      State.selection.layerData.forEach((imgData, idx) => {

        const layer = State.frames[State.currentFrame].layers[idx];

        const tempCanvas = document.createElement('canvas');

        tempCanvas.width = State.selection.w;

        tempCanvas.height = State.selection.h;

        tempCanvas.getContext('2d').putImageData(imgData, 0, 0);


        const lCanvas = document.createElement('canvas'); 

        lCanvas.width = State.res; lCanvas.height = State.res;

        const lCtx = lCanvas.getContext('2d');

        lCtx.putImageData(layer.data, 0, 0);

         
        lCtx.save();

        lCtx.globalCompositeOperation = 'source-over';

        const pivotX = State.selection.x + State.selection.w * State.selection.pivot.x;

        const pivotY = State.selection.y + State.selection.h * State.selection.pivot.y;

        lCtx.translate(pivotX, pivotY);

        if (State.selection.angle !== 0) lCtx.rotate(State.selection.angle * Math.PI / 180);

        lCtx.scale(State.selection.flipH ? -1 : 1, State.selection.flipV ? -1 : 1);

        lCtx.translate(-pivotX, -pivotY);

         
        lCtx.imageSmoothingEnabled = false;

        lCtx.drawImage(tempCanvas, State.selection.x, State.selection.y);

        lCtx.restore();

         
        layer.data = lCtx.getImageData(0,0,State.res,State.res);

         
        if (preActionDataBatch) {

          const action = actions.find(a => a.l === idx);

          if (action) action.new = layer.data;

        }

      });

       
      if (actions.length > 0) pushHistoryBatch(actions);

      preActionDataBatch = null;

    }

     
    State.selection.active = false;

    State.selection.isDrawing = false;

    State.selection.layerData.clear();

    resetSelectionTransform();

    updateSelectionCanvas();

    drawGrid(); 

    renderLayers();

  }


  function createSelectionFromMask(maskCanvas, bbox) {

    if (bbox.w <= 0 || bbox.h <= 0) { State.selection.active = false; drawGrid(); return; }


    preActionDataBatch = [];

    State.selection.layerData = new Map();

     
    State.selectedLayers.forEach(idx => {

      const layer = State.frames[State.currentFrame].layers[idx];

       
      preActionDataBatch.push({

        f: State.currentFrame,

        l: idx,

        old: new ImageData(new Uint8ClampedArray(layer.data.data), State.res, State.res)

      });

       
      const temp = document.createElement('canvas');

      temp.width = State.res; temp.height = State.res;

      const tCtx = temp.getContext('2d');

       
      tCtx.putImageData(layer.data, 0, 0);

      tCtx.globalCompositeOperation = 'destination-in';

      tCtx.drawImage(maskCanvas, 0, 0);

      State.selection.layerData.set(idx, tCtx.getImageData(bbox.x, bbox.y, bbox.w, bbox.h));


      tCtx.clearRect(0,0,State.res,State.res);

      tCtx.putImageData(layer.data, 0, 0);

      tCtx.globalCompositeOperation = 'destination-out';

      tCtx.drawImage(maskCanvas, 0, 0);

      layer.data = tCtx.getImageData(0,0,State.res,State.res);

    });


    State.selection.x = bbox.x; State.selection.y = bbox.y;

    State.selection.w = bbox.w; State.selection.h = bbox.h;

    State.selection.active = true;

    resetSelectionTransform();

    renderLayers(); 

    updateSelectionCanvas();

    drawGrid();

  }


  function wandSelect(startX, startY) {

    const imgData = ctx.getImageData(0, 0, State.res, State.res);

    const data = imgData.data;

    const mask = new Uint8Array(State.res * State.res);

    const startIdx = (startY * State.res + startX) * 4;

    const r = data[startIdx], g = data[startIdx+1], b = data[startIdx+2], a = data[startIdx+3];

    const thresh = (State.wandThreshold / 100) * 1020;


    const stack = [[startX, startY]];

    let minX = startX, minY = startY, maxX = startX, maxY = startY;

    mask[startY * State.res + startX] = 1;


    while (stack.length > 0) {

      const [x, y] = stack.pop();

      minX = Math.min(minX, x); minY = Math.min(minY, y);

      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);


      const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];

      for (let [nx, ny] of neighbors) {

        if (nx >= 0 && nx < State.res && ny >= 0 && ny < State.res) {

          const nIdx = ny * State.res + nx;

          if (!mask[nIdx]) {

            const px = nIdx * 4;

            const dist = Math.abs(data[px]-r) + Math.abs(data[px+1]-g) + Math.abs(data[px+2]-b) + Math.abs(data[px+3]-a);

            if (dist <= thresh) {

              mask[nIdx] = 1;

              stack.push([nx, ny]);

            }

          }

        }

      }

    }


    const maskCanvas = document.createElement('canvas');

    maskCanvas.width = State.res; maskCanvas.height = State.res;

    const mCtx = maskCanvas.getContext('2d');

    const mImg = mCtx.createImageData(State.res, State.res);

    let hasPixels = false;

    for(let i=0; i<mask.length; i++) {

      if (mask[i]) {

        mImg.data[i*4] = 0; mImg.data[i*4+1] = 0; mImg.data[i*4+2] = 0; mImg.data[i*4+3] = 255;

        hasPixels = true;

      }

    }

    if (!hasPixels) return;


    mCtx.putImageData(mImg, 0, 0);

    createSelectionFromMask(maskCanvas, {x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1});

  }


  function addToClipboard(imgData, w, h) {

    const cloned = new ImageData(new Uint8ClampedArray(imgData.data), w, h);

    State.clipboard.unshift({imgData: cloned, w, h});

    if (State.clipboard.length > 9) State.clipboard.pop();

    renderClipboard();

  }


  function copySelection() {

    if (!State.selection.active || !State.selection.layerData || !State.selection.layerData.has(State.currentLayer)) return;

    const imgData = State.selection.layerData.get(State.currentLayer);

    addToClipboard(imgData, State.selection.w, State.selection.h);

  }


  function cutSelection() {

    if (!State.selection.active || !State.selection.layerData || !State.selection.layerData.has(State.currentLayer)) return;

    const imgData = State.selection.layerData.get(State.currentLayer);

    addToClipboard(imgData, State.selection.w, State.selection.h);

    State.selection.active = false;

    State.selection.layerData.clear();

    updateSelectionCanvas();

    drawGrid();

  }


  function pasteFromClipboard(index) {

    commitSelection();

    const item = State.clipboard[index];

    if (!item) return;

     
    preActionDataBatch = [{

      f: State.currentFrame,

      l: State.currentLayer,

      old: new ImageData(new Uint8ClampedArray(State.frames[State.currentFrame].layers[State.currentLayer].data.data), State.res, State.res)

    }];

     
    State.selection.layerData = new Map();

    State.selection.layerData.set(State.currentLayer, item.imgData);

    State.selection.w = item.w;

    State.selection.h = item.h;

    State.selection.x = Math.floor((State.res - item.w) / 2);

    State.selection.y = Math.floor((State.res - item.h) / 2);

    State.selection.active = true;

    resetSelectionTransform();

    setTool('select');

    updateSelectionCanvas();

    drawGrid();

  }


  function deleteFromClipboard(index, e) {

    e.stopPropagation();

    State.clipboard.splice(index, 1);

    renderClipboard();

  }


  function renderClipboard() {

    const mod = document.getElementById('clipboard-module');

    const grid = document.getElementById('clipboard-grid');

    if (State.clipboard.length === 0) {

      mod.style.display = 'none';

      return;

    }

    mod.style.display = 'flex';

    grid.innerHTML = '';

    State.clipboard.forEach((item, index) => {

      const bubble = document.createElement('div');

      bubble.className = 'clipboard-bubble';

       
      const temp = document.createElement('canvas');

      temp.width = item.w; temp.height = item.h;

      temp.getContext('2d').putImageData(item.imgData, 0, 0);

      bubble.style.backgroundImage = `url(${temp.toDataURL()})`;

      bubble.onclick = () => pasteFromClipboard(index);

       
      const delBtn = document.createElement('div');

      delBtn.className = 'clipboard-delete';

      delBtn.innerHTML = '✖';

      delBtn.onclick = (e) => deleteFromClipboard(index, e);

       
      bubble.appendChild(delBtn);

      grid.appendChild(bubble);

    });

  }

function setTool(tool) {

    if (State.tool === 'select' && tool !== 'select') {

      commitSelection();

    }

     
    State.tool = tool;

    if(DOM.toolDraw) DOM.toolDraw.classList.toggle('active', tool === 'draw');

    if(DOM.toolErase) DOM.toolErase.classList.toggle('active', tool === 'erase');

    if(DOM.toolFill) DOM.toolFill.classList.toggle('active', tool === 'fill');

    if(DOM.toolSelect) DOM.toolSelect.classList.toggle('active', tool === 'select');

    if(DOM.toolPan) DOM.toolPan.classList.toggle('active', tool === 'pan');


    document.getElementById('select-toolbar').style.display = tool === 'select' ? 'flex' : 'none';

    DOM.area.style.cursor = tool === 'pan' ? 'grab' : 'crosshair';

     
    if(DOM.hud) {

      const drawIcon = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`;

      const eraseIcon = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7l-4-4a2 2 0 0 1 0-2.83l9.17-9.17a2 2 0 0 1 2.83 0L21 10.17a2 2 0 0 1 0 2.83L11.83 22H22v-2z"></path></svg>`;

      const fillIcon = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="M5 2l5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>`;

      const selectIcon = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-dasharray="4 4"></rect></svg>`;

      const panIcon = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v4"></path><path d="M14 10V5a2 2 0 0 0-4 0v5"></path><path d="M10 10.5V4a2 2 0 0 0-4 0v9"></path><path d="M6 14v-1a2 2 0 0 0-4 0v4a7 7 0 0 0 7 7h2a8 8 0 0 0 8-8v-7a2 2 0 0 0-4 0v4"></path></svg>`;


      const hudIcon = document.getElementById('hud-icon');

      if (hudIcon) hudIcon.innerHTML = tool === 'draw' ? drawIcon : tool === 'erase' ? eraseIcon : tool === 'fill' ? fillIcon : tool === 'select' ? selectIcon : panIcon;

    }

     
    Palettes.render(); 

  }

function drawLine(x0, y0, x1, y1, isEraser) {

    let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;

    let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;

    let err = dx + dy, e2;


    while (true) {

      drawPixel(x0, y0, isEraser);

      if (x0 === x1 && y0 === y1) break;

      e2 = 2 * err;

      if (e2 >= dy) { err += dy; x0 += sx; }

      if (e2 <= dx) { err += dx; y0 += sy; }

    }

  }


  function drawPixel(x, y, isEraser) {

    ctx.fillStyle = isEraser ? 'rgba(0,0,0,1)' : State.activeColor;

    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';

     
    const points = [[x, y]];

    if (State.mirrorX) points.push([State.res - 1 - x, y]);

    if (State.mirrorY) points.push([x, State.res - 1 - y]);

    if (State.mirrorX && State.mirrorY) points.push([State.res - 1 - x, State.res - 1 - y]);


    points.forEach(([px, py]) => ctx.fillRect(px, py, 1, 1));

  }


  function updateSelectionCanvas() {

    const sCtx = DOM.selection.getContext('2d');

    sCtx.clearRect(0, 0, State.res, State.res);

    if (State.selection.active && State.selection.layerData && State.selection.layerData.size > 0) {

      sCtx.save();

      const pivotX = State.selection.x + State.selection.w * State.selection.pivot.x;

      const pivotY = State.selection.y + State.selection.h * State.selection.pivot.y;

      sCtx.translate(pivotX, pivotY);

      if (State.selection.angle !== 0) sCtx.rotate(State.selection.angle * Math.PI / 180);

      sCtx.scale(State.selection.flipH ? -1 : 1, State.selection.flipV ? -1 : 1);

      sCtx.translate(-pivotX, -pivotY);

      sCtx.imageSmoothingEnabled = false;


      State.selection.layerData.forEach((imgData) => {

        const tempCanvas = document.createElement('canvas');

        tempCanvas.width = State.selection.w;

        tempCanvas.height = State.selection.h;

        tempCanvas.getContext('2d').putImageData(imgData, 0, 0);

        sCtx.drawImage(tempCanvas, State.selection.x, State.selection.y);

      });

       
      sCtx.restore();

    }

     
    updateGlowTexture();

  }


  function floodFill(startX, startY, targetColorStr) {

    const imgData = ctx.getImageData(0, 0, State.res, State.res);

    const data = imgData.data;


    let targetRgba;

    if (targetColorStr === 'transparent') {

      targetRgba = [0, 0, 0, 0];

    } else {

      let hex = targetColorStr;

      let r = parseInt(hex.slice(1, 3), 16);

      let g = parseInt(hex.slice(3, 5), 16);

      let b = parseInt(hex.slice(5, 7), 16);

      targetRgba = [r, g, b, 255];

    }


    const startIdx = (startY * State.res + startX) * 4;

    const startR = data[startIdx];

    const startG = data[startIdx+1];

    const startB = data[startIdx+2];

    const startA = data[startIdx+3];


    if (startR === targetRgba[0] && startG === targetRgba[1] &&

      startB === targetRgba[2] && startA === targetRgba[3]) return;


    const stack = [[startX, startY]];

    while (stack.length > 0) {

      const [x, y] = stack.pop();

      const idx = (y * State.res + x) * 4;


      if (data[idx] === startR && data[idx+1] === startG &&

        data[idx+2] === startB && data[idx+3] === startA) {


        data[idx] = targetRgba[0];

        data[idx+1] = targetRgba[1];

        data[idx+2] = targetRgba[2];

        data[idx+3] = targetRgba[3];


        if (x + 1 < State.res) stack.push([x + 1, y]);

        if (x - 1 >= 0) stack.push([x - 1, y]);

        if (y + 1 < State.res) stack.push([x, y + 1]);

        if (y - 1 >= 0) stack.push([x, y - 1]);

      }

    }

    ctx.putImageData(imgData, 0, 0);

  }
