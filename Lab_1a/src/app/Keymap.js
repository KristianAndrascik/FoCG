// src/app/Keymap.js
/**
 * Keyboard input handler
 * Maps keys to actions based on current interaction mode
 */
export class Keymap {
  constructor(state, app) {
    this.state = state;
    this.app = app;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  handleKeyDown(event) {
    const key = event.key;
    const state = this.state;
    const app = this.app;

    // ============================================
    // Mode selection and shading
    // ============================================
    
    // Model selection (0-9)
    if (key >= '0' && key <= '9') {
      const index = parseInt(key);
      state.selectModel(index);
      // Update scene visualization
      if (index === 0) {
        app.scene.setSelectedIndex(null); // Show all axes
      } else {
        app.scene.setSelectedIndex(index - 1); // Convert 1-based to 0-based
      }
      return;
    }

    // Shading mode selection
    if (key === 'r') {
      state.setShading('diffuse');
      app.setShader('diffuse');
      return;
    }
    if (key === 't') {
      state.setShading('specular');
      app.setShader('specular');
      return;
    }

    // Toggle light interaction mode
    if (key === 'L') {
      state.setMode(state.interactionMode === 'light' ? 'shape' : 'light');
      return;
    }

    // Toggle camera mode
    if (key === ' ') {
      event.preventDefault();
      state.setMode(state.interactionMode === 'camera' ? 'shape' : 'camera');
      return;
    }

    // ============================================
    // Transformations based on mode
    // ============================================

    if (state.interactionMode === 'shape') {
      this.handleShapeTransform(key);
    } else if (state.interactionMode === 'light') {
      this.handleLightTransform(key);
    } else if (state.interactionMode === 'camera') {
      this.handleCameraTransform(key);
    }
  }

  handleShapeTransform(key) {
    const indices = this.state.getSelectedIndices(this.app.scene.nodes.length);
    const step = this.state.rotationStep;
    const trans = this.state.translationStep;

    // Rotations
    if (key === 'i') {
      indices.forEach(i => this.app.scene.nodes[i].rotateLocalEuler(step, 0, 0));
    } else if (key === 'k') {
      indices.forEach(i => this.app.scene.nodes[i].rotateLocalEuler(-step, 0, 0));
    } else if (key === 'o') {
      indices.forEach(i => this.app.scene.nodes[i].rotateLocalEuler(0, step, 0));
    } else if (key === 'u') {
      indices.forEach(i => this.app.scene.nodes[i].rotateLocalEuler(0, -step, 0));
    } else if (key === 'l') {
      indices.forEach(i => this.app.scene.nodes[i].rotateLocalEuler(0, 0, step));
    } else if (key === 'j') {
      indices.forEach(i => this.app.scene.nodes[i].rotateLocalEuler(0, 0, -step));
    }

    // Translations (arrow keys and comma/period)
    else if (key === 'ArrowRight') {
      indices.forEach(i => {
        const pos = this.app.scene.nodes[i].position;
        this.app.scene.nodes[i].setPosition(pos[0] + trans, pos[1], pos[2]);
      });
    } else if (key === 'ArrowLeft') {
      indices.forEach(i => {
        const pos = this.app.scene.nodes[i].position;
        this.app.scene.nodes[i].setPosition(pos[0] - trans, pos[1], pos[2]);
      });
    } else if (key === 'ArrowUp') {
      indices.forEach(i => {
        const pos = this.app.scene.nodes[i].position;
        this.app.scene.nodes[i].setPosition(pos[0], pos[1] + trans, pos[2]);
      });
    } else if (key === 'ArrowDown') {
      indices.forEach(i => {
        const pos = this.app.scene.nodes[i].position;
        this.app.scene.nodes[i].setPosition(pos[0], pos[1] - trans, pos[2]);
      });
    } else if (key === ',') {
      indices.forEach(i => {
        const pos = this.app.scene.nodes[i].position;
        this.app.scene.nodes[i].setPosition(pos[0], pos[1], pos[2] + trans);
      });
    } else if (key === '.') {
      indices.forEach(i => {
        const pos = this.app.scene.nodes[i].position;
        this.app.scene.nodes[i].setPosition(pos[0], pos[1], pos[2] - trans);
      });
    }

    // Scaling
    else if (key === 'a') {
      const factor = this.state.scaleFactorDecrease;
      indices.forEach(i => {
        const s = this.app.scene.nodes[i].scale;
        this.app.scene.nodes[i].setScale(s[0] * factor, s[1], s[2]);
      });
    } else if (key === 'A') {
      const factor = this.state.scaleFactorIncrease;
      indices.forEach(i => {
        const s = this.app.scene.nodes[i].scale;
        this.app.scene.nodes[i].setScale(s[0] * factor, s[1], s[2]);
      });
    } else if (key === 'b') {
      const factor = this.state.scaleFactorDecrease;
      indices.forEach(i => {
        const s = this.app.scene.nodes[i].scale;
        this.app.scene.nodes[i].setScale(s[0], s[1] * factor, s[2]);
      });
    } else if (key === 'B') {
      const factor = this.state.scaleFactorIncrease;
      indices.forEach(i => {
        const s = this.app.scene.nodes[i].scale;
        this.app.scene.nodes[i].setScale(s[0], s[1] * factor, s[2]);
      });
    } else if (key === 'c') {
      const factor = this.state.scaleFactorDecrease;
      indices.forEach(i => {
        const s = this.app.scene.nodes[i].scale;
        this.app.scene.nodes[i].setScale(s[0], s[1], s[2] * factor);
      });
    } else if (key === 'C') {
      const factor = this.state.scaleFactorIncrease;
      indices.forEach(i => {
        const s = this.app.scene.nodes[i].scale;
        this.app.scene.nodes[i].setScale(s[0], s[1], s[2] * factor);
      });
    }
  }

  handleLightTransform(key) {
    const light = this.app.scene.light;
    if (!light) return;

    const step = this.state.rotationStep;
    const trans = this.state.translationStep;

    // Rotations (for light)
    if (key === 'i') {
      light.rotateLocalEuler(step, 0, 0);
    } else if (key === 'k') {
      light.rotateLocalEuler(-step, 0, 0);
    } else if (key === 'o') {
      light.rotateLocalEuler(0, step, 0);
    } else if (key === 'u') {
      light.rotateLocalEuler(0, -step, 0);
    } else if (key === 'l') {
      light.rotateLocalEuler(0, 0, step);
    } else if (key === 'j') {
      light.rotateLocalEuler(0, 0, -step);
    }

    // Translations
    else if (key === 'ArrowRight') {
      const pos = light.position;
      light.setPosition(pos[0] + trans, pos[1], pos[2]);
    } else if (key === 'ArrowLeft') {
      const pos = light.position;
      light.setPosition(pos[0] - trans, pos[1], pos[2]);
    } else if (key === 'ArrowUp') {
      const pos = light.position;
      light.setPosition(pos[0], pos[1] + trans, pos[2]);
    } else if (key === 'ArrowDown') {
      const pos = light.position;
      light.setPosition(pos[0], pos[1] - trans, pos[2]);
    } else if (key === ',') {
      const pos = light.position;
      light.setPosition(pos[0], pos[1], pos[2] + trans);
    } else if (key === '.') {
      const pos = light.position;
      light.setPosition(pos[0], pos[1], pos[2] - trans);
    }
  }

  handleCameraTransform(key) {
    const camera = this.app.camera;
    if (!camera) return;

    const trans = this.state.translationStep;

    // Camera translations
    if (key === 'ArrowRight') {
      const pos = camera.position;
      camera.setPosition(pos[0] + trans, pos[1], pos[2]);
    } else if (key === 'ArrowLeft') {
      const pos = camera.position;
      camera.setPosition(pos[0] - trans, pos[1], pos[2]);
    } else if (key === 'ArrowUp') {
      const pos = camera.position;
      camera.setPosition(pos[0], pos[1] + trans, pos[2]);
    } else if (key === 'ArrowDown') {
      const pos = camera.position;
      camera.setPosition(pos[0], pos[1] - trans, pos[2]);
    }
  }
}
