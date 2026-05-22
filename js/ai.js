// Re-pxl — AI Integration (Gemini API)
// Requires: state.js, color.js, ui.js, canvas.js

// RE-PXL PHASE-3 CHANGE: restored callGeminiAPI signature (was split across animation.js/ai.js)
async function callGeminiAPI(prompt, isJson = false) {
const url = `/.netlify/functions/gemini`;
  const payload = { prompt, isJson };

  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i <= delays.length; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const result = await response.json();
        return result.text;
      }
    } catch(e) {
      console.error('Fetch error:', e);
    }
    if (i < delays.length) await new Promise(r => setTimeout(r, delays[i]));
  }
  throw new Error("API call failed after retries.");
}


  async function enhancePrompt() {

    const input = document.getElementById('forge-prompt');

    const original = input.value.trim();

    if (!original) return showModal("AI Enhance", "Please enter a basic idea first (e.g. 'a wizard').");


    const btn = document.getElementById('btn-enhance-prompt');

    btn.innerHTML = "⏳";

    try {

      const promptText = `Enhance this prompt for a retro 2D pixel art sprite generator: '${original}'. Make it highly descriptive, focusing on visual details, vibrant colors, and classic 8-bit/16-bit gaming aesthetics. Keep it under 40 words. Output ONLY the prompt text.`;

      const enhanced = await callGeminiAPI(promptText, false);

      input.value = enhanced.trim();

    } catch (e) {

      showModal("Error", "Failed to enhance prompt with AI.");

    } finally {

      btn.innerHTML = "✨";

    }

  }


  window.generateAIPalette = async function() {

    const promptInput = document.getElementById('ai-palette-prompt');

    const theme = promptInput.value.trim();

    if (!theme) return showModal("AI Palette", "Please enter a theme first.");


    const lcdText = document.querySelector('.console-bezel .lcd-text');

    lcdText.innerText = "FORGING...>";

    try {

      const promptText = `Generate a 16-color hex code palette for pixel art based on the theme: '${theme}'. Ensure colors are visually distinct, work well together for retro games, and are sorted roughly from darkest to lightest. Return exactly 16 hex strings.`;

      const jsonText = await callGeminiAPI(promptText, true);

      const colors = JSON.parse(jsonText);


      if (colors && colors.length > 0) {

        let finalColors = colors.slice(0, 16);

        while(finalColors.length < 16) finalColors.push("#000000");


        const safeName = theme.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0,10) + '_' + Math.floor(Math.random()*100);

        Palettes.palettes[safeName] = finalColors;

        Palettes.change(safeName);


        showModal("✨ Palette Forged", `A unique 16-color palette for '${theme}' has been generated and applied!`);

        promptInput.value = '';

         
        const consoleEl = document.getElementById('palette-console');

        consoleEl.classList.remove('expanded');

        consoleEl.style.height = '32px';

        consoleEl.querySelector('.console-label').style.display = '';

        consoleEl.querySelector('.lcd-screen').style.display = 'none';

        togglePanel('palette-popover');

      } else {

        throw new Error("Invalid palette format returned.");

      }

    } catch (err) {

      showModal("Error", "Failed to generate AI palette.");

    } finally {

      lcdText.innerText = "SYS_RDY>";

    }

  };


  async function requestTransmutation() {

    commitSelection();

    const prompt = document.getElementById('forge-prompt').value.trim();

    if (!prompt) { showModal("Forge", "Please describe a character."); return; }

    togglePanel('forge-popover');

     
    showModal("Transmuting...", "Harnessing the ether to forge your sprite...\nThis may take up to 30 seconds.");

    const modalActions = document.getElementById('modal-actions');

    if (modalActions) modalActions.style.display = 'none';


    const apiKey = "GEMINI_API_KEY";

    const enhancedPrompt = `pixel art sprite of ${prompt}, white background, retro 8-bit style, flat colors, completely isolated subject, centered`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

    const options = {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({

        instances: { prompt: enhancedPrompt },

        parameters: { sampleCount: 1 }

      })

    };


    const delays = [1000, 2000, 4000, 8000, 16000];

    let resultData = null;


    try {

      for (let i = 0; i <= delays.length; i++) {

        try {

          const response = await fetch(url, options);

          if (response.ok) {

            resultData = await response.json();

            break;

          }

        } catch(e) {}

         
        if (i < delays.length) {

          await new Promise(res => setTimeout(res, delays[i]));

        }

      }


      if (!resultData || !resultData.predictions || !resultData.predictions[0]) {

        throw new Error("Generation failed");

      }


      const imageUrl = `data:image/png;base64,${resultData.predictions[0].bytesBase64Encoded}`;

       
      const img = new Image();

      img.onload = () => {

        preActionDataBatch = [{

          f: State.currentFrame, l: State.currentLayer,

          old: new ImageData(new Uint8ClampedArray(State.frames[State.currentFrame].layers[State.currentLayer].data.data), State.res, State.res)

        }];

         
        const tempC = document.createElement('canvas');

        tempC.width = State.res; tempC.height = State.res;

        const tCtx = tempC.getContext('2d');

         
        tCtx.imageSmoothingEnabled = false;

        tCtx.drawImage(img, 0, 0, State.res, State.res);

         
        const imgData = tCtx.getImageData(0, 0, State.res, State.res);

        const data = imgData.data;

         
        const visited = new Uint8Array(State.res * State.res);

        const bgTol = 30; 

        const corners = [[0,0], [State.res-1, 0], [0, State.res-1], [State.res-1, State.res-1]];


        for (let [cx, cy] of corners) {

          const cIdx = (cy * State.res + cx) * 4;

          if (data[cIdx+3] === 0) continue; 

           
          const bgR = data[cIdx], bgG = data[cIdx+1], bgB = data[cIdx+2];

          const stack = [[cx, cy]];

          visited[cy * State.res + cx] = 1;


          while(stack.length > 0) {

            const [x, y] = stack.pop();

            const idx = (y * State.res + x) * 4;

            data[idx+3] = 0; 


            const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];

            for (let [nx, ny] of neighbors) {

              if (nx >= 0 && nx < State.res && ny >= 0 && ny < State.res) {

                const nIdx = ny * State.res + nx;

                if (!visited[nIdx]) {

                  const pIdx = nIdx * 4;

                  if (Math.abs(data[pIdx] - bgR) <= bgTol && Math.abs(data[pIdx+1] - bgG) <= bgTol && Math.abs(data[pIdx+2] - bgB) <= bgTol) {

                    visited[nIdx] = 1;

                    stack.push([nx, ny]);

                  }

                }

              }

            }

          }

        }


        const currentPalette = Palettes.palettes[Palettes.mode];

        const palRgb = currentPalette.map(hex => ({

          r: parseInt(hex.slice(1,3), 16),

          g: parseInt(hex.slice(3,5), 16),

          b: parseInt(hex.slice(5,7), 16)

        }));


        for (let i = 0; i < data.length; i += 4) {

          if (data[i+3] === 0) continue; 

           
          const r = data[i], g = data[i+1], b = data[i+2];

           
          let minDist = Infinity;

          let match = palRgb[0];

          for(let pc of palRgb) {

            const dist = Math.abs(r - pc.r) + Math.abs(g - pc.g) + Math.abs(b - pc.b);

            if (dist < minDist) {

              minDist = dist;

              match = pc;

            }

          }

           
          data[i] = match.r;

          data[i+1] = match.g;

          data[i+2] = match.b;

        }

         
        tCtx.putImageData(imgData, 0, 0);

         
        ctx.globalCompositeOperation = 'source-over';

        ctx.clearRect(0, 0, State.res, State.res);

        ctx.drawImage(tempC, 0, 0);

         
        saveCurrentLayer(); 

         
        if (modalActions) modalActions.style.display = 'flex';

        showModal("Success!", `Generated entity based on: "${prompt}".`);

      };

      img.src = imageUrl;


    } catch (err) {

      if (modalActions) modalActions.style.display = 'flex';

      showModal("Forge Error", "Failed to contact the Alchemist API. The servers might be busy.");

    }

  }
