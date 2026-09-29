export const splatShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_target;
uniform vec2 u_point;
uniform vec2 u_aspect;
uniform vec3 u_value;
uniform float u_radius;
void main() {
  vec2 p = (v_uv - u_point) * u_aspect;
  float falloff = exp(-dot(p, p) / max(u_radius * u_radius, 0.00001));
  vec4 base = texture2D(u_target, v_uv);
  gl_FragColor = vec4(base.xyz + u_value * falloff, 1.0);
}`;
