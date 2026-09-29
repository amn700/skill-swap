import { fluidConfig } from "./config.js";
import { createBlitter, createDoubleFramebuffer, createFramebuffer, createProgram } from "./webgl.js";
import { splatShader } from "./shaders/splat.frag.js";
import { advectionShader } from "./shaders/advection.frag.js";
import { curlShader } from "./shaders/curl.frag.js";
import { vorticityShader } from "./shaders/vorticity.frag.js";
import { divergenceShader } from "./shaders/divergence.frag.js";
import { pressureShader } from "./shaders/pressure.frag.js";
import { gradientShader } from "./shaders/gradient.frag.js";
import { displayShader } from "./shaders/display.frag.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function resolutionFor(maxSize, aspect) {
  return aspect >= 1
    ? { width: maxSize, height: Math.max(1, Math.round(maxSize / aspect)) }
    : { width: Math.max(1, Math.round(maxSize * aspect)), height: maxSize };
}

export function createFluidSimulation(canvas, gl) {
  const halfFloat = gl.getExtension("OES_texture_half_float");
  const float = gl.getExtension("OES_texture_float");
  const type = halfFloat?.HALF_FLOAT_OES ?? (float ? gl.FLOAT : null);

  if (!type) throw new Error("This browser does not support floating-point WebGL textures.");
  const linearFilter = halfFloat
    ? gl.getExtension("OES_texture_half_float_linear")
    : gl.getExtension("OES_texture_float_linear");
  if (!linearFilter) throw new Error("This browser cannot linearly filter floating-point textures.");
  if (halfFloat && !gl.getExtension("EXT_color_buffer_half_float")) {
    throw new Error("This browser cannot render to half-float textures.");
  }
  if (!halfFloat && !gl.getExtension("WEBGL_color_buffer_float")) {
    throw new Error("This browser cannot render to float textures.");
  }

  const programs = {
    splat: createProgram(gl, splatShader),
    advection: createProgram(gl, advectionShader),
    curl: createProgram(gl, curlShader),
    vorticity: createProgram(gl, vorticityShader),
    divergence: createProgram(gl, divergenceShader),
    pressure: createProgram(gl, pressureShader),
    gradient: createProgram(gl, gradientShader),
    display: createProgram(gl, displayShader),
  };
  const blitter = createBlitter(gl);

  let velocity;
  let dye;
  let pressure;
  let curl;
  let divergence;
  let viewport = { width: 1, height: 1 };
  let seeded = false;
  let disposed = false;

  function releaseTargets() {
    velocity?.dispose();
    dye?.dispose();
    pressure?.dispose();
    curl?.dispose();
    divergence?.dispose();
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.min(Math.round(canvas.clientWidth * dpr), 1920));
    const height = Math.max(1, Math.min(Math.round(canvas.clientHeight * dpr), 1920));
    if (canvas.width === width && canvas.height === height && velocity) return;

    canvas.width = width;
    canvas.height = height;
    viewport = { width, height };
    releaseTargets();

    const aspect = width / height;
    const simSize = resolutionFor(fluidConfig.simResolution, aspect);
    const dyeMaxSize = window.innerWidth < 768 ? 900 : fluidConfig.dyeResolution;
    const dyeSize = resolutionFor(Math.min(fluidConfig.dyeResolution, dyeMaxSize), aspect);

    velocity = createDoubleFramebuffer(gl, simSize.width, simSize.height, type);
    pressure = createDoubleFramebuffer(gl, simSize.width, simSize.height, type, gl.NEAREST);
    dye = createDoubleFramebuffer(gl, dyeSize.width, dyeSize.height, type);
    curl = createFramebuffer(gl, simSize.width, simSize.height, type, gl.NEAREST);
    divergence = createFramebuffer(gl, simSize.width, simSize.height, type, gl.NEAREST);

    for (const pair of [velocity, pressure, dye]) {
      for (const target of [pair.read, pair.write]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
        gl.viewport(0, 0, target.width, target.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    seeded = false;
  }

  function bindTexture(texture, unit) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  function splat(point, force, color, radius, dyeStrength = 1) {
    const aspect = viewport.width / viewport.height;
    const aspectX = aspect < 1 ? aspect : 1;
    const aspectY = aspect < 1 ? 1 : 1 / aspect;

    function apply(pair, value) {
      bindTexture(pair.read.texture, 0);
      blitter.draw(programs.splat, pair.write, (u) => {
        u.int("u_target", 0);
        u.vec2("u_point", point.x, point.y);
        u.vec2("u_aspect", aspectX, aspectY);
        u.vec3("u_value", value[0], value[1], value[2]);
        u.float("u_radius", radius);
      });
      pair.swap();
    }

    apply(velocity, [force.x, force.y, 0]);
    apply(dye, color.map((channel) => channel * dyeStrength));
  }

  function seedInitialFlow() {
    if (seeded) return;
    seeded = true;

    const colors = fluidConfig.colors;
    const paths = [
      {
        color: colors[0],
        points: [
          [0.025, 0.66, 0.30, 0.08], [0.09, 0.73, 0.34, 0.15],
          [0.17, 0.78, 0.30, 0.02], [0.25, 0.75, 0.22, -0.13],
          [0.32, 0.68, 0.13, -0.22], [0.40, 0.62, 0.22, -0.12],
          [0.49, 0.59, 0.30, 0.04], [0.57, 0.63, 0.24, 0.17],
        ],
      },
      {
        color: colors[1],
        points: [
          [0.98, 0.38, -0.32, 0.06], [0.90, 0.42, -0.29, 0.15],
          [0.82, 0.50, -0.25, 0.16], [0.73, 0.56, -0.22, 0.07],
          [0.66, 0.56, -0.26, -0.08], [0.57, 0.51, -0.21, -0.15],
          [0.49, 0.42, -0.16, -0.22],
        ],
      },
      {
        color: colors[2],
        points: [
          [0.22, 0.025, 0.10, 0.32], [0.28, 0.12, 0.16, 0.28],
          [0.36, 0.22, 0.22, 0.24], [0.46, 0.30, 0.25, 0.13],
          [0.55, 0.34, 0.18, 0.10], [0.62, 0.42, 0.11, 0.19],
          [0.65, 0.51, -0.03, 0.22],
        ],
      },
    ];

    for (const path of paths) {
      for (const [x, y, vx, vy] of path.points) {
        splat(
          { x, y },
          { x: vx * velocity.read.width, y: vy * velocity.read.height },
          [path.color.r, path.color.g, path.color.b],
          fluidConfig.splatRadius * 0.05,
          0.9,
        );
      }
    }
  }

  function clearPressure() {
    for (const target of [pressure.read, pressure.write]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, target.width, target.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  function applyPointerSplats(pointerEvents) {
    for (const event of pointerEvents) {
      const elapsed = clamp(event.elapsed, 1 / 240, 0.1);
      const speed = clamp(event.speed, 0, 2600);
      const response = (0.18 + Math.min(speed / 1900, 0.95)) * (fluidConfig.splatForce / 4500);
      const force = {
        x: clamp(event.dx / elapsed * velocity.read.width * response, -240, 240),
        y: clamp(event.dy / elapsed * velocity.read.height * response, -240, 240),
      };
      const color = [event.color.r, event.color.g, event.color.b];
      const radius = fluidConfig.splatRadius * (0.018 + Math.min(speed / 2600, 0.006));
      const dyeStrength = 0.85 + Math.min(speed / 1500, 0.9);
      splat({ x: event.x, y: event.y }, force, color, radius, dyeStrength);
    }
  }

  function step(dt, pointerEvents = []) {
    if (disposed) return;
    resize();
    seedInitialFlow();
    applyPointerSplats(pointerEvents);

    const simTexel = [1 / velocity.read.width, 1 / velocity.read.height];
    const dyeTexel = [1 / dye.read.width, 1 / dye.read.height];

    bindTexture(velocity.read.texture, 0);
    blitter.draw(programs.curl, curl, (u) => {
      u.int("u_velocity", 0);
      u.vec2("u_texelSize", simTexel[0], simTexel[1]);
    });

    bindTexture(velocity.read.texture, 0);
    bindTexture(curl.texture, 1);
    blitter.draw(programs.vorticity, velocity.write, (u) => {
      u.int("u_velocity", 0);
      u.int("u_curl", 1);
      u.vec2("u_texelSize", simTexel[0], simTexel[1]);
      u.float("u_curlStrength", fluidConfig.curl);
      u.float("u_dt", dt);
    });
    velocity.swap();

    bindTexture(velocity.read.texture, 0);
    blitter.draw(programs.divergence, divergence, (u) => {
      u.int("u_velocity", 0);
      u.vec2("u_texelSize", simTexel[0], simTexel[1]);
    });

    clearPressure();
    for (let i = 0; i < fluidConfig.pressureIterations; i += 1) {
      bindTexture(pressure.read.texture, 0);
      bindTexture(divergence.texture, 1);
      blitter.draw(programs.pressure, pressure.write, (u) => {
        u.int("u_pressure", 0);
        u.int("u_divergence", 1);
        u.vec2("u_texelSize", simTexel[0], simTexel[1]);
        u.float("u_pressureScale", fluidConfig.pressure);
      });
      pressure.swap();
    }

    bindTexture(velocity.read.texture, 0);
    bindTexture(pressure.read.texture, 1);
    blitter.draw(programs.gradient, velocity.write, (u) => {
      u.int("u_velocity", 0);
      u.int("u_pressure", 1);
      u.vec2("u_texelSize", simTexel[0], simTexel[1]);
    });
    velocity.swap();

    const velocityFade = Math.exp(-fluidConfig.velocityDissipation * dt * 0.12);
    bindTexture(velocity.read.texture, 0);
    bindTexture(velocity.read.texture, 1);
    blitter.draw(programs.advection, velocity.write, (u) => {
      u.int("u_velocity", 0);
      u.int("u_source", 1);
      u.vec2("u_velocityTexelSize", simTexel[0], simTexel[1]);
      u.float("u_dt", dt);
      u.float("u_dissipation", velocityFade);
    });
    velocity.swap();

    const dyeFade = Math.exp(-fluidConfig.densityDissipation * dt * 0.08);
    bindTexture(velocity.read.texture, 0);
    bindTexture(dye.read.texture, 1);
    blitter.draw(programs.advection, dye.write, (u) => {
      u.int("u_velocity", 0);
      u.int("u_source", 1);
      u.vec2("u_velocityTexelSize", simTexel[0], simTexel[1]);
      u.float("u_dt", dt);
      u.float("u_dissipation", dyeFade);
    });
    dye.swap();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, viewport.width, viewport.height);
    gl.clearColor(fluidConfig.background.r, fluidConfig.background.g, fluidConfig.background.b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    bindTexture(dye.read.texture, 0);
    blitter.draw(programs.display, null, (u) => {
      u.int("u_dye", 0);
      u.vec2("u_texelSize", dyeTexel[0], dyeTexel[1]);
      u.float("u_shading", fluidConfig.shading ? 1 : 0);
    });
  }

  resize();
  gl.disable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);

  return {
    step,
    dispose() {
      if (disposed) return;
      disposed = true;
      releaseTargets();
      Object.values(programs).forEach((program) => gl.deleteProgram(program));
      blitter.dispose();
    },
  };
}
