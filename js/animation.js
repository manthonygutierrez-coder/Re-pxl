// Re-pxl — Frame Management, Playback, Onion Skin, Timeline UI
// Requires: state.js, canvas.js, layers.js, color.js
// NOTE: handleFrameDrop uses its final (authoritative) definition.

function addFrame() {

    commitSelection();

    const currentLayers = State.frames[State.currentFrame].layers;

    const newLayers = currentLayers.map(l => ({

      name: l.name,

      visible: l.visible,

      data: new ImageData(new Uint8ClampedArray(l.data.data), State.res, State.res)

    }));

    State.frames.push({ layers: newLayers });

    loadFrame(State.frames.length - 1);

  }


  function deleteCurrentFrame() {

    commitSelection();

    if (State.frames.length <= 1) {

      State.frames[0].layers.forEach(l => {

        l.data = new ImageData(State.res, State.res);

      });

      renderLayers();

      updateActiveColors();

      return;

    }

    State.frames.splice(State.currentFrame, 1);

    loadFrame(Math.max(0, State.currentFrame - 1));

  }


  function loadFrame(index) {

    commitSelection();

    State.currentFrame = index;

    if (State.currentLayer >= State.frames[index].layers.length) {

      State.currentLayer = State.frames[index].layers.length - 1;

    }

    renderLayers();

    renderTimeline(); 

    updateOnionSkin(); 

    updateActiveColors();

  }

window.handleFrameDrop = function(e, dropIdx) {

    e.preventDefault();

    const dragIdx = parseInt(e.dataTransfer.getData('frameIdx'));

    if (isNaN(dragIdx) || dragIdx === dropIdx) return;

     
    commitSelection();

    const frame = State.frames.splice(dragIdx, 1)[0];

    let adjDropIdx = dragIdx < dropIdx ? dropIdx - 1 : dropIdx;

    State.frames.splice(adjDropIdx, 0, frame);

    State.currentFrame = adjDropIdx;

    loadFrame(adjDropIdx);

  };

function updateOnionSkin() {

    const octx = DOM.onion.getContext('2d');

    octx.clearRect(0, 0, State.res, State.res);

    if (!State.showOnion || State.currentFrame === 0 || !State.frames[State.currentFrame - 1]) return;

     
    const prevFlat = getCompositedFrame(State.currentFrame - 1);

     
    // Advanced "ToonSquid" Style Onion Skinning: Tint previous frame red

    const data = prevFlat.data;

    for (let i = 0; i < data.length; i += 4) {

      if (data[i+3] > 0) { // If pixel is not transparent

        // Convert to a solid red tint while maintaining its original alpha footprint

        data[i] = 255;    // R

        data[i+1] = 30;   // G

        data[i+2] = 80;   // B

        data[i+3] = Math.floor(data[i+3] * 0.4); // 40% Opacity for ghosting effect

      }

    }

     
    const offCanvas = document.createElement('canvas');

    offCanvas.width = State.res; offCanvas.height = State.res;

    offCanvas.getContext('2d').putImageData(prevFlat, 0, 0);

     
    octx.drawImage(offCanvas, 0, 0);

  }


  function renderTimeline() {

    DOM.timeline.innerHTML = '';

    State.frames.forEach((frameObj, index) => {

      const wrap = document.createElement('div'); 

      wrap.style.position = 'relative';

      wrap.draggable = true;

      wrap.ondragstart = (e) => {

        e.dataTransfer.setData('frameIdx', index);

        e.dataTransfer.effectAllowed = 'move';

      };

      wrap.ondrop = (e) => handleFrameDrop(e, index);

       
      const thumb = document.createElement('canvas');

      thumb.width = State.res; thumb.height = State.res;

      thumb.className = `frame-thumb ${index === State.currentFrame ? 'active' : ''}`;

      const tctx = thumb.getContext('2d');

      tctx.fillStyle = '#222'; tctx.fillRect(0,0,State.res,State.res);

       
      tctx.putImageData(getCompositedFrame(index), 0, 0);

      thumb.onclick = () => loadFrame(index);

       
      const badge = document.createElement('div'); badge.textContent = index + 1;

      badge.style.cssText = 'position:absolute; bottom:4px; right:4px; background:rgba(0,0,0,0.8); font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; pointer-events:none;';

      wrap.appendChild(thumb); wrap.appendChild(badge); DOM.timeline.appendChild(wrap);

    });

  }


  // High-Performance RAF Animation Loop

  let playbackRafId = null;

  let lastAnimTime = 0;

  const frameDelay = 150; // ms per frame (approx 6.66 FPS)

  let playIndex = 0;


  function startPlayback() {

    if (playbackRafId) cancelAnimationFrame(playbackRafId);

    lastAnimTime = performance.now();

    playbackLoop(lastAnimTime);

  }


  function playbackLoop(time) {

    playbackRafId = requestAnimationFrame(playbackLoop);

    const deltaTime = time - lastAnimTime;

     
    // Fixed-timestep execution to prevent drift and dropped frames

    if (deltaTime >= frameDelay) {

      if (State.frames.length > 0) {

        animCtx.clearRect(0, 0, State.res, State.res);

        animCtx.fillStyle = '#111'; 

        animCtx.fillRect(0,0,State.res,State.res);

        animCtx.putImageData(getCompositedFrame(playIndex), 0, 0);

        playIndex = (playIndex + 1) % State.frames.length;

      }

      // Subtract the remainder to maintain perfect cadence

      lastAnimTime = time - (deltaTime % frameDelay);

    }

  }


  async function callGeminiAPI(prompt, isJson = false) {
