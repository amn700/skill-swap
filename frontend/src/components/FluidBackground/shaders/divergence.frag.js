export const divergenceShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_velocity;
uniform vec2 u_texelSize;
void main() {
  float L = texture2D(u_velocity, v_uv - vec2(u_texelSize.x, 0.0)).x;
  float R = texture2D(u_velocity, v_uv + vec2(u_texelSize.x, 0.0)).x;
  float B = texture2D(u_velocity, v_uv - vec2(0.0, u_texelSize.y)).y;
  float T = texture2D(u_velocity, v_uv + vec2(0.0, u_texelSize.y)).y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;
