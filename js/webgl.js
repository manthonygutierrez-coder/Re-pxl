// Re-pxl — WebGL Selection Glow Effect
// Requires: state.js (DOM.glow canvas)

const GL_VS = `

   attribute vec2 a_position;

   varying vec2 v_texCoord;

   void main() {

    v_texCoord = a_position * 0.5 + 0.5;

    v_texCoord.y = 1.0 - v_texCoord.y;

    gl_Position = vec4(a_position, 0.0, 1.0);

   }

  `;


  const GL_FS = `

   precision mediump float;

   varying vec2 v_texCoord;

   uniform sampler2D u_texture;

   uniform vec2 u_resolution;

   uniform float u_time;

   uniform vec4 u_color;

   uniform float u_radius;

   uniform float u_speed;

   const int MAX_RADIUS = 15;

    
   void main() {

    vec4 centerColor = texture2D(u_texture, v_texCoord);

    // We only want an INNER glow. Discard transparent pixels.

    if (centerColor.a < 0.1) {

     gl_FragColor = vec4(0.0);

     return;

    }

     
    vec2 pixelSize = 1.0 / u_resolution;

    float minDist = u_radius + 1.0;

     
    for (int y = -MAX_RADIUS; y <= MAX_RADIUS; y++) {

     if (float(y) < -u_radius || float(y) > u_radius) continue;

     for (int x = -MAX_RADIUS; x <= MAX_RADIUS; x++) {

      if (float(x) < -u_radius || float(x) > u_radius) continue;

      vec2 offset = vec2(float(x), float(y));

      float dist = length(offset);

      if (dist <= u_radius) {

       vec4 neighbor = texture2D(u_texture, v_texCoord + offset * pixelSize);

       if (neighbor.a < 0.1) {

        minDist = min(minDist, dist);

       }

      }

     }

    }

     
    if (minDist > u_radius) {

     gl_FragColor = vec4(0.0);

     return;

    }

     
    float intensity = 1.0 - (minDist / u_radius);

    // Make the edge ramp up to full opacity faster

    intensity = smoothstep(0.0, 0.8, intensity);

     
    // Keep minimum pulse higher so it never fades out completely

    float pulse = 0.6 + 0.4 * sin(u_time * u_speed);

     
    // Multiply by 1.5x for a brighter core glow, clamped to 1.0 maximum alpha

    float finalAlpha = min(1.0, u_color.a * intensity * pulse * 1.5);

    gl_FragColor = vec4(u_color.rgb, finalAlpha);

   }

  `;


  const GLState = { gl: null, programInfo: null, texture: null, positionBuffer: null };


  function initGlowWebGL() {

    const gl = DOM.glow.getContext('webgl', { alpha: true, premultipliedAlpha: false });

    if (!gl) return;

    GLState.gl = gl;


    const compileShader = (type, source) => {

      const s = gl.createShader(type);

      gl.shaderSource(s, source);

      gl.compileShader(s);

      return s;

    };

    const vs = compileShader(gl.VERTEX_SHADER, GL_VS);

    const fs = compileShader(gl.FRAGMENT_SHADER, GL_FS);


    const prog = gl.createProgram();

    gl.attachShader(prog, vs);

    gl.attachShader(prog, fs);

    gl.linkProgram(prog);


    const posBuf = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    GLState.positionBuffer = posBuf;


    GLState.programInfo = {

      program: prog,

      attribs: { position: gl.getAttribLocation(prog, 'a_position') },

      uniforms: {

        resolution: gl.getUniformLocation(prog, 'u_resolution'),

        time: gl.getUniformLocation(prog, 'u_time'),

        texture: gl.getUniformLocation(prog, 'u_texture'),

        color: gl.getUniformLocation(prog, 'u_color'),

        radius: gl.getUniformLocation(prog, 'u_radius'),

        speed: gl.getUniformLocation(prog, 'u_speed')

      }

    };


    GLState.texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, GLState.texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  }


  function updateGlowTexture() {

    if (!GLState.gl) return;

    const gl = GLState.gl;

    if (!State.selection.active) {

      gl.clearColor(0,0,0,0);

      gl.clear(gl.COLOR_BUFFER_BIT);

      return;

    }

    gl.bindTexture(gl.TEXTURE_2D, GLState.texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, DOM.selection);

  }


  function renderGlowWebGL(timeMs) {

    if (!GLState.gl) return;

    const gl = GLState.gl;

    const info = GLState.programInfo;


    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    gl.clear(gl.COLOR_BUFFER_BIT);


    if (!State.selection.active || !State.selection.layerData || State.selection.layerData.size === 0) return;


    gl.useProgram(info.program);


    gl.bindBuffer(gl.ARRAY_BUFFER, GLState.positionBuffer);

    gl.enableVertexAttribArray(info.attribs.position);

    gl.vertexAttribPointer(info.attribs.position, 2, gl.FLOAT, false, 0, 0);


    gl.uniform2f(info.uniforms.resolution, gl.canvas.width, gl.canvas.height);

    gl.uniform1f(info.uniforms.time, timeMs / 1000.0);

     
    // Pass standard Accent Color: rgba(124, 77, 255, 1.0)

    gl.uniform4f(info.uniforms.color, 124/255, 77/255, 255/255, 1.0);

    gl.uniform1f(info.uniforms.radius, 2.0); // 2px inner outline

    gl.uniform1f(info.uniforms.speed, 5.0); // Pulse speed (Increased by 25% from 4.0)


    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, GLState.texture);

    gl.uniform1i(info.uniforms.texture, 0);


    gl.drawArrays(gl.TRIANGLES, 0, 6);

  }
