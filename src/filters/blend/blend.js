/**
 * @filter         Blend
 * @description    Blend the source and destination pixels.
 * @param texture
 * @param blendmode
 * @param strength
 */

// Note: These function do not precompute alpha channels.
// This is a big todo see:
// - https://www.w3.org/TR/2009/WD-SVGCompositing-20090430/#alphaCompositing
// - https://www.w3.org/TR/compositing-1/#whatiscompositing

import { simpleShader, gl } from "../../core/canvas";
import { Shader } from "../../core/shader";

function blend(texture, blendmode, strength) {
  let blendFunction;

  switch (blendmode) {
    case "add":
      blendFunction = "src + dest;";
      break;
    case "subtract":
      blendFunction = "src - dest;";
      break;
    case "multiply":
      blendFunction = "src * dest;";
      break;
    case "darken":
      blendFunction = "min(src, dest);";
      break;
    case "lighten":
      blendFunction = "max(src, dest);";
      break;
    case "color-burn":
      blendFunction =
        "vec3((src.r == 0.0) ? 0.0 : (1.0 - ((1.0 - dest.r) / src.r))," +
        "(src.g == 0.0) ? 0.0 : (1.0 - ((1.0 - dest.g) / src.g))," +
        "(src.b == 0.0) ? 0.0 : (1.0 - ((1.0 - dest.b) / src.b)));";
      break;
    case "linear-burn":
      blendFunction = "(src + dest) - 1.0;";
      break;
    case "screen":
      blendFunction = "(src + dest) - (src * dest);";
      break;
    case "color-dodge":
      blendFunction =
        "vec3((src.r == 1.0) ? 1.0 : min(1.0, dest.r / (1.0 - src.r))," +
        "(src.g == 1.0) ? 1.0 : min(1.0, dest.g / (1.0 - src.g))," +
        "(src.b == 1.0) ? 1.0 : min(1.0, dest.b / (1.0 - src.b)));";
      break;
    case "linear-dodge":
      blendFunction = "src + dest;";
      break;
    case "overlay":
      blendFunction =
        "vec3((dest.r <= 0.5) ? (2.0 * src.r * dest.r) : (1.0 - 2.0 * (1.0 - dest.r) * (1.0 - src.r))," +
        "(dest.g <= 0.5) ? (2.0 * src.g * dest.g) : (1.0 - 2.0 * (1.0 - dest.g) * (1.0 - src.g))," +
        "(dest.b <= 0.5) ? (2.0 * src.b * dest.b) : (1.0 - 2.0 * (1.0 - dest.b) * (1.0 - src.b)));";
      break;
    case "soft-light":
      blendFunction =
        "vec3((src.r <= 0.5) ? (dest.r - (1.0 - 2.0 * src.r) * dest.r * (1.0 - dest.r)) : (((src.r > 0.5) && (dest.r <= 0.25)) ? (dest.r + (2.0 * src.r - 1.0) * (4.0 * dest.r * (4.0 * dest.r + 1.0) * (dest.r - 1.0) + 7.0 * dest.r)) : (dest.r + (2.0 * src.r - 1.0) * (sqrt(dest.r) - dest.r)))," +
        "(src.g <= 0.5) ? (dest.g - (1.0 - 2.0 * src.g) * dest.g * (1.0 - dest.g)) : (((src.g > 0.5) && (dest.g <= 0.25)) ? (dest.g + (2.0 * src.g - 1.0) * (4.0 * dest.g * (4.0 * dest.g + 1.0) * (dest.g - 1.0) + 7.0 * dest.g)) : (dest.g + (2.0 * src.g - 1.0) * (sqrt(dest.g) - dest.g)))," +
        "(src.b <= 0.5) ? (dest.b - (1.0 - 2.0 * src.b) * dest.b * (1.0 - dest.b)) : (((src.b > 0.5) && (dest.b <= 0.25)) ? (dest.b + (2.0 * src.b - 1.0) * (4.0 * dest.b * (4.0 * dest.b + 1.0) * (dest.b - 1.0) + 7.0 * dest.b)) : (dest.b + (2.0 * src.b - 1.0) * (sqrt(dest.b) - dest.b))));";
      break;
    case "hard-light":
      blendFunction =
        "vec3((src.r <= 0.5) ? (2.0 * src.r * dest.r) : (1.0 - 2.0 * (1.0 - src.r) * (1.0 - dest.r))," +
        "(src.g <= 0.5) ? (2.0 * src.g * dest.g) : (1.0 - 2.0 * (1.0 - src.g) * (1.0 - dest.g))," +
        "(src.b <= 0.5) ? (2.0 * src.b * dest.b) : (1.0 - 2.0 * (1.0 - src.b) * (1.0 - dest.b)));";
      break;
    case "vivid-light":
      blendFunction =
        "vec3((src.r <= 0.5) ? (1.0 - (1.0 - dest.r) / (2.0 * src.r)) : (dest.r / (2.0 * (1.0 - src.r)))," +
        "(src.g <= 0.5) ? (1.0 - (1.0 - dest.g) / (2.0 * src.g)) : (dest.g / (2.0 * (1.0 - src.g)))," +
        "(src.b <= 0.5) ? (1.0 - (1.0 - dest.b) / (2.0 * src.b)) : (dest.b / (2.0 * (1.0 - src.b))));";
      break;
    case "linear-light":
      blendFunction = "2.0 * src + dest - 1.0;";
      break;
    case "pin-light":
      blendFunction =
        "vec3((src.r > 0.5) ? max(dest.r, 2.0 * (src.r - 0.5)) : min(dest.r, 2.0 * src.r)," +
        "(src.r > 0.5) ? max(dest.g, 2.0 * (src.g - 0.5)) : min(dest.g, 2.0 * src.g)," +
        "(src.b > 0.5) ? max(dest.b, 2.0 * (src.b - 0.5)) : min(dest.b, 2.0 * src.b));";
      break;
    case "differece":
      blendFunction = "abs(dest - src);";
      break;
    case "exclusion":
      blendFunction = "src + dest - 2.0 * src * dest;";
      break;
    default:
      blendFunction = "mix(src, dest, 1.0);";
  }

  gl.blend =
    gl.blend ||
    new Shader(
      null,
      `
      uniform sampler2D originalTexture;
      uniform sampler2D blendTexture;
      uniform float strength;
      varying vec2 texCoord;
      
      vec3 blend (vec3 dest, vec3 src) {
          return ${blendFunction}
      }
      
      void main() {
        vec4 destColor = texture2D(originalTexture, texCoord);
        vec4 srcColor = texture2D(blendTexture, texCoord);
        vec3 blendedColor = clamp(blend(destColor.rgb, srcColor.rgb), 0.0, 1.0);
        float destAlpha = srcColor.a + destColor.a * (1.0 - srcColor.a);
        gl_FragColor.rgb = srcColor.a * ((1.0 - destColor.a) * srcColor.rgb + destColor.a * blendedColor) + (1.0 - srcColor.a) * destColor.a * destColor.rgb;
        gl_FragColor.r = ((gl_FragColor.r / 255.0) / destAlpha) * 255.0;
        gl_FragColor.g = ((gl_FragColor.g / 255.0) / destAlpha) * 255.0;
        gl_FragColor.b = ((gl_FragColor.b / 255.0) / destAlpha) * 255.0;
        gl_FragColor.a = destAlpha;
      }
    `
    );
  /*
	simple example:
	rgba(100%,0%, 0.7) over
	rgba(0%,100%, 0.4)

	color amounts:
	top: 70%
	bottom: (100%*0.4*(1-0.7)) = 12%

	alpha: 0.7+0.4*(1-0.7) = 0.82

	rgba: ((79%/0.82), 12%/0.82), 0, 0.82)
*/

  this._.extraTexture = texture._;
  this._.extraTexture.use(1);
  gl.blend.textures({
    originalTexture: 0,
    blendTexture: 1
  });

  simpleShader.call(this, gl.blend, {
    strength
  });

  return this;
}

export { blend };
