import { Shader } from "../core/shader";

function clamp(lo, value, hi) {
  return Math.max(lo, Math.min(value, hi));
}

function warpShader(uniforms, warp) {
  return new Shader(
    null,
    `${uniforms}
    uniform sampler2D texture;
    uniform vec2 texSize;
    varying vec2 texCoord;
    void main() {
        vec2 coord = texCoord * texSize;
        ${warp}
        gl_FragColor = texture2D(texture, coord / texSize);
        vec2 clampedCoord = clamp(coord, vec2(0.0), texSize);
        if (coord != clampedCoord) {
            gl_FragColor.a *= max(0.0, 1.0 - length(coord - clampedCoord));
        }
    }`
  );
}

// returns a random number between 0 and 1
const randomShaderFunc = `
float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}`;

export { warpShader, randomShaderFunc, clamp };
