// Re-pxl — All Event Listeners (pointer, keyboard, touch, wheel)
// Requires: ALL other modules. Load last before main.js.

function setupListeners() {

    const handleInput = (e, isStart = false) => {

      if (!State.isDrawing && !State.selection.isDrawing && !State.selection.isMoving && !State.selection.isDraggingPivot && !isStart) return; 


      let clientX, clientY;

      if (e.touches && e.touches.length > 0) {

        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;

      } else {

        clientX = e.clientX; clientY = e.clientY;

      }

       
      const rect = DOM.stack.getBoundingClientRect();

      const scaleX = State.res / rect.width;

      const scaleY = State.res / rect.height;

       
      const fx = (clientX - rect.left) * scaleX;

      const fy = (clientY - rect.top) * scaleY;

      const x = Math.floor(fx);

      const y = Math.floor(fy);

       
      if (State.selection.isDraggingPivot) {

        State.selection.pivot.x = (fx - State.selection.x) / State.selection.w;

        State.selection.pivot.y = (fy - State.selection.y) / State.selection.h;

        updateSelectionCanvas();

        drawGrid();

        return;

      }

       
      if (x >= 0 && x < State.res && y >= 0 && y < State.res) {

        const isEraser = State.tool === 'erase' || e.buttons === 2 || e.shiftKey;

         
        if (State.tool === 'select') {

          if (isStart) {

            if (State.selection.active) {

              const pX = State.selection.x + State.selection.w * State.selection.pivot.x;

              const pY = State.selection.y + State.selection.h * State.selection.pivot.y;

               
              if (Math.hypot(fx - pX, fy - pY) <= 2) {

                State.selection.isDraggingPivot = true;

                return;

              }

               
              const inX = x >= State.selection.x && x < State.selection.x + State.selection.w;

              const inY = y >= State.selection.y && y < State.selection.y + State.selection.h;

              if (inX && inY) {

                State.selection.isMoving = true;

                State.selection.startX = x;

                State.selection.startY = y;

                if (!State.selection.layerData || State.selection.layerData.size === 0) {

                  preActionDataBatch = [{

                    f: State.currentFrame,

                    l: State.currentLayer,

                    old: new ImageData(new Uint8ClampedArray(State.frames[State.currentFrame].layers[State.currentLayer].data.data), State.res, State.res)

                  }];

                  State.selection.layerData = new Map();

                  State.selection.layerData.set(State.currentLayer, ctx.getImageData(State.selection.x, State.selection.y, State.selection.w, State.selection.h));

                  ctx.clearRect(State.selection.x, State.selection.y, State.selection.w, State.selection.h);

                  saveCurrentLayer(); 

                  updateSelectionCanvas();

                }

                return;

              } else {

                commitSelection();

              }

            }


            if (State.selectMode === 'wand') {

              preActionDataBatch = [{

                f: State.currentFrame, l: State.currentLayer,

                old: new ImageData(new Uint8ClampedArray(State.frames[State.currentFrame].layers[State.currentLayer].data.data), State.res, State.res)

              }];

              wandSelect(x, y);

              return;

            }


            State.selection.isDrawing = true;

            State.selection.startX = x;

            State.selection.startY = y;

            if (State.selectMode === 'rect') {

              State.selection.x = x;

              State.selection.y = y;

              State.selection.w = 1;

              State.selection.h = 1;

            } else if (State.selectMode === 'lasso') {

              State.selection.path = [{x, y}];

            }

            drawGrid();

            return;

          }


          if (State.selection.isMoving) {

            const dx = x - State.selection.startX;

            const dy = y - State.selection.startY;

            State.selection.x += dx;

            State.selection.y += dy;

            State.selection.startX = x;

            State.selection.startY = y;

            updateSelectionCanvas();

            drawGrid();

            return;

          } else if (State.selection.isDrawing) {

            if (State.selectMode === 'rect') {

              State.selection.x = Math.min(State.selection.startX, x);

              State.selection.y = Math.min(State.selection.startY, y);

              State.selection.w = Math.abs(x - State.selection.startX) + 1;

              State.selection.h = Math.abs(y - State.selection.startY) + 1;

            } else if (State.selectMode === 'lasso') {

              State.selection.path.push({x, y});

            }

            drawGrid();

            return;

          }

          return;

        }


        if (State.tool === 'fill') {

          if (isStart) {

            preActionDataBatch = [{

              f: State.currentFrame, l: State.currentLayer,

              old: new ImageData(new Uint8ClampedArray(State.frames[State.currentFrame].layers[State.currentLayer].data.data), State.res, State.res)

            }];

            const targetColor = isEraser ? 'transparent' : State.activeColor;

            const points = [[x, y]];

            if (State.mirrorX) points.push([State.res - 1 - x, y]);

            if (State.mirrorY) points.push([x, State.res - 1 - y]);

            if (State.mirrorX && State.mirrorY) points.push([State.res - 1 - x, State.res - 1 - y]);


            points.forEach(([px, py]) => floodFill(px, py, targetColor));

            saveCurrentLayer();

          }

          return; 

        }


        if (isStart) { 

          preActionDataBatch = [{

            f: State.currentFrame, l: State.currentLayer,

            old: new ImageData(new Uint8ClampedArray(State.frames[State.currentFrame].layers[State.currentLayer].data.data), State.res, State.res)

          }];

          State.lastX = x; State.lastY = y; 

        }

        if (State.lastX !== undefined && State.lastY !== undefined) {

          drawLine(State.lastX, State.lastY, x, y, isEraser);

        }

        State.lastX = x; State.lastY = y;

      } else {

        State.lastX = undefined; State.lastY = undefined;

      }

    };


    const stopAction = () => { 

      if (State.tool === 'select') {

        if (State.selection.isDraggingPivot) {

          State.selection.isDraggingPivot = false;

        }

        if (State.selection.isDrawing) {

          State.selection.isDrawing = false;

          if (State.selectMode === 'rect') {

            if (State.selection.w > 1 || State.selection.h > 1) {

              const maskCanvas = document.createElement('canvas');

              maskCanvas.width = State.res; maskCanvas.height = State.res;

              const mCtx = maskCanvas.getContext('2d');

              mCtx.fillStyle = '#000';

              mCtx.fillRect(State.selection.x, State.selection.y, State.selection.w, State.selection.h);

              createSelectionFromMask(maskCanvas, {x: State.selection.x, y: State.selection.y, w: State.selection.w, h: State.selection.h});

            } else {

              State.selection.active = false;

              drawGrid();

            }

          } else if (State.selectMode === 'lasso') {

            if (State.selection.path.length > 2) {

              const maskCanvas = document.createElement('canvas');

              maskCanvas.width = State.res; maskCanvas.height = State.res;

              const mCtx = maskCanvas.getContext('2d');

              mCtx.fillStyle = '#000';

              mCtx.beginPath();

              State.selection.path.forEach((p, i) => {

                if (i === 0) mCtx.moveTo(p.x, p.y);

                else mCtx.lineTo(p.x, p.y);

              });

              mCtx.closePath();

              mCtx.fill();


              let minX = State.res, minY = State.res, maxX = 0, maxY = 0;

              State.selection.path.forEach(p => {

                minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);

                maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);

              });

              minX = Math.max(0, Math.floor(minX)); minY = Math.max(0, Math.floor(minY));

              maxX = Math.min(State.res - 1, Math.ceil(maxX)); maxY = Math.min(State.res - 1, Math.ceil(maxY));

               
              createSelectionFromMask(maskCanvas, {x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1});

            } else {

              State.selection.active = false;

              drawGrid();

            }

          }

        }

        if (State.selection.isMoving) {

          State.selection.isMoving = false;

        }

      }


      if (State.isPanning) {

        State.isPanning = false;

        DOM.area.style.cursor = State.tool === 'pan' ? 'grab' : (State.spaceDown ? 'grab' : 'crosshair');

      }

      if (State.isDrawing) { 

        State.isDrawing = false; 

        State.lastX = undefined; State.lastY = undefined;

        saveCurrentLayer(); 

      }

    };


    DOM.area.onmousedown = (e) => { 

      if (e.target.closest('.ui-module')) return; 

       
      if (State.tool === 'pan' || e.button === 1 || State.spaceDown) {

        State.isPanning = true;

        State.panStartX = e.clientX;

        State.panStartY = e.clientY;

        State.initialPanX = State.panX;

        State.initialPanY = State.panY;

        DOM.area.style.cursor = 'grabbing';

        e.preventDefault();

      } else {

        State.isDrawing = true; 

        handleInput(e, true); 

      }

    };

    window.onmouseup = stopAction;

    DOM.area.onmousemove = (e) => {

      if (State.isPanning) {

        State.panX = State.initialPanX + (e.clientX - State.panStartX);

        State.panY = State.initialPanY + (e.clientY - State.panStartY);

        updatePanTransform();

      } else if (State.isDrawing || State.selection.isDrawing || State.selection.isMoving || State.selection.isDraggingPivot) {

        handleInput(e, false);

      } else {

        if (State.tool === 'select' && State.selection.active && !State.spaceDown) {

          const rect = DOM.stack.getBoundingClientRect();

          const scaleX = State.res / rect.width;

          const scaleY = State.res / rect.height;

          const fx = (e.clientX - rect.left) * scaleX;

          const fy = (e.clientY - rect.top) * scaleY;

          const pX = State.selection.x + State.selection.w * State.selection.pivot.x;

          const pY = State.selection.y + State.selection.h * State.selection.pivot.y;

           
          if (Math.hypot(fx - pX, fy - pY) <= 2) {

            DOM.area.style.cursor = 'crosshair';

          } else if (fx >= State.selection.x && fx < State.selection.x + State.selection.w && fy >= State.selection.y && fy < State.selection.y + State.selection.h) {

            DOM.area.style.cursor = 'move';

          } else {

            DOM.area.style.cursor = 'crosshair';

          }

        } else {

          DOM.area.style.cursor = State.tool === 'pan' ? (State.spaceDown ? 'grabbing' : 'grab') : 'crosshair';

        }

      }

    };

    DOM.area.oncontextmenu = e => { if(!e.target.closest('.ui-module')) e.preventDefault(); };

     
    let initialPinchDist = null;

    let initialMidX = 0, initialMidY = 0;

    let pinchBackupTime = 0;


    DOM.area.addEventListener('touchstart', (e) => { 

      if (e.target.closest('.ui-module')) return;

      e.preventDefault(); 

       
      if (e.touches.length === 1) {

        if (State.tool === 'pan' || State.spaceDown) {

          State.isPanning = true;

          State.panStartX = e.touches[0].clientX;

          State.panStartY = e.touches[0].clientY;

          State.initialPanX = State.panX;

          State.initialPanY = State.panY;

        } else {

          State.isDrawing = true; 

          pinchBackupTime = Date.now();

          handleInput(e, true); 

        }

      } else if (e.touches.length === 2) {

        State.isDrawing = false;

        if (State.selection.isDrawing) {

          State.selection.isDrawing = false;

          State.selection.active = false;

          drawGrid();

        }

        State.selection.isMoving = false;

        State.lastX = undefined; State.lastY = undefined;

         
        if (preActionDataBatch && (Date.now() - pinchBackupTime < 300) && ['draw', 'erase', 'fill'].includes(State.tool)) {

          preActionDataBatch.forEach(act => {

            State.frames[act.f].layers[act.l].data = new ImageData(new Uint8ClampedArray(act.old.data), State.res, State.res);

          });

          renderLayers();

          preActionDataBatch = null; 

        }

         
        State.isPanning = true;

        initialPinchDist = Math.hypot(

          e.touches[0].pageX - e.touches[1].pageX,

          e.touches[0].pageY - e.touches[1].pageY

        );

         
        initialMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;

        initialMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

         
        State.panStartX = initialMidX;

        State.panStartY = initialMidY;

        State.initialPanX = State.panX;

        State.initialPanY = State.panY;

      }

    }, {passive: false});


    DOM.area.addEventListener('touchmove', (e) => {

      e.preventDefault();

      if (e.touches.length === 1) {

        if (State.isPanning) {

          State.panX = State.initialPanX + (e.touches[0].clientX - State.panStartX);

          State.panY = State.initialPanY + (e.touches[0].clientY - State.panStartY);

          updatePanTransform();

        } else if (State.isDrawing || State.selection.isDrawing || State.selection.isMoving || State.selection.isDraggingPivot) {

          handleInput(e, false);

        }

      } else if (e.touches.length === 2) {

        const dist = Math.hypot(

          e.touches[0].pageX - e.touches[1].pageX,

          e.touches[0].pageY - e.touches[1].pageY

        );

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;

        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

         
        if (initialPinchDist !== null) {

          const diff = dist - initialPinchDist;

          if (Math.abs(diff) > 20) {

            adjustZoom(diff > 0 ? 1 : -1);

            initialPinchDist = dist; 

          }

        }

         
        if (State.isPanning) {

          State.panX = State.initialPanX + (midX - State.panStartX);

          State.panY = State.initialPanY + (midY - State.panStartY);

          updatePanTransform();

        }

      }

    }, {passive: false});


    window.addEventListener('touchend', (e) => { 

      if (e.touches.length === 0) {

        initialPinchDist = null; stopAction();

      } else if (e.touches.length === 1 && State.isPanning) {

        State.panStartX = e.touches[0].clientX;

        State.panStartY = e.touches[0].clientY;

        State.initialPanX = State.panX;

        State.initialPanY = State.panY;

      }

    });


    DOM.area.addEventListener('wheel', (e) => {

      if (e.target.closest('.ui-module')) return;

      e.preventDefault();

      adjustZoom(e.deltaY > 0 ? -1 : 1);

    }, { passive: false });


    window.addEventListener('keydown', e => {

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

       
      if (e.ctrlKey || e.metaKey) {

        if (e.key === 'c' || e.key === 'C') { copySelection(); e.preventDefault(); return; }

        if (e.key === 'x' || e.key === 'X') { cutSelection(); e.preventDefault(); return; }

        if (e.key === 'v' || e.key === 'V') { if(State.clipboard.length > 0) pasteFromClipboard(0); e.preventDefault(); return; }

        if (e.key === 'z' || e.key === 'Z') {

          if (e.shiftKey) redo(); else undo();

          e.preventDefault(); return;

        }

        if (e.key === 'y' || e.key === 'Y') { redo(); e.preventDefault(); return; }

      }


      if (State.selection.active && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {

        e.preventDefault();

        if (e.key === 'ArrowUp') State.selection.y -= 1;

        if (e.key === 'ArrowDown') State.selection.y += 1;

        if (e.key === 'ArrowLeft') State.selection.x -= 1;

        if (e.key === 'ArrowRight') State.selection.x += 1;

        updateSelectionCanvas();

        drawGrid();

        return;

      }


      if (e.code === 'Space' && !State.spaceDown) { State.spaceDown = true; DOM.area.style.cursor = 'grab'; }

      if (e.key === 'b' || e.key === 'B') setTool('draw');

      if (e.key === 'e' || e.key === 'E') setTool('erase');

      if (e.key === 'f' || e.key === 'F') setTool('fill');

      if (e.key === 'm' || e.key === 'M' || e.key === 's' || e.key === 'S') setTool('select');

      if (e.key === 'h' || e.key === 'H') setTool('pan');

    });

    window.addEventListener('keyup', e => {

      if (e.code === 'Space') { 

        State.spaceDown = false; 

        if (!State.isPanning) DOM.area.style.cursor = State.tool === 'pan' ? 'grab' : (State.tool === 'select' ? 'crosshair' : 'crosshair'); 

      }

    });

     
    window.addEventListener('resize', resizeCanvas);

     
    const fsHandler = () => {

      const btn = document.getElementById('btn-fullscreen');

      if (!btn) return;

      const isFS = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

      if (isFS) {

        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;

      } else {

        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;

      }

    };

     
    document.addEventListener('fullscreenchange', fsHandler);

    document.addEventListener('webkitfullscreenchange', fsHandler);

    document.addEventListener('mozfullscreenchange', fsHandler);

    document.addEventListener('MSFullscreenChange', fsHandler);


    document.getElementById('mirror-x').onchange = e => State.mirrorX = e.target.checked;

    document.getElementById('mirror-y').onchange = e => State.mirrorY = e.target.checked;

    document.getElementById('grid-toggle').onchange = e => { State.showGrid = e.target.checked; drawGrid(); };

    document.getElementById('onion-toggle').onchange = e => { State.showOnion = e.target.checked; updateOnionSkin(); };

  }
