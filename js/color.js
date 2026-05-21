// Re-pxl — Palette Definitions, Color Management, Active Colors
// Requires: state.js, canvas.js, history.js
// NOTE: swapColorCanvasWide and updateActiveColors use their final
//       (authoritative) definitions; earlier duplicates are omitted.

const Palettes = {

    mode: 'outdoor',

    palettes: {

      outdoor: ["#000000", "#1D2B53", "#7E2553", "#008751", "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8", "#FF004D", "#FFA300", "#FFEC27", "#00E436", "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"],

      indoor: ["#000000", "#1D2B53", "#7E2553", "#008751", "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8", "#291814", "#111D35", "#422136", "#125359", "#742F29", "#49333B", "#A28879", "#F3EF7D"],

      gameboy: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f", "#000000", "#111111", "#222222", "#333333", "#444444", "#555555", "#666666", "#777777", "#888888", "#999999", "#aaaaaa", "#bbbbbb"],

      goline: ["#430067", "#94216a", "#ff004d", "#ff8426", "#ffdd34", "#50e112", "#3fa66f", "#365987", "#000000", "#0033ff", "#29adff", "#00ffcc", "#fff1e8", "#c2c3c7", "#ab5236", "#5f574f"],

      miyazaki: ["#232228", "#284261", "#5f5854", "#878573", "#b8b095", "#c3d5c7", "#ebecdc", "#2485a6", "#54bad2", "#754d45", "#c65046", "#e6928a", "#1e7453", "#55a058", "#a1bf41", "#e3c054"],

      summers: ["#320011", "#5f3a60", "#876672", "#b7a39d", "#ece8c2", "#6db7c3", "#5e80b2", "#627057", "#8da24e", "#d2cb3e", "#f7d554", "#e8bf92", "#e78c5b", "#c66f5e", "#c33846", "#933942"],

      endesga: ["#e4a672", "#b86f50", "#743f39", "#3f2832", "#9e2835", "#e53b44", "#fb922b", "#ffe762", "#63c64d", "#327345", "#193d3f", "#4f6781", "#afbfd2", "#ffffff", "#2ce8f4", "#0484d1"]

    },

    change(newMode) { 

      this.mode = newMode; 

      State.activeColor = this.palettes[this.mode][0];

      this.render(); 

    },

    triggerColorEdit(index, currentColor) {

      State.activeColor = currentColor;

      this.render();

      const picker = document.getElementById('hidden-color-picker');

      let hex = currentColor;

      if (hex.startsWith('#') && hex.length === 4) {

        hex = '#' + hex[1]+hex[1] + hex[2]+hex[2] + hex[3]+hex[3];

      }

      picker.value = hex;

      picker.oninput = (e) => {

        this.palettes[this.mode][index] = e.target.value;

        State.activeColor = e.target.value;

        this.render();

      };

      picker.click(); 

    },

    renderStrips() {

      const containers = [

        document.getElementById('palette-strips-popover')

      ];

       
      containers.forEach(container => {

        if (!container) return;

        container.innerHTML = '';

         
        Object.keys(this.palettes).forEach(key => {

          const stripWrap = document.createElement('div');

          stripWrap.style.display = 'flex';

          stripWrap.style.flexDirection = 'column';

          stripWrap.style.alignItems = 'center';

          stripWrap.style.gap = '6px';

          stripWrap.style.cursor = 'pointer';

          stripWrap.style.width = '64px'; 


          const label = document.createElement('div');

          label.style.fontSize = '12px';

          label.style.color = key === this.mode ? '#fff' : 'var(--text-dim)';

          label.style.fontWeight = key === this.mode ? 'bold' : 'normal';

          label.style.width = '100%';

          label.style.overflow = 'hidden';

          label.style.textOverflow = 'ellipsis';

          label.style.whiteSpace = 'nowrap';

          label.style.textAlign = 'center';

          label.innerText = key.charAt(0).toUpperCase() + key.slice(1);


          const strip = document.createElement('div');

          strip.style.display = 'grid';

          strip.style.gridTemplateColumns = 'repeat(4, 1fr)';

          strip.style.width = '44px';

          strip.style.height = '44px';

          strip.style.borderRadius = '6px';

          strip.style.overflow = 'hidden';

          strip.style.border = key === this.mode ? '2px solid var(--accent)' : '1px solid var(--border)';

           
          this.palettes[key].forEach(c => {

            const cDiv = document.createElement('div');

            cDiv.style.backgroundColor = c;

            strip.appendChild(cDiv);

          });


          stripWrap.onclick = () => {

            this.change(key);

            document.getElementById('palette-dropdown')?.classList.remove('show');

            document.getElementById('palette-popover')?.classList.remove('show');

          };

           
          stripWrap.appendChild(strip);

          stripWrap.appendChild(label);

          container.appendChild(stripWrap);

        });

      });

    },

    render() {

      const container = document.getElementById('active-palette');

      const colors = this.palettes[this.mode];

       
      container.innerHTML = '';


      colors.forEach((c, index) => {

        const s = document.createElement('div');

        s.className = 'swatch' + (State.activeColor === c && State.tool !== 'erase' ? ' selected' : '');

        s.style.background = c;

        s.style.setProperty('--cc', getContrastColor(c));

         
        s.onclick = () => {

          State.activeColor = c;

          if (State.tool === 'erase') setTool('draw');

          this.render(); 

        };


        let lastTap = 0;

        s.addEventListener('touchstart', (e) => {

          const currentTime = new Date().getTime();

          const tapLength = currentTime - lastTap;

          if (tapLength < 300 && tapLength > 0) {

            this.triggerColorEdit(index, c);

          }

          lastTap = currentTime;

        }, {passive: true});


        s.ondblclick = () => {

          this.triggerColorEdit(index, c);

        };


        container.appendChild(s);

      });


      if (DOM.hud) {

        const usesColor = (State.tool === 'draw' || State.tool === 'fill');

        if (usesColor) {

          DOM.hud.style.background = State.activeColor;

          DOM.hud.style.color = getContrastColor(State.activeColor);

          DOM.hud.style.borderColor = State.activeColor;

        } else {

          DOM.hud.style.background = 'rgba(0, 0, 0, 0.75)';

          DOM.hud.style.color = '#ffffff';

          DOM.hud.style.borderColor = 'rgba(255,255,255,0.2)';

        }

      }


      this.renderStrips();

      requestAnimationFrame(updatePaletteScrollIndicators);

    }

  };

