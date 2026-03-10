"use client";

import { useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   WebGL2 Navier-Stokes Fluid Simulation
   Based on Jos Stam's "Stable Fluids" (1999)
   ═══════════════════════════════════════════════════════════════ */

// Brand palette for splats
const SPLAT_COLORS = [
  [0.45, 0.15, 0.95], // saffron
  [0.23, 0.51, 0.96], // blue
  [0.02, 0.71, 0.83], // cyan
  [0.55, 0.25, 0.92], // violet
  [0.65, 0.18, 0.85], // magenta-saffron
  [0.10, 0.55, 0.90], // royal blue
];

// ── Shader sources ──

const BASE_VERT = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const SPLAT_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const ADVECTION_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main () {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec3 result = dissipation * texture2D(uSource, coord).xyz;
    gl_FragColor = vec4(result, 1.0);
  }
`;

const CURL_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`;

const VORTICITY_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
  }
`;

const DIVERGENCE_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const PRESSURE_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT_SUB_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vel.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

const CLEAR_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const DISPLAY_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  void main () {
    vec3 c = texture2D(uTexture, vUv).rgb;
    // Subtle tone mapping for glow
    c = pow(c * 1.2, vec3(0.85));
    gl_FragColor = vec4(c, c.r + c.g + c.b);
  }
`;

// ── Helpers ──

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string) {
  const program = gl.createProgram()!;
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(program);

  const uniforms: Record<string, WebGLUniformLocation> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i)!;
    uniforms[info.name] = gl.getUniformLocation(program, info.name)!;
  }

  return { program, uniforms };
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

function createFBO(gl: WebGLRenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): FBO {
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    texture,
    fbo,
    width: w,
    height: h,
    attach(id: number) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    },
  };
}

function createDoubleFBO(gl: WebGLRenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): DoubleFBO {
  let fbo1 = createFBO(gl, w, h, internalFormat, format, type, filter);
  let fbo2 = createFBO(gl, w, h, internalFormat, format, type, filter);
  return {
    width: w,
    height: h,
    get read() { return fbo1; },
    set read(v) { fbo1 = v; },
    get write() { return fbo2; },
    set write(v) { fbo2 = v; },
    swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
  };
}

// ── Config ──
const SIM_RES = 128;
const DYE_RES = 512;
const CURL_STRENGTH = 30;
const PRESSURE_ITERATIONS = 20;
const VELOCITY_DISSIPATION = 0.98;
const DENSITY_DISSIPATION = 0.97;
const SPLAT_RADIUS = 0.003;
const SPLAT_FORCE = 6000;
const AUTO_SPLAT_INTERVAL = 800; // ms between auto splats

