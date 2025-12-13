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
import { Ground } from "../scene/Ground.js";
import { MazeWall } from "../scene/MazeWall.js";
import { LevelParser } from "../loaders/LevelParser.js";
import { Pacman } from "../scene/Pacman.js";
import { Dot } from "../scene/Dot.js";
import { Ghost } from "../scene/Ghost.js";


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
    this.ball = null; // The player ball
    this.dots = []; // Array to store active dots
    this.ghosts = []; // Array to store ghosts
    
    // Game State
    this.isFrozen = false;
    this.freezeTime = 0;
    this.powerModeTime = 0;

    // Movement state
    this.moveDir = { x: 0, z: 0 };
    this.nextDir = { x: 0, z: 0 };
    this.speed = 4.0; // Units per second
    
    // Jump state
    this.isJumping = false;
    this.jumpTime = 0;

    // Bind resize handler
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const canvas = this.gl.canvas;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      this.gl.viewport(0, 0, canvas.width, canvas.height);
      if (this.camera) {
        this.camera.setPerspective({ aspect: canvas.width / canvas.height });
      }
    }
  }

  async init() {
    const gl = this.gl;
    
    // Initial resize
    this.resize();

    // --- 1. Load all shaders ---
    const [diffuseVS, diffuseFS, specularVS, specularFS, axesVS, axesFS, solidVS, solidFS] = await Promise.all([
      fetch("src/shaders/phongDiffuse.vs.glsl").then(r => r.text()),
      fetch("src/shaders/phongDiffuse.fs.glsl").then(r => r.text()),
      fetch("src/shaders/phong.vs.glsl").then(r => r.text()),
      fetch("src/shaders/phong.fs.glsl").then(r => r.text()),
      fetch("src/shaders/axes.vs.glsl").then(r => r.text()),
      fetch("src/shaders/axes.fs.glsl").then(r => r.text()),
      fetch("src/shaders/solid.vs.glsl").then(r => r.text()),
      fetch("src/shaders/solid.fs.glsl").then(r => r.text()),
    ]);
    
    this.shaderPrograms.diffuse = new ShaderProgram(gl, diffuseVS, diffuseFS);
    this.shaderPrograms.specular = new ShaderProgram(gl, specularVS, specularFS);
    this.shaderPrograms.axes = new ShaderProgram(gl, axesVS, axesFS);
    this.shaderPrograms.shadow = new ShaderProgram(gl, solidVS, solidFS);
    this.currentShader = this.shaderPrograms.diffuse;

    // --- 2. Create scene + camera + light ---
    this.scene = new Scene();
    this.camera = new Camera({ aspect: gl.canvas.width / gl.canvas.height });
    // Camera on positive Z axis, raised slightly to look downward
    this.camera.setPosition(0, 0, -8);
    this.camera.lookAt([0, 4, 0]);
    this.scene.setCamera(this.camera);
    
    const light = new Light({ color: [1, 1, 1], intensity: 1.0 });
    light.setPosition(5, 10, 15);
    this.scene.setLight(light);

    // --- 3. Load OBJ geometry and create meshes ---
    const modelPaths = [
      "src/assets/models/cube.obj",
      "src/assets/models/teapot.obj",
      "src/assets/models/bunny.obj",
      "src/assets/models/tetrahedron.obj"
    ];

    // Load geometries once
    const geometries = [];
    for (const path of modelPaths) {
      const text = await (await fetch(path)).text();
      const { vertices, normals, faces } = parseOBJ(text);
      geometries.push({ vertices, normals, faces });
    }

    // Create 9 meshes (3x3 grid) by cycling through the 4 models
    /* for (let i = 0; i < 9; i++) {
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
    } */

    // --- 3b. Create Player (Pacman) ---
    this.ball = new Pacman({
      program: this.currentShader.program
    });
    this.ball.upload(gl);
    this.ball.setPosition(0, -3.5, 0); // Slightly above ground (-4)
    this.ball.setScale(0.5, 0.5, 0.5);
    this.scene.add(this.ball);

    // --- 3c. Create ground plane ---
    const ground = new Ground({
      width: 40,
      depth: 40,
      program: this.currentShader.program
    });
    ground.upload(gl);
    ground.setPosition(0, -4, 0);
    this.scene.add(ground);

    // --- 3c. Load and build Maze ---
    const levelText = await fetch("src/assets/levels/level1.txt").then(r => r.text());
    this.level = LevelParser.parse(levelText);
    
    // Center the maze
    this.levelStartX = -this.level.width / 2;
    this.levelStartZ = -this.level.height / 2;

    for (let z = 0; z < this.level.height; z++) {
      for (let x = 0; x < this.level.width; x++) {
        if (this.level.map[z][x] === 1) {
          const wall = new MazeWall({
            name: `wall_${x}_${z}`,
            program: this.currentShader.program
          });
          wall.upload(gl);
          // Position: x, y, z. y=-4 is ground level.
          // Add 0.5 to center the 1x1 block on the integer grid
          wall.setPosition(this.levelStartX + x + 0.5, -4, this.levelStartZ + z + 0.5);
          this.scene.add(wall);
        } else if (this.level.map[z][x] === 0) {
          // Spawn a dot on empty tiles
          const isPower = (x === 1 || x === this.level.width - 2) && (z === 1 || z === this.level.height - 2);

          const dot = new Dot({
            name: `dot_${x}_${z}`,
            program: this.currentShader.program,
            color: isPower ? [1, 0, 1] : [1, 0.8, 0.8]
          });
          dot.isPower = isPower;
          dot.upload(gl);
          
          if (isPower) {
              dot.setScale(2, 2, 2);
          }

          // Position: center of tile, slightly above ground (-4)
          // y = -3.5 is pacman center, so -3.8 is good for a small dot on floor
          dot.setPosition(this.levelStartX + x + 0.5, -3.8, this.levelStartZ + z + 0.5);
          this.scene.add(dot);
          this.dots.push(dot);
        }
      }
    }

    // --- 3d. Create Ghosts ---
    // Create 2 ghosts at random empty locations
    const emptySpots = [];
    for (let z = 0; z < this.level.height; z++) {
      for (let x = 0; x < this.level.width; x++) {
        if (this.level.map[z][x] === 0) {
            // Avoid spawning too close to Pacman (0,0 is center, usually start)
            // Pacman starts at 0, -3.5, 0.
            // World pos: levelStartX + x + 0.5
            const wx = this.levelStartX + x + 0.5;
            const wz = this.levelStartZ + z + 0.5;
            // Relaxed condition: just ensure they are not in the immediate start area (3 units radius)
            if (Math.abs(wx) > 2 || Math.abs(wz) > 2) {
                emptySpots.push({x, z});
            }
        }
      }
    }

    for (let i = 0; i < 2; i++) {
        if (emptySpots.length > 0) {
            const idx = Math.floor(Math.random() * emptySpots.length);
            const spot = emptySpots[idx];
            // Don't remove, multiple ghosts can be in same tile theoretically, but better not.
            emptySpots.splice(idx, 1); 
            
            const color = i === 0 ? [1, 0, 0] : [0, 1, 1]; // Red and Cyan
            const ghost = new Ghost(gl, this.currentShader.program, color);
            // Position: y=-3.5 same as Pacman
            ghost.setPosition(this.levelStartX + spot.x + 0.5, -3.5, this.levelStartZ + spot.z + 0.5);
            this.scene.add(ghost);
            this.ghosts.push(ghost);
        }
    }

    // --- 4. Setup coordinate axes ---
    const axes = new CoordinateAxes(gl, 1.0);
    this.scene.setCoordinateAxes(axes, this.shaderPrograms.axes.program);

    // --- 5. Initialize RenderSystem ---
    this.renderSystem = new RenderSystem(gl, this.scene, this.camera);
    this.renderSystem.setShadowProgram(this.shaderPrograms.shadow);
    this.renderSystem.onUpdate = (dt) => this.update(dt);
    
    // --- 6. Setup interaction ---
    this.keymap = new Keymap(this.state, this);
    this.setupMouseInteraction();
    
    // --- 7. Start render loop ---
    this.renderSystem.start();
  }

  setNextDirection(dx, dz) {
    this.nextDir = { x: dx, z: dz };
  }

  triggerJump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpTime = 0;
    }
  }

  update(deltaMs) {
    const dt = deltaMs / 1000.0;

    if (this.isFrozen) {
        this.freezeTime -= dt;
        if (this.freezeTime <= 0) {
            this.restartGame();
            this.isFrozen = false;
        }
        return;
    }

    if (!this.ball) return;
    
    const dist = this.speed * dt;
    const radius = 0.45; // Slightly less than 0.5 to fit in 1.0 corridors

    // 1. Try to switch to next direction
    if (this.nextDir.x !== 0 || this.nextDir.z !== 0) {
        const nextX = this.ball.position[0] + this.nextDir.x * dist;
        const nextZ = this.ball.position[2] + this.nextDir.z * dist;
        
        // Check collision with offset in direction of movement
        const checkX = nextX + this.nextDir.x * radius;
        const checkZ = nextZ + this.nextDir.z * radius;

        if (!this.checkCollision(checkX, checkZ)) {
            this.moveDir = { ...this.nextDir };
            this.nextDir = { x: 0, z: 0 }; // Consumed
            
            // Snap to grid axis when turning?
            // If turning from X motion to Z motion, snap X to center of tile.
            // This helps navigating corners.
            if (this.moveDir.x === 0) { // Moving in Z, snap X
                const tileX = Math.floor(this.ball.position[0] - this.levelStartX) + this.levelStartX + 0.5;
                // Only snap if close enough
                if (Math.abs(this.ball.position[0] - tileX) < 0.2) {
                    this.ball.setPosition(tileX, this.ball.position[1], this.ball.position[2]);
                }
            } else { // Moving in X, snap Z
                const tileZ = Math.floor(this.ball.position[2] - this.levelStartZ) + this.levelStartZ + 0.5;
                if (Math.abs(this.ball.position[2] - tileZ) < 0.2) {
                    this.ball.setPosition(this.ball.position[0], this.ball.position[1], tileZ);
                }
            }
        }
    }

    // 2. Move in current direction
    if (this.moveDir.x !== 0 || this.moveDir.z !== 0) {
        const nextX = this.ball.position[0] + this.moveDir.x * dist;
        const nextZ = this.ball.position[2] + this.moveDir.z * dist;

        const checkX = nextX + this.moveDir.x * radius;
        const checkZ = nextZ + this.moveDir.z * radius;

        if (!this.checkCollision(checkX, checkZ)) {
            this.ball.setPosition(nextX, this.ball.position[1], nextZ);
        }
    }

    // 3. Continuous Rotation
    if (this.moveDir.x !== 0 || this.moveDir.z !== 0) {
        let targetAngle = 0;
        if (this.moveDir.z === 1) targetAngle = 0;
        else if (this.moveDir.z === -1) targetAngle = Math.PI;
        else if (this.moveDir.x === 1) targetAngle = Math.PI / 2;
        else if (this.moveDir.x === -1) targetAngle = -Math.PI / 2;

        // Interpolate
        const currentAngle = this.ball.rotation[1];
        const rotationSpeed = 15.0; // Radians per second
        
        // Shortest path interpolation
        let diff = targetAngle - currentAngle;
        while (diff <= -Math.PI) diff += 2 * Math.PI;
        while (diff > Math.PI) diff -= 2 * Math.PI;

        if (Math.abs(diff) > 0.001) {
            const step = rotationSpeed * dt;
            if (Math.abs(diff) < step) {
                this.ball.rotation[1] = targetAngle;
            } else {
                this.ball.rotation[1] += Math.sign(diff) * step;
            }
        }
    }

    // 4. Jump Logic
    if (this.isJumping) {
        this.jumpTime += dt;
        const jumpDuration = 0.8; // 0.8 second jump
        
        if (this.jumpTime >= jumpDuration) {
            this.isJumping = false;
            this.jumpTime = 0;
            this.ball.setPosition(this.ball.position[0], -3.5, this.ball.position[2]); // Reset height
        } else {
            // Sine wave jump: sin(0..PI) goes 0->1->0
            const jumpHeight = 2.0;
            const progress = (this.jumpTime / jumpDuration) * Math.PI;
            const yOffset = Math.sin(progress) * jumpHeight;
            this.ball.setPosition(this.ball.position[0], -3.5 + yOffset, this.ball.position[2]);
        }
    }

    this.updateCamera();
    this.checkDotCollisions();
    this.updateGhosts(dt);
  }

  activatePowerMode() {
      this.powerModeTime = 10.0; // 10 seconds
      this.ghosts.forEach(g => g.setScared(true));
  }

  updateGhosts(dt) {
      // Update Power Mode
      if (this.powerModeTime > 0) {
          this.powerModeTime -= dt;
          if (this.powerModeTime <= 0) {
              this.ghosts.forEach(g => g.setScared(false));
          }
      }

      for (const ghost of this.ghosts) {
          ghost.step(dt, this);
          
          // Check collision with Pacman
          const dx = ghost.position[0] - this.ball.position[0];
          const dz = ghost.position[2] - this.ball.position[2];
          const dist = Math.sqrt(dx*dx + dz*dz);
          
          if (dist < 0.8) { 
              if (ghost.state === 'SCARED') {
                  ghost.die();
              } else if (ghost.state === 'NORMAL') {
                  this.handleGameOver();
              }
          }
      }
  }

  handleGameOver() {
      console.log("Game Over!");
      this.isFrozen = true;
      this.freezeTime = 2.0;
  }

  checkDotCollisions() {
    if (!this.ball) return;

    // Can't eat while jumping (if height is significant)
    // Ground level is -3.5. Let's say if > -3.0, he's too high.
    if (this.ball.position[1] > -3.0) return;

    const pacPos = this.ball.position;
    const eatDistance = 0.5; // Distance to eat dot

    for (let i = this.dots.length - 1; i >= 0; i--) {
      const dot = this.dots[i];
      const dotPos = dot.position;

      // Simple distance check (squared to avoid sqrt)
      const dx = pacPos[0] - dotPos[0];
      const dz = pacPos[2] - dotPos[2];
      const distSq = dx * dx + dz * dz;

      if (distSq < eatDistance * eatDistance) {
        // Eat the dot
        if (dot.isPower) {
            this.activatePowerMode();
        }
        this.scene.remove(dot);
        this.dots.splice(i, 1);
      }
    }

    // Win condition
    if (this.dots.length === 0) {
      console.log("All dots eaten! Restarting...");
      this.restartGame();
    }
  }

  restartGame() {
    // Reset Pacman position
    this.ball.setPosition(0, -3.5, 0);
    this.moveDir = { x: 0, z: 0 };
    this.nextDir = { x: 0, z: 0 };
    this.ball.setRotationEuler(0, 0, 0);

    // Respawn dots
    // Clear existing dots first (just in case)
    this.dots.forEach(dot => this.scene.remove(dot));
    this.dots = [];

    // Reset Ghosts
    this.ghosts.forEach(ghost => this.scene.remove(ghost));
    this.ghosts = [];

    const gl = this.gl;
    
    // Respawn dots
    for (let z = 0; z < this.level.height; z++) {
      for (let x = 0; x < this.level.width; x++) {
        if (this.level.map[z][x] === 0) {
          const isPower = (x === 1 || x === this.level.width - 2) && (z === 1 || z === this.level.height - 2);

          const dot = new Dot({
            name: `dot_${x}_${z}`,
            program: this.currentShader.program,
            color: isPower ? [1, 0, 1] : [1, 0.8, 0.8]
          });
          dot.isPower = isPower;
          dot.upload(gl);
          
          if (isPower) {
              dot.setScale(2, 2, 2);
          }

          dot.setPosition(this.levelStartX + x + 0.5, -3.8, this.levelStartZ + z + 0.5);
          this.scene.add(dot);
          this.dots.push(dot);
        }
      }
    }

    // Respawn Ghosts
    const emptySpots = [];
    for (let z = 0; z < this.level.height; z++) {
      for (let x = 0; x < this.level.width; x++) {
        if (this.level.map[z][x] === 0) {
            const wx = this.levelStartX + x + 0.5;
            const wz = this.levelStartZ + z + 0.5;
            if (Math.abs(wx) > 2 || Math.abs(wz) > 2) {
                emptySpots.push({x, z});
            }
        }
      }
    }

    for (let i = 0; i < 2; i++) {
        if (emptySpots.length > 0) {
            const idx = Math.floor(Math.random() * emptySpots.length);
            const spot = emptySpots[idx];
            emptySpots.splice(idx, 1); 
            
            const color = i === 0 ? [1, 0, 0] : [0, 1, 1]; 
            const ghost = new Ghost(gl, this.currentShader.program, color);
            ghost.setPosition(this.levelStartX + spot.x + 0.5, -3.5, this.levelStartZ + spot.z + 0.5);
            this.scene.add(ghost);
            this.ghosts.push(ghost);
        }
    }
  }

  updateCamera() {
    if (this.ball && this.camera) {
      const pos = this.ball.position;
      // Keep camera at fixed offset relative to ball
      // e.g. (0, 2, 8) offset from ball
      this.camera.setPosition(pos[0], pos[1] + 5.5, pos[2] + 8);
      this.camera.lookAt(pos);
    }
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

  toggleShear() {
    if (this.camera) {
      this.camera.toggleShear();
    }
  }

  checkCollision(x, z) {
    if (!this.level) return false;

    // Convert world coordinates to map coordinates
    // The map cells are 1x1.
    // Wall at map[z][x] covers world x range [startX + x, startX + x + 1]
    // So mapX = Math.floor(worldX - startX)
    
    const mapX = Math.floor(x - this.levelStartX);
    const mapZ = Math.floor(z - this.levelStartZ);

    // Check bounds
    if (mapX < 0 || mapX >= this.level.width || mapZ < 0 || mapZ >= this.level.height) {
      return false; // Out of bounds
    }

    return this.level.map[mapZ][mapX] === 1;
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
