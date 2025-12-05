import { mat4, mat3, vec3 } from '../../node_modules/gl-matrix/esm/index.js';

/**
 * Base scene graph node (no caching)
 * ---------------------------------------------------
 * Each node has its own local transform: position, rotation (Euler XYZ), scale.
 * World transform = parent's world * local.
 * 
 * Conventions:
 * - Right-handed coordinate system (OpenGL style)
 * - M = T * R * S (scale first, then rotate, then translate)
 * - Rotation order: X → Y → Z
 * - Angles are in radians
 */
export class Node {
  constructor({ name = "" } = {}) {
    this.name = name;

    // Local transform
    this.position = vec3.fromValues(0, 0, 0);
    this.rotation = vec3.fromValues(0, 0, 0); // Euler angles (radians)
    this.scale    = vec3.fromValues(1, 1, 1);

    // Hierarchy
    this.parent = null;
    this.children = [];
  }

  // --------------------------
  // Hierarchy
  // --------------------------
  addChild(node) {
    if (node.parent) node.parent.removeChild(node);
    this.children.push(node);
    node.parent = this;
  }

  removeChild(node) {
    const i = this.children.indexOf(node);
    if (i !== -1) {
      this.children.splice(i, 1);
      node.parent = null;
    }
  }

  setParent(node) {
    if (this.parent === node) return;
    if (this.parent) this.parent.removeChild(this);
    if (node) node.addChild(this);
  }

  // --------------------------
  // Local transform setters
  // --------------------------
  setPosition(x, y, z) {
    vec3.set(this.position, x, y, z);
  }

  setRotationEuler(rx, ry, rz) {
    vec3.set(this.rotation, rx, ry, rz);
  }

  setScale(sx, sy, sz) {
    vec3.set(this.scale, sx, sy, sz);
  }

  translateLocal(dx, dy, dz) {
    // Moves along the node's local axes
    const rotMat = mat3.create();
    const rot4 = mat4.create();
    mat4.identity(rot4);
    mat4.rotateX(rot4, rot4, this.rotation[0]);
    mat4.rotateY(rot4, rot4, this.rotation[1]);
    mat4.rotateZ(rot4, rot4, this.rotation[2]);
    mat3.fromMat4(rotMat, rot4);

    const delta = vec3.fromValues(dx, dy, dz);
    vec3.transformMat3(delta, delta, rotMat);
    vec3.add(this.position, this.position, delta);
  }

  rotateLocalEuler(drx, dry, drz) {
    this.rotation[0] += drx;
    this.rotation[1] += dry;
    this.rotation[2] += drz;
  }

  scaleLocal(sx, sy, sz) {
    this.scale[0] *= sx;
    this.scale[1] *= sy;
    this.scale[2] *= sz;
  }

  // --------------------------
  // Matrix computations
  // --------------------------
  getLocalMatrix() {
  const m = mat4.create();
  const { position, rotation, scale } = this;

  mat4.identity(m);

  // Build transformation matrix: M = T * R * S
  // gl-matrix uses post-multiplication: mat4.op(out, a, b) computes out = a * op(b)
  // So we apply operations in this sequence to get T * R * S:
  mat4.translate(m, m, position);  // m = T
  mat4.rotateX(m, m, rotation[0]); // m = T * Rx
  mat4.rotateY(m, m, rotation[1]); // m = T * Rx * Ry
  mat4.rotateZ(m, m, rotation[2]); // m = T * Rx * Ry * Rz
  mat4.scale(m, m, scale);         // m = T * R * S

  return m;
}


 getWorldMatrix() {
  const local = this.getLocalMatrix();
  if (this.parent) {
    const parentWorld = this.parent.getWorldMatrix();
    const world = mat4.create();
    mat4.multiply(world, parentWorld, local); // ✅ parent * local
    return world;
  } else {
    return local;
  }
}



  getWorldPosition(out = vec3.create()) {
    const wm = this.getWorldMatrix();
    out[0] = wm[12];
    out[1] = wm[13];
    out[2] = wm[14];
    return out;
  }
}
