import { baseVertexShader } from "./shaders/base.vert.js";

export function createProgram(gl, fragmentSource) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Could not create a WebGL shader.");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader) || "Unknown shader compilation error.";
      gl.deleteShader(shader);
      throw new Error(log);
    }
    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, baseVertexShader);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error("Could not create a WebGL program.");
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "Unknown program link error.";
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

export function createDoubleFramebuffer(gl, width, height, type, filter = gl.LINEAR) {
  const makeTarget = () => {
    const texture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!texture || !framebuffer) throw new Error("Could not allocate a simulation framebuffer.");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(framebuffer);
      throw new Error(`Float framebuffer is incomplete (${width}×${height}).`);
    }
    return { texture, framebuffer, width, height };
  };
  let read = makeTarget();
  let write = makeTarget();
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return {
    get read() { return read; },
    get write() { return write; },
    swap() { [read, write] = [write, read]; },
    dispose() {
      gl.deleteTexture(read.texture);
      gl.deleteFramebuffer(read.framebuffer);
      gl.deleteTexture(write.texture);
      gl.deleteFramebuffer(write.framebuffer);
    },
  };
}

export function createFramebuffer(gl, width, height, type, filter = gl.LINEAR) {
  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) throw new Error("Could not allocate a simulation framebuffer.");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(framebuffer);
    throw new Error(`Float framebuffer is incomplete (${width}×${height}).`);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return {
    texture, framebuffer, width, height,
    dispose() { gl.deleteTexture(texture); gl.deleteFramebuffer(framebuffer); },
  };
}

export function createBlitter(gl) {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("Could not create the fullscreen quad.");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const uniforms = new WeakMap();
  return {
    draw(program, target = null, setUniforms = null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer ?? null);
      gl.viewport(0, 0, target?.width ?? gl.drawingBufferWidth, target?.height ?? gl.drawingBufferHeight);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      if (setUniforms) {
        let locations = uniforms.get(program);
        if (!locations) {
          locations = new Map();
          uniforms.set(program, locations);
        }
        setUniforms({
          int(name, value) {
            if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
            gl.uniform1i(locations.get(name), value);
          },
          float(name, value) {
            if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
            gl.uniform1f(locations.get(name), value);
          },
          vec2(name, x, y) {
            if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
            gl.uniform2f(locations.get(name), x, y);
          },
          vec3(name, x, y, z) {
            if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
            gl.uniform3f(locations.get(name), x, y, z);
          },
          vec4(name, x, y, z, w) {
            if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
            gl.uniform4f(locations.get(name), x, y, z, w);
          },
        });
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() { gl.deleteBuffer(buffer); },
  };
}
