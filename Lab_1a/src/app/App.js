import { ShaderProgram } from "../gl/ShaderProgram.js";
import { initGLContext } from "../gl/GLContext.js";
import { RenderSystem } from "../systems/RenderSystem.js";
import { Scene } from "../scene/Scene.js";
import { Camera } from "../scene/Camera.js";
import { Mesh } from "../scene/Mesh.js";
import { parseOBJ } from "../loaders/objParser.js";
import { Light } from "../scene/Light.js";


export class App {
  constructor(canvasId) {
    this.gl = initGLContext(canvasId);
    if (!this.gl) throw new Error("WebGL initialization failed");

    this.scene = null;
    this.camera = null;
    this.shaderProgram = null;
    this.renderSystem = null;
  }

  async init() {
    const gl = this.gl;

    // --- 1. Create shader program ---
    // Use naming consistent with our Mesh.draw() implementation
    const vsSource = `
      attribute vec3 a_position;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
varying vec3 v_color;

void main() {
  vec4 clip = u_projection * u_view * u_model * vec4(a_position, 1.0);
  gl_Position = clip;
  v_color = clip.xyz / clip.w; // will show if it's inside [-1,1]
}

    `;

    const fsSource = `
      precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(abs(v_color), 1.0);
}
    `;

    this.shaderProgram = new ShaderProgram(gl, vsSource, fsSource);

    // --- 2. Create scene + camera + light ---
    this.scene = new Scene();
    this.camera = new Camera({ aspect: gl.canvas.width / gl.canvas.height });
    // Camera on negative Z axis, looking toward positive Z (at origin)
    this.camera.setPosition(0, 0, -8);
    this.camera.lookAt([0, 0, 0]);
    this.scene.setCamera(this.camera);
    
    const light = new Light({ color: [1, 1, 1], intensity: 1.0 });
    light.setPosition(0, 10, 0);
    this.scene.setLight(light);

    // --- 3. Load OBJ geometry and create meshes ---
    const modelPaths = [
      "src/assets/models/cube.obj",
      "src/assets/models/teapot.obj",
      "src/assets/models/bunny.obj",
      "src/assets/models/tetrahedron.obj",
      "src/assets/models/Rocktopus_Head.obj",
      "src/assets/models/Rocktopus_Tentacle.obj"
    ];

    // Load geometries once
    const geometries = [];
    for (const path of modelPaths) {
      const text = await (await fetch(path)).text();
      const { vertices, normals, faces } = parseOBJ(text);
      geometries.push({ vertices, normals, faces });
    }

    // Create 9 meshes (3x3 grid) by cycling through the 6 models
    for (let i = 0; i < 9; i++) {
      const geometryIndex = i % 6; // Cycle through the 6 models
      const geometry = geometries[geometryIndex];

      const mesh = new Mesh({
        name: `model_${i}`,
        geometry,
        program: this.shaderProgram.program,
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

    // Optionally position or rotate the mesh

    // --- 4. Initialize RenderSystem ---
    this.renderSystem = new RenderSystem(gl, this.scene, this.camera);
    const locPosition = gl.getAttribLocation(
      this.shaderProgram.program,
      "a_position"
    );
    const locNormal = gl.getAttribLocation(
      this.shaderProgram.program,
      "a_normal"
    );
    console.log("attrib locations:", { locPosition, locNormal });
    
    // --- 5. Start render loop ---
    this.renderSystem.start();
  }
}
