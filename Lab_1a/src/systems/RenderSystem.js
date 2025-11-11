import { ShaderProgram } from '../gl/ShaderProgram.js'; 

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

    this._initGL();
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

    // Draw the entire scene
    this.scene.draw(gl);
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