function updatePaletteScrollIndicators() {

    const grid = document.getElementById('active-palette');

    const upBtn = document.getElementById('scroll-up-btn');

    const downBtn = document.getElementById('scroll-down-btn');

    const upFade = document.getElementById('scroll-fade-top');

    const downFade = document.getElementById('scroll-fade-bottom');

    if (!grid || !upBtn || !downBtn) return;


    const isScrollable = grid.scrollHeight > grid.clientHeight + 2; 

    const isAtTop = grid.scrollTop <= 2;

    const isAtBottom = Math.abs(grid.scrollHeight - grid.clientHeight - grid.scrollTop) <= 2;


    if (isScrollable) {

      upBtn.classList.toggle('visible', !isAtTop);

      upFade.classList.toggle('visible', !isAtTop);

      downBtn.classList.toggle('visible', !isAtBottom);

      downFade.classList.toggle('visible', !isAtBottom);

    } else {

      upBtn.classList.remove('visible');

      upFade.classList.remove('visible');

      downBtn.classList.remove('visible');

      downFade.classList.remove('visible');

    }

  }

window.swapColorCanvasWide = function(oldColor, newColor) {

    if (oldColor === newColor) return;

    commitSelection();

     
    const parseHex = (hex) => {

      if (hex.startsWith('#')) hex = hex.slice(1);

      return [parseInt(hex.slice(0,2), 16), parseInt(hex.slice(2,4), 16), parseInt(hex.slice(4,6), 16)];

    };

    const [oR, oG, oB] = parseHex(oldColor);

    const [nR, nG, nB] = parseHex(newColor);


    const oldData = ctx.getImageData(0,0,State.res,State.res);

    let swappedAny = false;

     
    const layerData = State.frames[State.currentFrame].layers[State.currentLayer].data.data;

    for (let i = 0; i < layerData.length; i += 4) {

      if (layerData[i+3] > 128 && Math.abs(layerData[i]-oR) < 2 && Math.abs(layerData[i+1]-oG) < 2 && Math.abs(layerData[i+2]-oB) < 2) {

        layerData[i] = nR;

        layerData[i+1] = nG;

        layerData[i+2] = nB;

        swappedAny = true;

      }

    }


    if (swappedAny) {

      pushHistoryBatch([{

        f: State.currentFrame,

        l: State.currentLayer,

        old: oldData,

        new: new ImageData(new Uint8ClampedArray(layerData), State.res, State.res)

      }]); 

      renderLayers();

      updateActiveColors();

    }

  };

function updateActiveColors() {

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

     
    const grid = document.getElementById('active-colors-grid');

    if (!grid) return;

    grid.innerHTML = '';

    const colorArray = Array.from(colors).slice(0, 16); 

     
    colorArray.forEach(c => {

      const s = document.createElement('div');

      s.className = 'active-color-swatch';

      s.style.backgroundColor = c;

      s.setAttribute('data-tooltip', c + '\n(Dbl-Click to Swap)');

       
      s.onclick = () => { State.activeColor = c; if (State.tool === 'erase') setTool('draw'); Palettes.render(); };

       
      let lastTap = 0;

      s.addEventListener('touchstart', (e) => {

        e.preventDefault();

        const currentTime = new Date().getTime();

        const tapLength = currentTime - lastTap;

        if (tapLength < 300 && tapLength > 0) {

          swapColorCanvasWide(c, State.activeColor);

        } else {

          State.activeColor = c; 

          if (State.tool === 'erase') setTool('draw'); 

          Palettes.render();

        }

        lastTap = currentTime;

      }, {passive: false});


      s.ondblclick = () => {

        swapColorCanvasWide(c, State.activeColor);

      };


      grid.appendChild(s);

    });

     
    for (let i = colorArray.length; i < 16; i++) {

      const s = document.createElement('div'); s.className = 'active-color-swatch empty'; grid.appendChild(s);

    }

  }
