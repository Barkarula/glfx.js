import { Texture } from "./texture";

// import { texture } from "./";
// import { draw } from "../";
// import { update } from "./";
// import { replace } from "./";
// import { contents } from "./";
// import { getPixelArray } from "./";

import { brightnessContrast } from "../filters/adjust/brightnesscontrast";
import { hexagonalPixelate } from "../filters/fun/hexagonalpixelate";
import { hueSaturation } from "../filters/adjust/huesaturation";
import { colorHalftone } from "../filters/fun/colorhalftone";
import { triangleBlur } from "../filters/blur/triangleblur";
import { unsharpMask } from "../filters/adjust/unsharpmask";
import { perspective } from "../filters/warp/perspective";
import { matrixWarp } from "../filters/warp/matrixwarp";
import { bulgePinch } from "../filters/warp/bulgepinch";
import { tiltShift } from "../filters/blur/tiltshift";
import { dotScreen } from "../filters/fun/dotscreen";
import { edgeWork } from "../filters/fun/edgework";
import { lensBlur } from "../filters/blur/lensblur";
import { zoomBlur } from "../filters/blur/zoomblur";
import { noise } from "../filters/adjust/noise";
import { denoise } from "../filters/adjust/denoise";
import { curves } from "../filters/adjust/curves";
import { swirl } from "../filters/warp/swirl";
import { ink } from "../filters/fun/ink";
import { vignette } from "../filters/adjust/vignette";
import { vibrance } from "../filters/adjust/vibrance";
import { sepia } from "../filters/adjust/sepia";
import { feColorMatrix } from "../filters/adjust/fecolormatrix";
import { blend } from "../filters/blend/blend";

import { Shader } from "./shader";

let gl;

function clamp(lo, value, hi) {
  return Math.max(lo, Math.min(value, hi));
}

function wrapTexture(texture,width,height) {
  return {
    _: texture,
    loadContentsOf(element,width,height) {
      // Make sure that we're using the correct global WebGL context
      gl = this._.gl;
      this._.loadContentsOf(element);
    },
    destroy() {
      // Make sure that we're using the correct global WebGL context
      gl = this._.gl;
      this._.destroy();
    }
  };
}

function texture(element,width,height) {
  return wrapTexture(Texture.fromElement(element,width,height));
}

function initialize(width, height) {
  let type = gl.UNSIGNED_BYTE;

  // Go for floating point buffer textures if we can, it'll make the bokeh
  // filter look a lot better. Note that on Windows, ANGLE does not let you
  // render to a floating-point texture when linear filtering is enabled.
  // See http://crbug.com/172278 for more information.
  if (
    gl.getExtension("OES_texture_float") &&
    gl.getExtension("OES_texture_float_linear")
  ) {
    const testTexture = new Texture(100, 100, gl.RGBA, gl.FLOAT);
    try {
      // Only use gl.FLOAT if we can render to it
      testTexture.drawTo(() => {
        type = gl.FLOAT;
      });
    } catch (e) {}
    testTexture.destroy();
  }

  if (this._.texture) this._.texture.destroy();
  if (this._.spareTexture) this._.spareTexture.destroy();
  this.width = width;
  this.height = height;
  this._.texture = new Texture(width, height, gl.RGBA, type);
  this._.spareTexture = new Texture(width, height, gl.RGBA, type);
  this._.extraTexture = this._.extraTexture || new Texture(0, 0, gl.RGBA, type);
  this._.flippedShader =
    this._.flippedShader ||
    new Shader(
      null,
      `
      uniform sampler2D texture;
      varying vec2 texCoord;
      void main() {
          gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y));
      }
    `
    );
  this._.isInitialized = true;
}

/*
   Draw a texture to the canvas, with an optional width and height to scale to.
   If no width and height are given then the original texture width and height
   are used.
*/
function draw(texture, width, height) {
  if (
    !this._.isInitialized ||
    texture._.width != this.width ||
    texture._.height != this.height
  ) {
    initialize.call(
      this,
      width ? width : texture._.width,
      height ? height : texture._.height
    );
  }

  texture._.use();
  this._.texture.drawTo(() => {
    Shader.getDefaultShader().drawRect();
  });

  return this;
}

function update() {
  this._.texture.use();
  this._.flippedShader.drawRect();
  return this;
}

function simpleShader(shader, uniforms, textureIn, textureOut) {
  (textureIn || this._.texture).use();
  this._.spareTexture.drawTo(() => {
    shader.uniforms(uniforms).drawRect();
  });
  this._.spareTexture.swapWith(textureOut || this._.texture);
}

function replace(node) {
  node.parentNode.insertBefore(this, node);
  node.parentNode.removeChild(node);
  return this;
}

function contents() {
  const texture = new Texture(
    this._.texture.width,
    this._.texture.height,
    gl.RGBA,
    gl.UNSIGNED_BYTE
  );
  this._.texture.use();
  texture.drawTo(() => {
    Shader.getDefaultShader().drawRect();
  });
  return wrapTexture(texture);
}

/*
   Get a Uint8 array of pixel values: [r, g, b, a, r, g, b, a, ...]
   Length of the array will be width * height * 4.
*/
function getPixelArray() {
  const w = this._.texture.width;
  const h = this._.texture.height;
  const array = new Uint8Array(w * h * 4);
  this._.texture.drawTo(() => {
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, array);
  });
  return array;
}

function wrap(func) {
  return function() {
    // Make sure that we're using the correct global WebGL context
    gl = this._.gl;

    // Now that the context has been switched, we can call the wrapped function
    return func.apply(this, arguments);
  };
}

function canvas() {
  const canvas = document.createElement("canvas");
  try {
    gl = canvas.getContext("experimental-webgl", { premultipliedAlpha: false });
  } catch (e) {
    gl = null;
  }
  if (!gl) {
    throw "This browser does not support WebGL";
  }
  canvas._ = {
    gl,
    isInitialized: false,
    texture: null,
    spareTexture: null,
    flippedShader: null
  };

  // Core methods
  canvas.texture = wrap(texture);
  canvas.draw = wrap(draw);
  canvas.update = wrap(update);
  canvas.replace = wrap(replace);
  canvas.contents = wrap(contents);
  canvas.getPixelArray = wrap(getPixelArray);

  // Filter methods
  canvas.brightnessContrast = wrap(brightnessContrast);
  canvas.hexagonalPixelate = wrap(hexagonalPixelate);
  canvas.hueSaturation = wrap(hueSaturation);
  canvas.colorHalftone = wrap(colorHalftone);
  canvas.triangleBlur = wrap(triangleBlur);
  canvas.unsharpMask = wrap(unsharpMask);
  canvas.perspective = wrap(perspective);
  canvas.matrixWarp = wrap(matrixWarp);
  canvas.bulgePinch = wrap(bulgePinch);
  canvas.tiltShift = wrap(tiltShift);
  canvas.dotScreen = wrap(dotScreen);
  canvas.edgeWork = wrap(edgeWork);
  canvas.lensBlur = wrap(lensBlur);
  canvas.zoomBlur = wrap(zoomBlur);
  canvas.noise = wrap(noise);
  canvas.denoise = wrap(denoise);
  canvas.curves = wrap(curves);
  canvas.swirl = wrap(swirl);
  canvas.ink = wrap(ink);
  canvas.vignette = wrap(vignette);
  canvas.vibrance = wrap(vibrance);
  canvas.sepia = wrap(sepia);
  // New
  canvas.feColorMatrix = wrap(feColorMatrix);
  canvas.blend = wrap(blend);

  return canvas;
}

export { canvas, gl, simpleShader };