export default function FluidSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const pointerRef = useRef({ x: 0, y: 0, dx: 0, dy: 0, moved: false, down: false });
  const lastAutoSplat = useRef(0);

  const getRandomColor = useCallback(() => {
    return SPLAT_COLORS[Math.floor(Math.random() * SPLAT_COLORS.length)];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    // Check for float texture support
    const halfFloat = gl.getExtension("OES_texture_half_float");
    const halfFloatLinear = gl.getExtension("OES_texture_half_float_linear");

    if (!halfFloat) return; // Graceful fallback — canvas stays transparent

    const halfFloatType = halfFloat.HALF_FLOAT_OES;
    const formatRGBA = gl.RGBA;
    const filterType = halfFloatLinear ? gl.LINEAR : gl.NEAREST;

    // Compile all shader programs
    const splatProg = createProgram(gl, BASE_VERT, SPLAT_FRAG);
    const advectionProg = createProgram(gl, BASE_VERT, ADVECTION_FRAG);
    const curlProg = createProgram(gl, BASE_VERT, CURL_FRAG);
    const vorticityProg = createProgram(gl, BASE_VERT, VORTICITY_FRAG);
    const divergenceProg = createProgram(gl, BASE_VERT, DIVERGENCE_FRAG);
    const pressureProg = createProgram(gl, BASE_VERT, PRESSURE_FRAG);
    const gradSubProg = createProgram(gl, BASE_VERT, GRADIENT_SUB_FRAG);
    const clearProg = createProgram(gl, BASE_VERT, CLEAR_FRAG);
    const displayProg = createProgram(gl, BASE_VERT, DISPLAY_FRAG);

    // Full-screen quad
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const indices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    // Setup attribute for all programs
    function bindVertexAttrib(prog: { program: WebGLProgram }) {
      const loc = gl!.getAttribLocation(prog.program, "aPosition");
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
    }

    // Init framebuffers
    function getResolution(res: number) {
      let aspectRatio = gl!.canvas.width / gl!.canvas.height;
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
      const min = Math.round(res);
      const max = Math.round(res * aspectRatio);
      return gl!.canvas.width > gl!.canvas.height ? { w: max, h: min } : { w: min, h: max };
    }

    const simSize = getResolution(SIM_RES);
    const dyeSize = getResolution(DYE_RES);

    const velocity = createDoubleFBO(gl, simSize.w, simSize.h, formatRGBA, formatRGBA, halfFloatType, filterType);
    const dye = createDoubleFBO(gl, dyeSize.w, dyeSize.h, formatRGBA, formatRGBA, halfFloatType, filterType);
    const curl = createFBO(gl, simSize.w, simSize.h, formatRGBA, formatRGBA, halfFloatType, gl.NEAREST);
    const divergence = createFBO(gl, simSize.w, simSize.h, formatRGBA, formatRGBA, halfFloatType, gl.NEAREST);
    const pressure = createDoubleFBO(gl, simSize.w, simSize.h, formatRGBA, formatRGBA, halfFloatType, gl.NEAREST);

    function blit(target: FBO | null) {
      if (target) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
        gl!.viewport(0, 0, target.width, target.height);
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.viewport(0, 0, gl!.canvas.width, gl!.canvas.height);
      }
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    }

    function splat(x: number, y: number, dx: number, dy: number, color: number[]) {
      gl!.useProgram(splatProg.program);
      bindVertexAttrib(splatProg);
      gl!.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
      gl!.uniform1f(splatProg.uniforms.aspectRatio, canvas!.width / canvas!.height);
      gl!.uniform2f(splatProg.uniforms.point, x, y);
      gl!.uniform3f(splatProg.uniforms.color, dx, dy, 0.0);
      gl!.uniform1f(splatProg.uniforms.radius, SPLAT_RADIUS);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
      gl!.uniform3f(splatProg.uniforms.color, color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    }

    function step(dt: number) {
      // Curl
      gl!.useProgram(curlProg.program);
      bindVertexAttrib(curlProg);
      gl!.uniform2f(curlProg.uniforms.texelSize, 1.0 / simSize.w, 1.0 / simSize.h);
      gl!.uniform1i(curlProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      // Vorticity
      gl!.useProgram(vorticityProg.program);
      bindVertexAttrib(vorticityProg);
      gl!.uniform2f(vorticityProg.uniforms.texelSize, 1.0 / simSize.w, 1.0 / simSize.h);
      gl!.uniform1i(vorticityProg.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(vorticityProg.uniforms.uCurl, curl.attach(1));
      gl!.uniform1f(vorticityProg.uniforms.curl, CURL_STRENGTH);
      gl!.uniform1f(vorticityProg.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      // Divergence
      gl!.useProgram(divergenceProg.program);
      bindVertexAttrib(divergenceProg);
      gl!.uniform2f(divergenceProg.uniforms.texelSize, 1.0 / simSize.w, 1.0 / simSize.h);
      gl!.uniform1i(divergenceProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      // Clear pressure
      gl!.useProgram(clearProg.program);
      bindVertexAttrib(clearProg);
      gl!.uniform1i(clearProg.uniforms.uTexture, pressure.read.attach(0));
      gl!.uniform1f(clearProg.uniforms.value, 0.8);
      blit(pressure.write);
      pressure.swap();

      // Pressure solve (Jacobi iterations)
      gl!.useProgram(pressureProg.program);
      bindVertexAttrib(pressureProg);
      gl!.uniform2f(pressureProg.uniforms.texelSize, 1.0 / simSize.w, 1.0 / simSize.h);
      gl!.uniform1i(pressureProg.uniforms.uDivergence, divergence.attach(1));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(pressureProg.uniforms.uPressure, pressure.read.attach(0));
        blit(pressure.write);
        pressure.swap();
      }

      // Gradient subtract
      gl!.useProgram(gradSubProg.program);
      bindVertexAttrib(gradSubProg);
      gl!.uniform2f(gradSubProg.uniforms.texelSize, 1.0 / simSize.w, 1.0 / simSize.h);
      gl!.uniform1i(gradSubProg.uniforms.uPressure, pressure.read.attach(0));
      gl!.uniform1i(gradSubProg.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      // Advect velocity
      gl!.useProgram(advectionProg.program);
      bindVertexAttrib(advectionProg);
      gl!.uniform2f(advectionProg.uniforms.texelSize, 1.0 / simSize.w, 1.0 / simSize.h);
      gl!.uniform1i(advectionProg.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(advectionProg.uniforms.uSource, velocity.read.attach(0));
      gl!.uniform1f(advectionProg.uniforms.dt, dt);
      gl!.uniform1f(advectionProg.uniforms.dissipation, VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      // Advect dye
      gl!.uniform2f(advectionProg.uniforms.texelSize, 1.0 / dyeSize.w, 1.0 / dyeSize.h);
      gl!.uniform1i(advectionProg.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(advectionProg.uniforms.uSource, dye.read.attach(1));
      gl!.uniform1f(advectionProg.uniforms.dissipation, DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function render() {
      gl!.useProgram(displayProg.program);
      bindVertexAttrib(displayProg);
      gl!.uniform1i(displayProg.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    // Resize
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    // Pointer events
    function updatePointer(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      const ptr = pointerRef.current;
      ptr.dx = (x - ptr.x) * SPLAT_FORCE;
      ptr.dy = (y - ptr.y) * SPLAT_FORCE;
      ptr.x = x;
      ptr.y = y;
      ptr.moved = true;
    }

    function onPointerMove(e: PointerEvent) {
      updatePointer(e);
    }
    function onPointerDown(e: PointerEvent) {
      pointerRef.current.down = true;
      updatePointer(e);
    }
    function onPointerUp() {
      pointerRef.current.down = false;
    }

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    // Seed with initial splats
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        const color = getRandomColor();
        const x = 0.15 + Math.random() * 0.7;
        const y = 0.15 + Math.random() * 0.7;
        const dx = (Math.random() - 0.5) * 1000;
        const dy = (Math.random() - 0.5) * 1000;
        splat(x, y, dx, dy, color);
      }
    }, 100);

    // Animation loop
    let lastTime = performance.now();

    function loop() {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016);
      lastTime = now;

      // Handle pointer input
      const ptr = pointerRef.current;
      if (ptr.moved) {
        ptr.moved = false;
        const color = getRandomColor();
        splat(ptr.x, ptr.y, ptr.dx, ptr.dy, color);
      }

      // Auto splats to keep it alive
      if (now - lastAutoSplat.current > AUTO_SPLAT_INTERVAL) {
        lastAutoSplat.current = now;
        const color = getRandomColor();
        const angle = Math.random() * Math.PI * 2;
        const x = 0.1 + Math.random() * 0.8;
        const y = 0.1 + Math.random() * 0.8;
        splat(x, y, Math.cos(angle) * 400, Math.sin(angle) * 400, color);
      }

      step(dt);
      render();
      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [getRandomColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}
