// src/scene/CoordinateAxes.js
import { mat4 } from '../../node_modules/gl-matrix/esm/index.js';

/**
 * CoordinateAxes - draws RGB axes (X=red, Y=green, Z=blue)
 */
export class CoordinateAxes {
  constructor(gl, length = 1.0) {
    this.length = length;
    this.setupBuffers(gl);
  }

  setupBuffers(gl) {
    const len = this.length;
    
    // Vertices: origin + 3 axis endpoints
    const vertices = new Float32Array([
      // Origin (for all 3 lines)
      0, 0, 0,  // X-axis start
      len, 0, 0, // X-axis end
      0, 0, 0,  // Y-axis start
      0, len, 0, // Y-axis end
      0, 0, 0,  // Z-axis start
      0, 0, len, // Z-axis end
    ]);

    // Colors: R, G, B
    const colors = new Float32Array([
      1, 0, 0,  // X-axis start (red)
      1, 0, 0,  // X-axis end (red)
      0, 1, 0,  // Y-axis start (green)
      0, 1, 0,  // Y-axis end (green)
      0, 0, 1,  // Z-axis start (blue)
      0, 0, 1,  // Z-axis end (blue)
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    this.vertexCount = 6;
  }

  /**
   * Draw the axes
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program - Simple shader with a_position and a_color
   * @param {mat4} modelMatrix - Transformation matrix
   * @param {mat4} viewMatrix
   * @param {mat4} projectionMatrix
   */
  draw(gl, program, modelMatrix, viewMatrix, projectionMatrix) {
    gl.useProgram(program);

    // Set uniforms
    const uModel = gl.getUniformLocation(program, "u_model");
    const uView = gl.getUniformLocation(program, "u_view");
    const uProjection = gl.getUniformLocation(program, "u_projection");

    if (uModel) gl.uniformMatrix4fv(uModel, false, modelMatrix);
    if (uView) gl.uniformMatrix4fv(uView, false, viewMatrix);
    if (uProjection) gl.uniformMatrix4fv(uProjection, false, projectionMatrix);

    // Bind position attribute
    const aPosLoc = gl.getAttribLocation(program, "a_position");
    if (aPosLoc !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.enableVertexAttribArray(aPosLoc);
      gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 0, 0);
    }

    // Bind color attribute
    const aColorLoc = gl.getAttribLocation(program, "a_color");
    if (aColorLoc !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.enableVertexAttribArray(aColorLoc);
      gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 0, 0);
    }

    // Draw lines
    gl.drawArrays(gl.LINES, 0, this.vertexCount);

    // Cleanup
    if (aPosLoc !== -1) gl.disableVertexAttribArray(aPosLoc);
    if (aColorLoc !== -1) gl.disableVertexAttribArray(aColorLoc);
  }
}
