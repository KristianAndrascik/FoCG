// src/app/State.js
/**
 * Application state manager
 * Tracks interaction mode, selected objects, shading mode, etc.
 */
export class State {
  constructor() {
    // Interaction modes
    this.interactionMode = 'shape'; // 'shape', 'light', or 'camera'
    
    // Selected model (0 = all models, 1-9 = specific model)
    this.selectedModelIndex = 0;
    
    // Shading mode
    this.shadingMode = 'diffuse'; // 'diffuse' or 'specular'
    
    // Camera drag state
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    // Transformation increments
    this.rotationStep = 5 * Math.PI / 180; // 5 degrees in radians
    this.translationStep = 0.2;
    this.scaleFactorDecrease = 0.9;
    this.scaleFactorIncrease = 1.1;
  }

  /**
   * Set interaction mode
   */
  setMode(mode) {
    if (['shape', 'light', 'camera'].includes(mode)) {
      this.interactionMode = mode;
      console.log(`Interaction mode: ${mode}`);
    }
  }

  /**
   * Select a model by index (0-9)
   */
  selectModel(index) {
    this.selectedModelIndex = index;
    if (index === 0) {
      console.log('Selected: All models');
    } else {
      console.log(`Selected: Model ${index}`);
    }
  }

  /**
   * Set shading mode
   */
  setShading(mode) {
    if (['diffuse', 'specular'].includes(mode)) {
      this.shadingMode = mode;
      console.log(`Shading mode: ${mode}`);
    }
  }

  /**
   * Check if a specific model is selected
   */
  isModelSelected(index) {
    return this.selectedModelIndex === 0 || this.selectedModelIndex === index;
  }

  /**
   * Get all selected model indices
   */
  getSelectedIndices(totalModels) {
    if (this.selectedModelIndex === 0) {
      // All models
      return Array.from({ length: totalModels }, (_, i) => i);
    } else {
      // Single model (convert 1-based to 0-based)
      return [this.selectedModelIndex - 1];
    }
  }
}
