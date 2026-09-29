export const vorticityShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_velocity;
uniform sampler2D u_curl;
uniform vec2 u_texelSize;
uniform float u_curlStrength;
uniform float u_dt;
void main() {
  float L = abs(texture2D(u_curl, v_uv - vec2(u_texelSize.x, 0.0)).x);
  float R = abs(texture2D(u_curl, v_uv + vec2(u_texelSize.x, 0.0)).x);
  float B = abs(texture2D(u_curl, v_uv - vec2(0.0, u_texelSize.y)).x);
  float T = abs(texture2D(u_curl, v_uv + vec2(0.0, u_texelSize.y)).x);
  float C = texture2D(u_curl, v_uv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= u_curlStrength * C * u_dt;
  vec2 velocity = texture2D(u_velocity, v_uv).xy + force;
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;
