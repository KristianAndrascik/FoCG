import { ShaderProgram } from '../gl/ShaderProgram.js'; 
import { mat4 } from '../../node_modules/gl-matrix/esm/index.js';

/**
 * RenderSystem
 * ------------
 * Manages the frame rendering loop for the Scene/Camera/Mesh structure.
 * It expects each Mesh to have a .program property that is an instance of ShaderProgram.
 */
export class RenderSystem {
  /**
   * @param {WebGLRenderingContext} gl
   * @param {Scene} scene
   * @param {Camera} camera
   * @param {{clearColor?: [number,number,number,number]}} [opts]
   */
  constructor(gl, scene, camera, opts = {}) {
    this.gl = gl;
    this.scene = scene;
    this.camera = camera;

    this.clearColor = opts.clearColor ?? [0.05, 0.05, 0.08, 1];

    // Time tracking for animation loop
    this._running = false;
    this._lastTime = 0;
    this.shadowProgram = null;

    this._initGL();
  }

  setShadowProgram(program) {
    this.shadowProgram = program;
  }

  // -------------------------------
  // Initialization
  // -------------------------------
  _initGL() {
    const gl = this.gl;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    

    const [r, g, b, a] = this.clearColor;
    gl.clearColor(r, g, b, a);
  }

  /**
   * Adjusts viewport and camera aspect ratio to canvas size.
   */
  resize() {
    const gl = this.gl;

    // Match canvas size to display size (useful for HiDPI screens)
    const dpr = window.devicePixelRatio || 1;
    const displayW = Math.floor(gl.canvas.clientWidth * dpr);
    const displayH = Math.floor(gl.canvas.clientHeight * dpr);

    if (gl.canvas.width !== displayW || gl.canvas.height !== displayH) {
      gl.canvas.width = displayW;
      gl.canvas.height = displayH;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.camera.setPerspective({ aspect });
  }

  // -------------------------------
  // Rendering
  // -------------------------------
  drawFrame(deltaMs = 0) {
    const gl = this.gl;

    // Clear buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update viewport and camera aspect
    this.resize();

    // Update scene logic
    if (this.scene && typeof this.scene.update === 'function') {
      this.scene.update(deltaMs / 1000.0); // Pass seconds
    }

    // Update camera follow logic if app has it
    // We need access to app here, or pass a callback
    // For now, let's assume the scene update handles it or we hook it up differently.
    // Actually, let's just add a callback or event.
    // But simpler: if we have a reference to app update.
    
    // Better: The App class should probably drive the update loop or be called by it.
    // But RenderSystem is currently driving.
    if (this.onUpdate) {
        this.onUpdate(deltaMs);
    }

    // Draw the entire scene
    this.scene.draw(gl);

    // Draw shadows
    if (this.shadowProgram) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false); // Don't write to depth buffer for shadows
      gl.disable(gl.CULL_FACE); // Draw both sides of the shadow
      
      // Shadow Matrix Calculation
      // Use scene light position
      let Lx = 0, Ly = 10, Lz = 0;
      if (this.scene.light) {
          const pos = this.scene.light.getWorldPosition();
          Lx = pos[0];
          Ly = pos[1];
          Lz = pos[2];
      }
      
      // Ground plane is at y = -4. We project slightly above it to avoid z-fighting.
      const planeY = -3.99; 
      const A=0, B=1, C=0, D = -planeY; // Plane equation: y + D = 0 => y = -D = planeY
      
      const dot = A*Lx + B*Ly + C*Lz + D*1; // Lw=1
      
      const shadowMatrix = mat4.create();
      
      // M = Dot * I - L * Plane
      // Note: gl-matrix is column-major.
      // Indexing: m[col * 4 + row]
      
      // Col 0
      shadowMatrix[0] = dot - Lx * A;
      shadowMatrix[1] = -Ly * A;
      shadowMatrix[2] = -Lz * A;
      shadowMatrix[3] = -1 * A;
      
      // Col 1
      shadowMatrix[4] = -Lx * B;
      shadowMatrix[5] = dot - Ly * B;
      shadowMatrix[6] = -Lz * B;
      shadowMatrix[7] = -1 * B;
      
      // Col 2
      shadowMatrix[8] = -Lx * C;
      shadowMatrix[9] = -Ly * C;
      shadowMatrix[10] = dot - Lz * C;
      shadowMatrix[11] = -1 * C;
      
      // Col 3
      shadowMatrix[12] = -Lx * D;
      shadowMatrix[13] = -Ly * D;
      shadowMatrix[14] = -Lz * D;
      shadowMatrix[15] = dot - 1 * D;
      
      this.scene.drawShadows(gl, shadowMatrix, this.shadowProgram);
      
      gl.disable(gl.BLEND);
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
    }
  }

  // -------------------------------
  // Animation Loop
  // -------------------------------
  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();

    const tick = (now) => {
      if (!this._running) return;
      const delta = now - this._lastTime;
      this._lastTime = now;

      this.drawFrame(delta);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  stop() {
    this._running = false;
  }
}
