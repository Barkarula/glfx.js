/*
 * glfx.js
 * http://evanw.github.com/glfx.js/
 *
 * Copyright 2011 Evan Wallace
 * Released under the MIT license
 */

import "./OES_texture_float_linear-polyfill";
import { canvas } from "./core/canvas";

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  if (!window.fx) {
    window.fx = { canvas };
  }
}

export default { canvas };
