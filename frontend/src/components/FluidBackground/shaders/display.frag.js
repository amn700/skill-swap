export const displayShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_dye;
uniform vec2 u_texelSize;
uniform float u_shading;
void main() {
  vec3 dye = texture2D(u_dye, v_uv).rgb;
  float left = dot(texture2D(u_dye, v_uv - vec2(u_texelSize.x, 0.0)).rgb, vec3(0.333));
  float right = dot(texture2D(u_dye, v_uv + vec2(u_texelSize.x, 0.0)).rgb, vec3(0.333));
  float bottom = dot(texture2D(u_dye, v_uv - vec2(0.0, u_texelSize.y)).rgb, vec3(0.333));
  float top = dot(texture2D(u_dye, v_uv + vec2(0.0, u_texelSize.y)).rgb, vec3(0.333));
  vec3 normal = normalize(vec3((left - right) * 5.0, (bottom - top) * 5.0, 1.0));
  float light = mix(1.0, 0.82 + 0.18 * max(dot(normal, normalize(vec3(-0.35, 0.5, 0.8))), 0.0), u_shading);
  // Dye is only attenuated, never color-boosted or hue-shifted. This keeps
  // accumulation inside the dark palette while preserving natural mixtures.
  float paletteLimit = min(1.0, min(0.32 / max(dye.r, 0.00001), min(0.42 / max(dye.g, 0.00001), 0.55 / max(dye.b, 0.00001))));
  gl_FragColor = vec4(dye * paletteLimit * light, 1.0);
}`;
