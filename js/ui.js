// Re-pxl — UI Panels, Overlays, Help, Console, Modals
// Requires: state.js

function toggleUI() {

    document.body.classList.toggle('hide-ui');

  }


  function toggleHelp() {

    document.body.classList.toggle('help-active');

    if (document.body.classList.contains('help-active')) {

      document.body.classList.remove('hide-ui');

    }

  }


  function toggleFullScreen() {

    const doc = document.documentElement;

    const requestFS = doc.requestFullscreen || doc.webkitRequestFullscreen || doc.mozRequestFullScreen || doc.msRequestFullscreen;

    const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;

     
    const isFS = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;


    if (!isFS) {

      if (requestFS) {

        try {

          const promise = requestFS.call(doc);

          if (promise) promise.catch(err => console.log("Fullscreen blocked:", err));

        } catch(e) {

          showModal("Notice", "Fullscreen is not supported on this device/browser.");

        }

      } else {

        showModal("Notice", "Fullscreen API is not supported by your browser (often disabled on iOS Safari).");

      }

    } else {

      if (exitFS) exitFS.call(document);

    }

  }


  // ---------------------------------------------------

  // UNDO / REDO & HISTORY BATCH LOGIC

  // ---------------------------------------------------

function togglePaletteDropdown() {

    const dropdown = document.getElementById('palette-dropdown');

    if (dropdown) dropdown.classList.toggle('show');

  }

function togglePanel(id) {

    document.querySelectorAll('.popover').forEach(p => {

      if (p.id !== id) p.classList.remove('show');

    });

    const panel = document.getElementById(id);

    if (panel) panel.classList.toggle('show');

  }


  document.addEventListener('click', (e) => {

    // RE-PXL PHASE-3 CHANGE: also exclude .btn-icon (new button class used for panel toggles)
    if (!e.target.closest('.popover') && !e.target.closest('.icon-btn') && !e.target.closest('.btn-icon') && !e.target.closest('.palette-header') && !e.target.closest('.console-container')) {

      document.querySelectorAll('.popover').forEach(p => {

        p.classList.remove('show');

      });

      const consoleEl = document.getElementById('palette-console');

      if (consoleEl && consoleEl.classList.contains('expanded')) {

        consoleEl.classList.remove('expanded');

        consoleEl.style.height = '32px';

        consoleEl.querySelector('.console-label').style.display = '';

        consoleEl.querySelector('.lcd-screen').style.display = 'none';

      }

    }

  });

window.expandConsole = function(e) {

    const consoleEl = document.getElementById('palette-console');

    if (!consoleEl.classList.contains('expanded')) {

      consoleEl.classList.add('expanded');

      consoleEl.style.height = '100px';

      consoleEl.style.cursor = 'default';

      consoleEl.querySelector('.console-label').style.display = 'none';

      consoleEl.querySelector('.lcd-screen').style.display = 'flex';

      setTimeout(() => document.getElementById('ai-palette-prompt').focus(), 150);

    }

  };


  window.handleConsoleKey = function(e) {

e.stopPropagation();

    if (e.key === 'Enter') generateAIPalette();

  };

window.saveInUseAsPreset = function() {

    const flatData = getCompositedFrame(State.currentFrame);

    const colors = new Set();

    const data = flatData.data;

    for (let i = 0; i < data.length; i += 4) {

      if (data[i + 3] > 128) {

        const r = data[i].toString(16).padStart(2, '0');

        const g = data[i+1].toString(16).padStart(2, '0');

        const b = data[i+2].toString(16).padStart(2, '0');

        colors.add(`#${r}${g}${b}`.toUpperCase());

      }

    }

    let palette = Array.from(colors).slice(0, 16);

    if (palette.length === 0) return showModal("Notice", "No colors are currently in use on the canvas.");

    while(palette.length < 16) palette.push("#000000");

     
    const name = "Custom_" + Math.floor(Date.now() / 1000);

    Palettes.palettes[name] = palette;

    Palettes.change(name);

    showModal("Palette Saved", "Current canvas colors added to presets as " + name);

  };


  // ---------------------------------------------------

  // SELECTION, MULTI-LAYER TRANSFORM & CLIPBOARD LOGIC

  // ---------------------------------------------------

function showModal(title, desc, text = null) {

    document.getElementById('modal-title').innerText = title; document.getElementById('modal-desc').innerText = desc;

    const ta = document.getElementById('modal-textarea'), btn = document.getElementById('modal-copy-btn');

    if (text) { ta.style.display = 'block'; ta.value = text; btn.style.display = 'block'; } 

    else { ta.style.display = 'none'; btn.style.display = 'none'; }

    document.getElementById('custom-modal').classList.add('show');

  }

  function closeModal() { document.getElementById('custom-modal').classList.remove('show'); }

  function copyModalContent() {

    document.getElementById('modal-textarea').select(); document.execCommand('copy');

    const btn = document.getElementById('modal-copy-btn'); btn.innerText = "Copied!"; setTimeout(() => btn.innerText = "Copy", 1500);

  }
