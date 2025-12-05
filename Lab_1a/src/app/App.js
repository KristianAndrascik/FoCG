import { ShaderProgram } from "../gl/ShaderProgram.js";
import { initGLContext } from "../gl/GLContext.js";
import { RenderSystem } from "../systems/RenderSystem.js";
import { Scene } from "../scene/Scene.js";
import { Camera } from "../scene/Camera.js";
import { Mesh } from "../scene/Mesh.js";
import { parseOBJ } from "../loaders/objParser.js";
import { Light } from "../scene/Light.js";
import { State } from "./State.js";
import { Keymap } from "./Keymap.js";
import { CoordinateAxes } from "../scene/CoordinateAxes.js";


export class App {
  constructor(canvasId) {
    this.gl = initGLContext(canvasId);
    if (!this.gl) throw new Error("WebGL initialization failed");

    this.scene = null;
    this.camera = null;
    this.shaderPrograms = {}; // Store multiple shader programs
    this.currentShader = null;
    this.renderSystem = null;
    this.state = new State();
    this.keymap = null; // Will initialize after scene is ready
  }

  async init() {
    const gl = this.gl;

    // --- 1. Load all shaders ---
    const [diffuseVS, diffuseFS, specularVS, specularFS, axesVS, axesFS] = await Promise.all([
      fetch("src/shaders/phongDiffuse.vs.glsl").then(r => r.text()),
      fetch("src/shaders/phongDiffuse.fs.glsl").then(r => r.text()),
      fetch("src/shaders/phong.vs.glsl").then(r => r.text()),
      fetch("src/shaders/phong.fs.glsl").then(r => r.text()),
      fetch("src/shaders/axes.vs.glsl").then(r => r.text()),
      fetch("src/shaders/axes.fs.glsl").then(r => r.text()),
    ]);
    
    this.shaderPrograms.diffuse = new ShaderProgram(gl, diffuseVS, diffuseFS);
    this.shaderPrograms.specular = new ShaderProgram(gl, specularVS, specularFS);
    this.shaderPrograms.axes = new ShaderProgram(gl, axesVS, axesFS);
    this.currentShader = this.shaderPrograms.diffuse;

    // --- 2. Create scene + camera + light ---
    this.scene = new Scene();
    this.camera = new Camera({ aspect: gl.canvas.width / gl.canvas.height });
    // Camera on negative Z axis, looking toward positive Z (at origin)
    this.camera.setPosition(0, 0, -8);
    this.camera.lookAt([0, 0, 0]);
    this.scene.setCamera(this.camera);
    
    const light = new Light({ color: [1, 1, 1], intensity: 1.0 });
    light.setPosition(0, 2, -10);
    this.scene.setLight(light);

    // --- 3. Load OBJ geometry and create meshes ---
    const modelPaths = [
      "src/assets/models/cube.obj",
      "src/assets/models/teapot.obj",
      "src/assets/models/bunny.obj",
      "src/assets/models/tetrahedron.obj",
      //"src/assets/models/Rocktopus_Head.obj",
      //"src/assets/models/Rocktopus_Tentacle.obj"
    ];

    // Load geometries once
    const geometries = [];
    for (const path of modelPaths) {
      const text = await (await fetch(path)).text();
      const { vertices, normals, faces } = parseOBJ(text);
      geometries.push({ vertices, normals, faces });
    }

    // Create 9 meshes (3x3 grid) by cycling through the 4 models
    for (let i = 0; i < 9; i++) {
      const geometryIndex = i % 4; // Cycle through the 4 models
      const geometry = geometries[geometryIndex];

      const mesh = new Mesh({
        name: `model_${i}`,
        geometry,
        program: this.currentShader.program,
      });
      mesh.upload(gl);

      // Arrange in 3x3 grid
      const row = Math.floor(i / 3);
      const col = i % 3;
      mesh.setPosition((col - 1) * 3, (1 - row) * 3, 0);

      // Apply model-specific scaling
      if (geometryIndex === 2) { // bunny
        mesh.setScale(10, 10, 10);
      } else if (geometryIndex === 4 || geometryIndex === 5) { // Rocktopus parts
        mesh.setScale(0.01, 0.01, 0.01);
      }

      this.scene.add(mesh);
    }

    // --- 4. Setup coordinate axes ---
    const axes = new CoordinateAxes(gl, 1.0);
    this.scene.setCoordinateAxes(axes, this.shaderPrograms.axes.program);

    // --- 5. Initialize RenderSystem ---
    this.renderSystem = new RenderSystem(gl, this.scene, this.camera);
    
    // --- 6. Setup interaction ---
    this.keymap = new Keymap(this.state, this);
    this.setupMouseInteraction();
    
    // --- 7. Start render loop ---
    this.renderSystem.start();
  }

  /**
   * Switch between diffuse and specular shaders
   */
  setShader(mode) {
    if (mode === 'diffuse' || mode === 'specular') {
      this.currentShader = this.shaderPrograms[mode];
      // Update all mesh programs
      this.scene.nodes.forEach(mesh => {
        mesh.program = this.currentShader.program;
      });
      console.log(`Switched to ${mode} shader`);
    }
  }

  /**
   * Setup mouse drag interaction for camera
   * Mouse drag is INVERSE of arrow key movement:
   * - Dragging left → camera moves RIGHT (scene appears to move left)
   * - Dragging right → camera moves LEFT (scene appears to move right)
   * - Dragging up → camera moves DOWN (scene appears to move up)
   * - Dragging down → camera moves UP (scene appears to move down)
   */
  setupMouseInteraction() {
    const canvas = this.gl.canvas;
    const state = this.state;
    const camera = this.camera;

    canvas.addEventListener('mousedown', (e) => {
      state.isDragging = true;
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!state.isDragging) return;

      const deltaX = e.clientX - state.lastMouseX;
      const deltaY = e.clientY - state.lastMouseY;

      // Mouse drag is INVERSE of arrow keys:
      // - Drag right (positive deltaX) → camera moves LEFT (negative X)
      // - Drag left (negative deltaX) → camera moves RIGHT (positive X)
      // - Drag down (positive deltaY) → camera moves UP (positive Y)
      // - Drag up (negative deltaY) → camera moves DOWN (negative Y)
      const sensitivity = 0.02;
      const pos = camera.position;
      camera.setPosition(
        pos[0] + deltaX * sensitivity,  // Flip: drag left = camera right (positive X)
        pos[1] + deltaY * sensitivity,  // Drag down = camera up (positive Y, screen Y inverted)
        pos[2]
      );

      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
    });

    canvas.addEventListener('mouseup', () => {
      state.isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
      state.isDragging = false;
    });
  }
}
