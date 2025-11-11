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

    // Flatten data
    const positions = new Float32Array(vertices.flat());
    const norms = new Float32Array(normals.flat());
    
    // Extract vertex indices from face objects
    const indexArray = faces.flat().map(faceVertex => faceVertex.vertexIndex);
    const indices = new Uint16Array(indexArray);

    this.indexCount = indices.length;

    // Find min/max without spreading large arrays (avoid stack overflow)
    let maxIndex = -Infinity;
    let minIndex = Infinity;
    for (let i = 0; i < indices.length; i++) {
      if (indices[i] > maxIndex) maxIndex = indices[i];
      if (indices[i] < minIndex) minIndex = indices[i];
    }
    console.log(this.name, 'index range', minIndex, maxIndex, 'vertex count', vertices.length);

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
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    console.log(this.name, 'first normals', normals.slice(0, 5));

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
    const lightPosWorld = light.getWorldPosition();
    const lightPosView = vec3.transformMat4(vec3.create(), lightPosWorld, view);
    const uLightPos = gl.getUniformLocation(this.program, "u_lightPos");
    const uLightColor = gl.getUniformLocation(this.program, "u_lightColor");
    if (uLightPos) gl.uniform3fv(uLightPos, lightPosView);
    if (uLightColor) gl.uniform3fv(uLightColor, light.getColor());
  }

  const uObjectColor = gl.getUniformLocation(this.program, "u_objectColor");
  if (uObjectColor) gl.uniform3fv(uObjectColor, [1, 1, 1]); // white base

  // Attributes as before
  const aPosLoc = gl.getAttribLocation(this.program, "a_position");
  const aNormLoc = gl.getAttribLocation(this.program, "a_normal");

  

  if (this.name === 'model_0') {
  console.log('DEBUG model_0:');
  console.log('  model', Array.from(model));
  console.log('  view', Array.from(view));
  console.log('  projection', Array.from(projection));
  console.log('  vertex count:', this.geometry.vertices.length);
  console.log('  first 3 vertices:', this.geometry.vertices.slice(0, 3));
  console.log('  indexCount:', this.indexCount);
  
  // Test manual MVP calculation
  const mvp = mat4.create();
  mat4.multiply(mvp, projection, view);
  mat4.multiply(mvp, mvp, model);
  console.log('  mvp', Array.from(mvp));
  
  // Transform first vertex to clip space (with w component)
  const v0 = this.geometry.vertices[0];
  const v0_homo = [v0[0], v0[1], v0[2], 1.0];
  const v0_clip = [0, 0, 0, 0];
  
  // Manual matrix-vector multiply to get homogeneous coords
  for (let i = 0; i < 4; i++) {
    v0_clip[i] = mvp[i] * v0_homo[0] + mvp[i+4] * v0_homo[1] + 
                 mvp[i+8] * v0_homo[2] + mvp[i+12] * v0_homo[3];
  }
  
  console.log('  first vertex:', v0);
  console.log('  in clip space (homogeneous):', v0_clip);
  console.log('  after perspective divide:', [v0_clip[0]/v0_clip[3], v0_clip[1]/v0_clip[3], v0_clip[2]/v0_clip[3]]);
  console.log('  w component:', v0_clip[3]);
}


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
