// src/systems/RenderSystem.js
import { mat4 } from '../../node_modules/gl-matrix/esm/index.js';

export class RenderSystem {
  constructor(gl, shaderProgram) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.buffers = this._initBuffers();
    this.rotation = 0; // cube rotation angle
  }

  _initBuffers() {
    const gl = this.gl;

    // --- 1. Cube vertex positions ---
    const positions = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,
    ];

    // --- 2. Colors per face ---
    const faceColors = [
      [1.0,  0.0,  0.0,  1.0], // Front: red
      [0.0,  1.0,  0.0,  1.0], // Back: green
      [0.0,  0.0,  1.0,  1.0], // Top: blue
      [1.0,  1.0,  0.0,  1.0], // Bottom: yellow
      [1.0,  0.0,  1.0,  1.0], // Right: magenta
      [0.0,  1.0,  1.0,  1.0], // Left: cyan
    ];

    let colors = [];
    for (const c of faceColors) {
      colors = colors.concat(c, c, c, c);
    }

    // --- 3. Indices for 12 triangles ---
    const indices = [
      0, 1, 2,   0, 2, 3,     // front
      4, 5, 6,   4, 6, 7,     // back
      3, 2, 6,   3, 6, 5,     // top
      4, 7, 1,   4, 1, 0,     // bottom
      1, 7, 6,   1, 6, 2,     // right
      4, 0, 3,   4, 3, 5,     // left
    ];

    // --- Create buffers ---
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      color: colorBuffer,
      indices: indexBuffer,
      vertexCount: indices.length,
    };
  }

  drawScene(deltaTime = 0) {
    const gl = this.gl;
    const shader = this.shaderProgram;
    const buffers = this.buffers;

    // --- GL setup ---
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- Matrices ---
    const projectionMatrix = mat4.create();
    const modelViewMatrix = mat4.create();

    const fov = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    mat4.perspective(projectionMatrix, fov, aspect, 0.1, 100.0);
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

    // rotate cube over time
    this.rotation += deltaTime * 0.001;
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation, [0, 1, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation * 0.7, [1, 0, 0]);

    // --- Activate shader ---
    shader.use();
    const glProgram = shader.program;

    // --- Attributes ---
    const vertexPosLoc = gl.getAttribLocation(glProgram, "aVertexPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(vertexPosLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosLoc);

    const vertexColorLoc = gl.getAttribLocation(glProgram, "aVertexColor");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(vertexColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexColorLoc);

    // --- Indices ---
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // --- Uniforms ---
    const uProjection = gl.getUniformLocation(glProgram, "uProjectionMatrix");
    const uModelView = gl.getUniformLocation(glProgram, "uModelViewMatrix");
    gl.uniformMatrix4fv(uProjection, false, projectionMatrix);
    gl.uniformMatrix4fv(uModelView, false, modelViewMatrix);

    // --- Draw ---
    gl.drawElements(gl.TRIANGLES, buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
  }
}
