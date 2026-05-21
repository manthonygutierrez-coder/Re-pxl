// Re-pxl — Export (PNG, GIF, Sprite Sheet, MakeCode) & Project Save/Load
// Requires: state.js, layers.js, animation.js, ui.js

function exportSpritesheet() {

    commitSelection();

    if (State.frames.length === 0) return;

    const eCanvas = document.createElement('canvas');

    eCanvas.width = State.res * State.frames.length; eCanvas.height = State.res;

    State.frames.forEach((frame, i) => { eCanvas.getContext('2d').putImageData(getCompositedFrame(i), i * State.res, 0); });

    const link = document.createElement('a'); link.download = 'oekaki-spritesheet.png';

    link.href = eCanvas.toDataURL('image/png'); link.click(); togglePanel('export-popover');

  }


  function exportToMakeCode() {

    commitSelection();

    let hexStr = 'img`\n';

    const flatData = getCompositedFrame(State.currentFrame).data;

    for (let y = 0; y < State.res; y++) {

      for (let x = 0; x < State.res; x++) {

        const idx = (y * State.res + x) * 4;

        if (flatData[idx + 3] < 128) hexStr += '.';

        else hexStr += ((flatData[idx] + flatData[idx+1] + flatData[idx+2]) % 15 + 1).toString(16);

      }

      hexStr += '\n';

    }

    hexStr += '`';

    togglePanel('export-popover'); showModal("MakeCode Output", "Copy the string below:", hexStr);

  }


  function saveProject() {

    commitSelection();

    const serializedFrames = State.frames.map(f => {

      return {

        layers: f.layers.map(l => {

          const c = document.createElement('canvas');

          c.width = State.res; c.height = State.res;

          c.getContext('2d').putImageData(l.data, 0, 0);

          return { name: l.name, visible: l.visible, dataUrl: c.toDataURL() };

        })

      };

    });

     
    const projectData = { res: State.res, palettes: Palettes.palettes, frames: serializedFrames };

    const blob = new Blob([JSON.stringify(projectData)], {type: "application/json"});

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = "oekaki-project.json";

    a.click();

    URL.revokeObjectURL(url);

    togglePanel('export-popover');

  }


  function loadProject(e) {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (ev) => {

      try {

        const data = JSON.parse(ev.target.result);

        if (data.res) State.res = data.res;

        if (data.palettes) {

          Palettes.palettes = data.palettes;

          Palettes.render();

        }

         
        if (data.frames && data.frames.length > 0) {

          State.frames = [];

          for (const f of data.frames) {

            const newLayers = [];

            for (const l of f.layers) {

              const img = new Image();

              await new Promise(resolve => { img.onload = resolve; img.src = l.dataUrl; });

              const c = document.createElement('canvas');

              c.width = State.res; c.height = State.res;

              c.getContext('2d').drawImage(img, 0, 0);

              newLayers.push({

                name: l.name, visible: l.visible,

                data: c.getContext('2d').getImageData(0,0,State.res,State.res)

              });

            }

            State.frames.push({ layers: newLayers });

          }

          State.currentFrame = 0;

          State.currentLayer = 0;

          State.selectedLayers = new Set([0]);

          loadFrame(0);

          resizeCanvas();

        }

        showModal("Project Loaded", "Your workspace has been successfully restored.");

      } catch(err) {

        showModal("Error", "Could not load project file. It may be corrupted or invalid.");

      }

    };

    reader.readAsText(file);

    togglePanel('export-popover');

    e.target.value = '';

  }
