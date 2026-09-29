export const pressureShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
uniform vec2 u_texelSize;
uniform float u_pressureScale;
void main() {
  float L = texture2D(u_pressure, v_uv - vec2(u_texelSize.x, 0.0)).x;
  float R = texture2D(u_pressure, v_uv + vec2(u_texelSize.x, 0.0)).x;
  float B = texture2D(u_pressure, v_uv - vec2(0.0, u_texelSize.y)).x;
  float T = texture2D(u_pressure, v_uv + vec2(0.0, u_texelSize.y)).x;
  float divergence = texture2D(u_divergence, v_uv).x;
  float estimate = (L + R + B + T - divergence) * 0.25;
  float current = texture2D(u_pressure, v_uv).x;
  float pressure = mix(current, estimate, 1.0 - u_pressureScale);
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;
