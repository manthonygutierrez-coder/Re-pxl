// Re-pxl — Undo / Redo History Stack
// Requires: state.js, canvas.js (drawGrid), layers.js (loadFrame, renderLayers)

function pushHistoryBatch(actions) {

    if (!actions || actions.length === 0) return;

    State.history.push(actions);

    if (State.history.length > 50) State.history.shift();

    State.redoStack = [];

  }


  function undo() {

    if (State.history.length === 0) return;

    commitSelection();

    const actions = State.history.pop();

    State.redoStack.push(actions);

     
    actions.forEach(action => {

      State.frames[action.f].layers[action.l].data = new ImageData(new Uint8ClampedArray(action.old.data), State.res, State.res);

    });

     
    State.currentFrame = actions[0].f;

    renderLayers();

    updateActiveColors();

    renderTimeline();

  }


  function redo() {

    if (State.redoStack.length === 0) return;

    commitSelection();

    const actions = State.redoStack.pop();

    State.history.push(actions);

     
    actions.forEach(action => {

      State.frames[action.f].layers[action.l].data = new ImageData(new Uint8ClampedArray(action.new.data), State.res, State.res);

    });

     
    State.currentFrame = actions[0].f;

    renderLayers();

    updateActiveColors();

    renderTimeline();

  }


  // ---------------------------------------------------

  // MULTI-LAYER & DRAG/DROP LOGIC

  // ---------------------------------------------------
