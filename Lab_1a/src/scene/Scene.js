// src/scene/Scene.js
/**
 * Simple scene manager
 * --------------------
 * For T1, it holds:
 *   - an array of root nodes (typically Meshes)
 *   - one active Camera
 * 
 * It draws all meshes by calling their draw() with the camera.
 */
export class Scene {
  constructor() {
    this.nodes = [];
    this.camera = null;        
    this.light = null;
  }

  add(node) {
    this.nodes.push(node);
    return node;
  }

  remove(node) {
    const i = this.nodes.indexOf(node);
    if (i !== -1) this.nodes.splice(i, 1);
  }

  setCamera(camera) {
    this.camera = camera;
  }

  
  setLight(light) {
    this.light = light;
  }

  draw(gl) {
    if (!this.camera) {
      console.warn("Scene.draw(): no active camera");
      return;
    }

    const cameraView = this.camera.getViewMatrix();

    for (const node of this.nodes) {
      if (typeof node.draw === 'function') {
        // Pass light + camera to mesh.draw()
        node.draw(gl, this.camera, this.light);
      }

      for (const child of node.children) {
        if (typeof child.draw === 'function') {
          child.draw(gl, this.camera, this.light);
        }
      }
    }
  }
}

