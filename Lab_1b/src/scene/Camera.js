import { mat4, vec3 } from '../../node_modules/gl-matrix/esm/index.js';
import { Node } from './Node.js';

/**
 * Camera node
 * --------------------------------------------
 * Extends Node to provide:
 *  - Perspective projection
 *  - View matrix (inverse of world transform)
 *  - lookAt() helper
 *
 * Right-handed coordinate system:
 *   +X → right, +Y → up, camera looks along -Z.
 */
export class Camera extends Node {
  constructor({
    fovY = 60 * Math.PI / 180,
    aspect = 1,
    near = 0.1,
    far = 1000
  } = {}) {
    super({ name: "Camera" });

    this.fovY = fovY;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.isShear = false;
  }

  toggleShear() {
    this.isShear = !this.isShear;
    console.log("Shear view:", this.isShear);
  }

  // ------------------------------
  // Projection
  // ------------------------------
  setPerspective({ fovY, aspect, near, far }) {
    if (fovY !== undefined) this.fovY = fovY;
    if (aspect !== undefined) this.aspect = aspect;
    if (near !== undefined) this.near = near;
    if (far !== undefined) this.far = far;
  }

  getProjectionMatrix() {
    const proj = mat4.create();

    if (this.isShear) {
      // Oblique Projection (Parallel projection + Shear)
      // To keep the scale roughly similar to the perspective view,
      // we calculate the orthographic bounds at a reference distance.
      const distance = 10.0; // Approximate distance to the center of the scene
      const height = 2 * distance * Math.tan(this.fovY / 2);
      const width = height * this.aspect;
      
      const halfH = height / 2;
      const halfW = width / 2;

      // 2. Shear matrix
      // Modifies the projection rays to be oblique
      const shear = mat4.create();
      // Shear X and Y based on Z
      // Negative values shift back (negative Z) to Right (+X) and Up (+Y)
      // This simulates looking from Top-Right
      const shx = -0.5;
      const shy = -0.5;
      shear[8] = shx; 
      shear[9] = shy; 

      // Compensate for shear shift at the focus distance
      // so the center of the view remains fixed
      const offsetX = shx * (-distance);
      const offsetY = shy * (-distance);

      // 1. Orthographic projection with offset
      mat4.ortho(proj, -halfW + offsetX, halfW + offsetX, -halfH + offsetY, halfH + offsetY, this.near, this.far);
      
      mat4.multiply(proj, proj, shear);
    } else {
      mat4.perspective(proj, this.fovY, this.aspect, this.near, this.far);
    }

    return proj;
  }

  // ------------------------------
  // View
  // ------------------------------
  getViewMatrix() {
    // view = inverse(world)
    const world = this.getWorldMatrix();
    const view = mat4.create();
    mat4.invert(view, world);
    return view;
  }

  // ------------------------------
  // Orientation helper
  // ------------------------------
  /**
   * Sets camera rotation so that it looks at a target point.
   * Keeps current position; updates rotation.
   */
  lookAt(target, up = [0, 1, 0]) {
    const eye = this.getWorldPosition();  // current camera position
    const m = mat4.create();
    mat4.lookAt(m, eye, target, up);

    // gl-matrix lookAt() returns a *view* matrix (inverse of camera transform)
    // To get the camera's *world rotation*, we invert that matrix.
    mat4.invert(m, m);

    // Extract Euler angles from the rotation part of m
    // We'll use XYZ extraction for consistency.
    const sy = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
    let x, y, z;
    if (sy > 1e-6) {
      x = Math.atan2(m[6], m[10]);
      y = Math.atan2(-m[2], sy);
      z = Math.atan2(m[1], m[0]);
    } else {
      // Gimbal lock
      x = Math.atan2(-m[9], m[5]);
      y = Math.atan2(-m[2], sy);
      z = 0;
    }

    this.setRotationEuler(x, y, z);
  }
}
