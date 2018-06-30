/**
 * @filter           feColorMatrix
 * @description      ...
 * @param matrix     ...
 */

import { simpleShader, gl } from "../../core/canvas";
import { Shader } from "../../core/shader";

function feColorMatrix(matrix) {
  gl.feColorMatrix =
    gl.feColorMatrix ||
    new Shader(
      null,
      `
        uniform sampler2D texture;
      	uniform mat4 matrix;
      	uniform vec4 multiplier;
        varying vec2 texCoord;
        
      	void main() {
      	  vec4 color = texture2D(texture, texCoord);
      	  mat4 colMat = mat4(
        		color.r, 0, 0, 0,
        		0, color.g, 0, 0,
        		0, 0, color.b, 0,
        		0, 0, 0, color.a
          );
      	  mat4 product = colMat * matrix;
      	  color.r = product[0].x + product[0].y + product[0].z + product[0].w + multiplier[0];
      	  color.g = product[1].x + product[1].y + product[1].z + product[1].w + multiplier[1];
      	  color.b = product[2].x + product[2].y + product[2].z + product[2].w + multiplier[2];
      	  color.a = product[3].x + product[3].y + product[3].z + product[3].w + multiplier[3];
      	  gl_FragColor = color;
      	}
    `
    );

  var multiplier = [];
  matrix = typeof matrix === "string" ? matrix.split(" ") : matrix;
  multiplier.push(matrix.splice(3, 1)[0]);
  multiplier.push(matrix.splice(8, 1)[0]);
  multiplier.push(matrix.splice(12, 1)[0]);
  multiplier.push(matrix.splice(16, 1)[0]);
  simpleShader.call(this, gl.feColorMatrix, {
    matrix: matrix,
    multiplier: multiplier
  });

  return this;
}

export { feColorMatrix };
