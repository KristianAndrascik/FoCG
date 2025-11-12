// src/scene/Mesh.js
import { Node } from './Node.js';
import { mat4, vec3 } from '../../node_modules/gl-matrix/esm/index.js';

/**
 * Mesh = Node + geometry + shader program
 * ---------------------------------------
 * For T1, we only need positions and normals.
 * 
 * Responsibilities:
 *  - Create vertex buffers from geometry
 *  - Bind buffers & attributes
 *  - Draw itself with model/view/projection matrices
 */
export class Mesh extends Node {
  constructor({ name = "", geometry, program } = {}) {
    super({ name });
    this.geometry = geometry;
    this.program = program; // WebGLProgram compiled in main.js

    this.vao = null; // for WebGL2, but we’re in WebGL1 so manual binding
    this.buffers = {};
    this.indexCount = 0;
  }

  /**
   * Create VBOs from geometry
   */
  upload(gl) {
    const { vertices, normals, faces } = this.geometry;

    // OBJ files can have separate indices for positions and normals
    // We need to expand the data so each unique vertex/normal combination gets its own index
    const expandedPositions = [];
    const expandedNormals = [];
    const indices = [];

    for (const face of faces) {
      for (const faceVertex of face) {
        const vIdx = faceVertex.vertexIndex;
        const nIdx = faceVertex.normalIndex;
        
        // Add position (default to [0,0,0] if index is invalid)
        if (vIdx >= 0 && vIdx < vertices.length) {
          expandedPositions.push(...vertices[vIdx]);
        } else {
          expandedPositions.push(0, 0, 0);
        }
        
        // Add normal (default to [0,1,0] if index is invalid)
        if (nIdx >= 0 && nIdx < normals.length) {
          expandedNormals.push(...normals[nIdx]);
        } else {
          expandedNormals.push(0, 1, 0);
        }
        
        // Add index
        indices.push(expandedPositions.length / 3 - 1);
      }
    }

    const positions = new Float32Array(expandedPositions);
    const norms = new Float32Array(expandedNormals);
    const indexArray = new Uint16Array(indices);

    this.indexCount = indexArray.length;

    console.log(this.name, 'expanded vertex count:', expandedPositions.length / 3, 'index count:', this.indexCount);

    // --- Position buffer ---
    this.buffers.position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // --- Normal buffer ---
    this.buffers.normal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
    gl.bufferData(gl.ARRAY_BUFFER, norms, gl.STATIC_DRAW);

    // --- Index buffer ---
    this.buffers.index = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

    // Unbind for safety
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  /**
   * Draw the mesh using the provided camera & scene state
   */
  draw(gl, camera, light) {
  if (!this.program) return;
  gl.useProgram(this.program);

  const model = this.getWorldMatrix();
  const view = camera.getViewMatrix();
  const projection = camera.getProjectionMatrix();

  // Uniform locations
  const uModel = gl.getUniformLocation(this.program, "u_model");
  const uView = gl.getUniformLocation(this.program, "u_view");
  const uProjection = gl.getUniformLocation(this.program, "u_projection");

  if (uModel) gl.uniformMatrix4fv(uModel, false, model);
  if (uView) gl.uniformMatrix4fv(uView, false, view);
  if (uProjection) gl.uniformMatrix4fv(uProjection, false, projection);

  // --- Lighting uniforms ---
  if (light) {
    // Transform light position to view space
    const lightPosWorld = light.getWorldPosition();
    const lightPosView = vec3.transformMat4(vec3.create(), lightPosWorld, view);
    
    const uLightPos = gl.getUniformLocation(this.program, "u_lightPos");
    const uLightColor = gl.getUniformLocation(this.program, "u_lightColor");
    
    if (uLightPos) gl.uniform3fv(uLightPos, lightPosView);
    if (uLightColor) gl.uniform3fv(uLightColor, light.getColor());
  }

  // Camera position in view space (always at origin)
  const uViewPos = gl.getUniformLocation(this.program, "u_viewPos");
  if (uViewPos) gl.uniform3fv(uViewPos, [0, 0, 0]);

  // Object base color
  const uObjectColor = gl.getUniformLocation(this.program, "u_objectColor");
  if (uObjectColor) gl.uniform3fv(uObjectColor, [1, 1, 1]);

  // --- Bind attributes ---
  const aPosLoc = gl.getAttribLocation(this.program, "a_position");
  const aNormLoc = gl.getAttribLocation(this.program, "a_normal");


  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
  if (aPosLoc !== -1) {
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 0, 0);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
  if (aNormLoc !== -1) {
    gl.enableVertexAttribArray(aNormLoc);
    gl.vertexAttribPointer(aNormLoc, 3, gl.FLOAT, false, 0, 0);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
  gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
}

}
