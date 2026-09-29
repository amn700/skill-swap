export const advectionShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform vec2 u_velocityTexelSize;
uniform float u_dt;
uniform float u_dissipation;
void main() {
  vec2 velocity = texture2D(u_velocity, v_uv).xy;
  vec2 coord = v_uv - u_dt * velocity * u_velocityTexelSize;
  gl_FragColor = texture2D(u_source, coord) * u_dissipation;
}`;
