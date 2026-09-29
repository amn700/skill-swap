export const curlShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_velocity;
uniform vec2 u_texelSize;
void main() {
  float L = texture2D(u_velocity, v_uv - vec2(u_texelSize.x, 0.0)).y;
  float R = texture2D(u_velocity, v_uv + vec2(u_texelSize.x, 0.0)).y;
  float B = texture2D(u_velocity, v_uv - vec2(0.0, u_texelSize.y)).x;
  float T = texture2D(u_velocity, v_uv + vec2(0.0, u_texelSize.y)).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;
