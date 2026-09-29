export const gradientShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_velocity;
uniform sampler2D u_pressure;
uniform vec2 u_texelSize;
void main() {
  float L = texture2D(u_pressure, v_uv - vec2(u_texelSize.x, 0.0)).x;
  float R = texture2D(u_pressure, v_uv + vec2(u_texelSize.x, 0.0)).x;
  float B = texture2D(u_pressure, v_uv - vec2(0.0, u_texelSize.y)).x;
  float T = texture2D(u_pressure, v_uv + vec2(0.0, u_texelSize.y)).x;
  vec2 velocity = texture2D(u_velocity, v_uv).xy - 0.5 * vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;
