// src/scene/Scene.js
import { mat4 } from '../../node_modules/gl-matrix/esm/index.js';

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
    this.coordinateAxes = null;
    this.axesProgram = null;
    this.selectedIndex = -1; // Which model to highlight (-1 = none, 0+ = index)
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

  /**
   * Set coordinate axes helper and shader program
   */
  setCoordinateAxes(axes, program) {
    this.coordinateAxes = axes;
    this.axesProgram = program;
  }

  /**
   * Set which model to highlight (0-based index, -1 for none, null for all)
   */
  setSelectedIndex(index) {
    this.selectedIndex = index;
  }

  update(dt) {
    for (const node of this.nodes) {
      if (typeof node.update === 'function') {
        node.update(dt);
      }
    }
  }

  draw(gl) {
    if (!this.camera) {
      console.warn("Scene.draw(): no active camera");
      return;
    }

    const view = this.camera.getViewMatrix();
    const projection = this.camera.getProjectionMatrix();

    // Recursive draw helper
    const drawNode = (node) => {
      if (typeof node.draw === 'function') {
        node.draw(gl, this.camera, this.light);
      }
      for (const child of node.children) {
        drawNode(child);
      }
    };

    // Draw all meshes
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      drawNode(node);

      // Draw local coordinate system for selected model(s)
      if (this.coordinateAxes && this.axesProgram) {
        const shouldDrawAxes = 
          (this.selectedIndex === null) || // All selected (0 key)
          (this.selectedIndex === i);       // This specific model selected
        
        if (shouldDrawAxes) {
          const modelMatrix = node.getWorldMatrix();
          this.coordinateAxes.draw(gl, this.axesProgram, modelMatrix, view, projection);
        }
      }
    }

    // Draw global coordinate system (always visible)
    if (this.coordinateAxes && this.axesProgram) {
      const globalMatrix = mat4.create(); // Identity matrix
      mat4.scale(globalMatrix, globalMatrix, [2, 2, 2]); // Make global axes bigger
      this.coordinateAxes.draw(gl, this.axesProgram, globalMatrix, view, projection);
    }
  }

  drawShadows(gl, shadowMatrix, shadowProgram) {
    if (!this.camera) return;

    const drawNodeShadow = (node) => {
      if (!node.castShadow) return; // Skip if shadow casting is disabled

      if (typeof node.drawShadow === 'function') {
        node.drawShadow(gl, shadowMatrix, shadowProgram, this.camera);
      }
      if (node.children) {
        node.children.forEach(child => {
          drawNodeShadow(child);
        });
      }
    };

    this.nodes.forEach(node => {
      drawNodeShadow(node);
    });
  }
}

