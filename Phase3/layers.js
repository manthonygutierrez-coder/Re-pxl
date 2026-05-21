// Re-pxl — Layer CRUD, Rendering & Management
// Requires: state.js, canvas.js, history.js

function renderLayers() {

    const frame = State.frames[State.currentFrame];

    const bgCtx = DOM.bgLayers.getContext('2d');

    const fgCtx = DOM.fgLayers.getContext('2d');

    bgCtx.clearRect(0,0,State.res,State.res);

    fgCtx.clearRect(0,0,State.res,State.res);

    ctx.clearRect(0,0,State.res,State.res);

     
    const tempCanvas = document.createElement('canvas');

    tempCanvas.width = State.res; tempCanvas.height = State.res;

    const tCtx = tempCanvas.getContext('2d');


    frame.layers.forEach((layer, i) => {

      if (!layer.visible) return;

       
      if (i === State.currentLayer) {

        ctx.putImageData(layer.data, 0, 0);

      } else {

        tCtx.putImageData(layer.data, 0, 0);

        if (i < State.currentLayer) bgCtx.drawImage(tempCanvas, 0, 0);

        else fgCtx.drawImage(tempCanvas, 0, 0);

      }

    });

    updateLayersUI();

  }


  function saveCurrentLayer() {

    const newData = ctx.getImageData(0,0,State.res,State.res);

    if (preActionDataBatch && preActionDataBatch.length > 0) {

      const act = preActionDataBatch.find(a => a.l === State.currentLayer);

      if (act) act.new = newData;

      pushHistoryBatch(preActionDataBatch);

      preActionDataBatch = null;

    }

    State.frames[State.currentFrame].layers[State.currentLayer].data = newData;

    renderTimeline(); 

    updateActiveColors();

    updateLayersUI();

  }


  function updateLayersUI() {

    const list = document.getElementById('layers-list');

    if (!list) return;

    list.innerHTML = '';

    const layers = State.frames[State.currentFrame].layers;

     
    for (let i = layers.length - 1; i >= 0; i--) {

      const l = layers[i];

      const isSelected = State.selectedLayers.has(i);

      const div = document.createElement('div');

      div.className = `layer-item ${isSelected ? 'active' : ''}`;

       
      // Setup Drag and Drop

      div.draggable = true;

      div.ondragstart = (e) => {

        e.dataTransfer.setData('layerIdx', i);

        e.dataTransfer.effectAllowed = 'move';

      };

      div.ondragover = (e) => {

        e.preventDefault();

        e.dataTransfer.dropEffect = 'move';

        div.style.borderBottom = '2px solid var(--accent)';

      };

      div.ondragleave = (e) => {

        div.style.borderBottom = '';

      };

      div.ondrop = (e) => {

        e.preventDefault();

        div.style.borderBottom = '';

        handleLayerDrop(e, i);

      };


      div.innerHTML = `

        <div class="layer-btn" onclick="toggleLayerVis(${i}, event)" title="Toggle Visibility">

          ${l.visible ? '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' : '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'}

        </div>

        <div class="layer-thumb-wrapper" style="width: 44px; height: 44px; background: url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'16\\' height=\\'16\\'><rect width=\\'8\\' height=\\'8\\' fill=\\'%231a1a20\\'/><rect x=\\'8\\' y=\\'8\\' width=\\'8\\' height=\\'8\\' fill=\\'%231a1a20\\'/><rect x=\\'8\\' width=\\'8\\' height=\\'8\\' fill=\\'%2322222a\\'/><rect y=\\'8\\' width=\\'8\\' height=\\'8\\' fill=\\'%2322222a\\'/></svg>'); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.5);" onclick="selectLayer(${i}, event)">

          <canvas id="layer-thumb-${i}" style="position: static; width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; pointer-events: none;"></canvas>

        </div>

        <div class="layer-name" onclick="selectLayer(${i}, event)" ondblclick="renameLayer(${i})">${l.name}</div>

        <div class="layer-drag-handle" title="Drag to reorder">

          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>

        </div>

      `;

      list.appendChild(div);


      const thumbCanvas = document.getElementById(`layer-thumb-${i}`);

      if (thumbCanvas) {

        thumbCanvas.width = State.res;

        thumbCanvas.height = State.res;

        const tCtx = thumbCanvas.getContext('2d');

        tCtx.putImageData(l.data, 0, 0);

      }

    }

  }


  window.renameLayer = function(i) {

    const layer = State.frames[State.currentFrame].layers[i];

    const newName = prompt("Rename Layer:", layer.name);

    if (newName && newName.trim() !== '') {

      layer.name = newName.trim();

      updateLayersUI();

    }

  }


  function selectLayer(i, e) {

    commitSelection();

    if (e && (e.ctrlKey || e.metaKey)) {

      if (State.selectedLayers.has(i) && State.selectedLayers.size > 1) {

        State.selectedLayers.delete(i);

        State.currentLayer = Array.from(State.selectedLayers)[0];

      } else {

        State.selectedLayers.add(i);

        State.currentLayer = i;

      }

    } else if (e && e.shiftKey) {

      const min = Math.min(State.currentLayer, i);

      const max = Math.max(State.currentLayer, i);

      State.selectedLayers.clear();

      for (let j = min; j <= max; j++) State.selectedLayers.add(j);

      State.currentLayer = i;

    } else {

      State.selectedLayers.clear();

      State.selectedLayers.add(i);

      State.currentLayer = i;

    }

    renderLayers();

  }


  function toggleLayerVis(i, e) {

    e.stopPropagation();

    commitSelection();

    State.frames[State.currentFrame].layers[i].visible = !State.frames[State.currentFrame].layers[i].visible;

    renderLayers();

  }


  function addLayer() {

    commitSelection();

    const layers = State.frames[State.currentFrame].layers;

    layers.splice(State.currentLayer + 1, 0, {

      name: `Layer ${layers.length + 1}`,

      data: new ImageData(State.res, State.res),

      visible: true

    });

    State.currentLayer++;

    State.selectedLayers.clear();

    State.selectedLayers.add(State.currentLayer);

    renderLayers();

  }


  window.deleteSelectedLayers = function() {

    const layers = State.frames[State.currentFrame].layers;

    if (layers.length <= State.selectedLayers.size) {

      // If deleting all, just clear them

      layers.forEach(l => l.data = new ImageData(State.res, State.res));

      return renderLayers();

    }

    commitSelection();

    const sorted = Array.from(State.selectedLayers).sort((a,b)=>b-a); // delete top down

    sorted.forEach(idx => layers.splice(idx, 1));

     
    State.currentLayer = Math.max(0, layers.length - 1);

    State.selectedLayers.clear();

    State.selectedLayers.add(State.currentLayer);

    renderLayers();

  }


  window.duplicateSelectedLayers = function() {

    commitSelection();

    const layers = State.frames[State.currentFrame].layers;

    const sorted = Array.from(State.selectedLayers).sort((a,b)=>a-b);

    const newSelected = new Set();

     
    let insertOffset = 1;

    const highestIdx = sorted[sorted.length-1];


    sorted.forEach(idx => {

      const src = layers[idx];

      const clone = {

        name: src.name + " Copy",

        visible: src.visible,

        data: new ImageData(new Uint8ClampedArray(src.data.data), State.res, State.res)

      };

      layers.splice(highestIdx + insertOffset, 0, clone);

      newSelected.add(highestIdx + insertOffset);

      insertOffset++;

    });


    State.selectedLayers = newSelected;

    State.currentLayer = highestIdx + insertOffset - 1;

    renderLayers();

  }


  window.mergeSelectedLayers = function() {

    if (State.selectedLayers.size <= 1) return;

    commitSelection();

     
    const layers = State.frames[State.currentFrame].layers;

    const sorted = Array.from(State.selectedLayers).sort((a,b)=>a-b);

    const targetIdx = sorted[0]; // Merge into the lowest index

     
    const c = document.createElement('canvas');

    c.width = State.res; c.height = State.res;

    const tempCtx = c.getContext('2d');

     
    const imgC = document.createElement('canvas'); imgC.width = State.res; imgC.height = State.res;

     
    // Draw all selected visible layers in order

    sorted.forEach(idx => {

      const l = layers[idx];

      if (l.visible) {

        imgC.getContext('2d').putImageData(l.data, 0, 0);

        tempCtx.drawImage(imgC, 0, 0);

      }

    });

     
    const mergedData = tempCtx.getImageData(0,0,State.res,State.res);

    layers[targetIdx].data = mergedData;

    layers[targetIdx].name = "Merged Layer";

     
    // Delete the rest (top down)

    for (let i = sorted.length - 1; i > 0; i--) {

      layers.splice(sorted[i], 1);

    }

     
    State.selectedLayers.clear();

    State.selectedLayers.add(targetIdx);

    State.currentLayer = targetIdx;

    renderLayers();

  }


  function handleLayerDrop(e, dropIdx) {

    const dragIdx = parseInt(e.dataTransfer.getData('layerIdx'));

    if (isNaN(dragIdx)) return;

    commitSelection();

    const layers = State.frames[State.currentFrame].layers;

     
    if (State.selectedLayers.has(dragIdx) && State.selectedLayers.size > 1) {

      const sortedSelected = Array.from(State.selectedLayers).sort((a,b)=>a-b);

      const extracted = [];

      for (let i = layers.length - 1; i >= 0; i--) {

        if (State.selectedLayers.has(i)) extracted.unshift(layers.splice(i, 1)[0]);

      }

      let adjustedDropIdx = dropIdx;

      for (const idx of sortedSelected) if (idx < dropIdx) adjustedDropIdx--;

      layers.splice(adjustedDropIdx, 0, ...extracted);

       
      State.selectedLayers.clear();

      for (let i = 0; i < extracted.length; i++) State.selectedLayers.add(adjustedDropIdx + i);

      State.currentLayer = adjustedDropIdx + extracted.length - 1;

    } else {

      const layer = layers.splice(dragIdx, 1)[0];

      let adjDropIdx = dragIdx < dropIdx ? dropIdx - 1 : dropIdx;

      layers.splice(adjDropIdx, 0, layer);

      State.selectedLayers.clear();

      State.selectedLayers.add(adjDropIdx);

      State.currentLayer = adjDropIdx;

    }

    renderLayers();

  }

function getCompositedFrame(fIdx) {

    const c = document.createElement('canvas');

    c.width = State.res; c.height = State.res;

    const tCtx = c.getContext('2d');

    const off = document.createElement('canvas');

    off.width = State.res; off.height = State.res;

     
    State.frames[fIdx].layers.forEach(l => {

      if (l.visible) {

        off.getContext('2d').putImageData(l.data, 0, 0);

        tCtx.drawImage(off, 0, 0);

      }

    });

    return tCtx.getImageData(0,0,State.res,State.res);

  }
