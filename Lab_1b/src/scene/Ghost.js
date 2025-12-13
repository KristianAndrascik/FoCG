import { Node } from './Node.js';
import { Mesh } from './Mesh.js';
import { Primitives } from './Primitives.js';
import { vec3 } from '../../node_modules/gl-matrix/esm/index.js';

export class Ghost extends Node {
    constructor(gl, shaderProgram, color = [1, 0, 0]) {
        super({ name: "Ghost" });
        
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.originalColor = color;
        this.scaredColor = [0, 0, 1]; // Blue
        this.currentColor = color;
        
        // State
        this.state = 'NORMAL'; // NORMAL, SCARED, DEAD
        this.respawnTimer = 0;
        this.startPos = [0, 0, 0]; // Will be set when setPosition is called? No, setPosition is on Node.
        // We'll capture the first position set as startPos or pass it in.
        
        // Movement
        this.moveDir = { x: 1, z: 0 }; // Start moving
        this.speed = 2.0;
        this.radius = 0.4; // Collision radius

        this.initGeometry();
        this.pickRandomDirection();
    }

    setPosition(x, y, z) {
        super.setPosition(x, y, z);
        // Hack: assume the first setPosition is the spawn point
        if (!this.spawnPoint) {
            this.spawnPoint = [x, y, z];
        }
    }

    initGeometry() {
        // 1. Torso (Cylinder)
        // Height 0.6, Radius 0.4
        const torsoGeo = Primitives.createCylinder(0.4, 0.6, 20);
        this.torso = new Mesh({ 
            name: "GhostTorso", 
            geometry: torsoGeo, 
            program: this.shaderProgram, 
            color: this.currentColor 
        });
        this.torso.upload(this.gl);
        this.addChild(this.torso);

        // 2. Head (Sphere)
        // Radius 0.4 to match cylinder
        const headGeo = Primitives.createSphere(0.4, 15, 15);
        this.head = new Mesh({ 
            name: "GhostHead", 
            geometry: headGeo, 
            program: this.shaderProgram, 
            color: this.currentColor 
        });
        this.head.upload(this.gl);
        this.head.position = [0, 0.3, 0]; // Sit on top of torso
        this.addChild(this.head);

        // 3. Eyes (White Spheres)
        const eyeGeo = Primitives.createSphere(0.12, 10, 10);
        
        // Left Eye
        this.leftEye = new Mesh({ 
            name: "LeftEye", 
            geometry: eyeGeo, 
            program: this.shaderProgram, 
            color: [1, 1, 1] 
        });
        this.leftEye.upload(this.gl);
        // Position relative to Head? No, relative to Ghost Node.
        // Head is at 0, 0.3, 0. Radius 0.4.
        // Eyes should be on the surface of the head.
        // Say at y=0.4, z=0.35, x=+-0.15
        this.leftEye.position = [-0.15, 0.4, 0.3]; 
        this.addChild(this.leftEye);

        // Right Eye
        this.rightEye = new Mesh({ 
            name: "RightEye", 
            geometry: eyeGeo, 
            program: this.shaderProgram, 
            color: [1, 1, 1] 
        });
        this.rightEye.upload(this.gl);
        this.rightEye.position = [0.15, 0.4, 0.3];
        this.addChild(this.rightEye);
        
        // Pupils (Blue/Black small spheres)
        const pupilGeo = Primitives.createSphere(0.06, 8, 8);
        
        this.leftPupil = new Mesh({ name: "LeftPupil", geometry: pupilGeo, program: this.shaderProgram, color: [0, 0, 1] });
        this.leftPupil.upload(this.gl);
        this.leftPupil.position = [0, 0, 0.1]; // Relative to eye center
        this.leftEye.addChild(this.leftPupil);

        this.rightPupil = new Mesh({ name: "RightPupil", geometry: pupilGeo, program: this.shaderProgram, color: [0, 0, 1] });
        this.rightPupil.upload(this.gl);
        this.rightPupil.position = [0, 0, 0.1];
        this.rightEye.addChild(this.rightPupil);
    }

    setScared(isScared) {
        if (this.state === 'DEAD') return;
        
        if (isScared) {
            this.state = 'SCARED';
            this.torso.color = this.scaredColor;
            this.head.color = this.scaredColor;
            this.speed = 1.0; // Slower
        } else {
            this.state = 'NORMAL';
            this.torso.color = this.originalColor;
            this.head.color = this.originalColor;
            this.speed = 2.0;
        }
    }

    die() {
        this.state = 'DEAD';
        this.respawnTimer = 5.0; // 5 seconds to respawn
        this.setScale(0, 0, 0); // Hide
    }

    respawn() {
        this.state = 'NORMAL';
        this.torso.color = this.originalColor;
        this.head.color = this.originalColor;
        this.speed = 2.0;
        this.setScale(1, 1, 1);
        
        if (this.spawnPoint) {
            this.position[0] = this.spawnPoint[0];
            this.position[1] = this.spawnPoint[1];
            this.position[2] = this.spawnPoint[2];
        }
    }

    step(dt, app) {
        if (this.state === 'DEAD') {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return;
        }

        // Move
        const dist = this.speed * dt;
        const nextX = this.position[0] + this.moveDir.x * dist;
        const nextZ = this.position[2] + this.moveDir.z * dist;

        // Check Wall Collision
        const checkX = nextX + this.moveDir.x * this.radius;
        const checkZ = nextZ + this.moveDir.z * this.radius;

        if (app.checkCollision(checkX, checkZ)) {
            // Hit wall, pick new random direction
            this.pickRandomDirection();
        } else {
            this.position[0] = nextX;
            this.position[2] = nextZ;
        }
        
        // Update Eyes to look at Pacman
        if (app.ball) {
            this.lookAtPacman(app.ball.position);
        }
    }

    checkCollision(x, z, walls) {
        // Simple circle-box collision
        // Assuming walls are MazeWall objects (1x1x1 boxes centered at integer coords usually)
        // Wall size is 1x1.
        const wallHalfSize = 0.5;
        
        for (const wall of walls) {
            // AABB check
            const minX = wall.position[0] - wallHalfSize - this.radius;
            const maxX = wall.position[0] + wallHalfSize + this.radius;
            const minZ = wall.position[2] - wallHalfSize - this.radius;
            const maxZ = wall.position[2] + wallHalfSize + this.radius;
            
            if (x > minX && x < maxX && z > minZ && z < maxZ) {
                return true;
            }
        }
        return false;
    }

    pickRandomDirection() {
        const dirs = [
            { x: 1, z: 0 },
            { x: -1, z: 0 },
            { x: 0, z: 1 },
            { x: 0, z: -1 }
        ];
        
        // Try to pick a valid direction if possible?
        // For now just random. If it picks a wall direction, it will collide next frame and pick again.
        // To avoid getting stuck, maybe ensure we don't pick the exact opposite immediately?
        // Or just random is fine for "wander randomly".
        
        const r = Math.floor(Math.random() * 4);
        this.moveDir = dirs[r];
    }

    lookAtPacman(targetPos) {
        // Calculate angle to target
        // Ghost position is this.position
        // Eye positions are relative to Ghost.
        // We want to rotate the eyes so pupils point to target.
        
        // Vector from Ghost to Target (ignoring Y for Yaw)
        const dx = targetPos[0] - this.position[0];
        const dz = targetPos[2] - this.position[2];
        
        // Yaw (Left/Right)
        // atan2(x, z) gives angle from Z axis?
        // If dx=0, dz=1 -> 0.
        // If dx=1, dz=0 -> PI/2.
        const yaw = Math.atan2(dx, dz);
        
        // Pitch (Up/Down)
        // Vector from Eye height to Target height
        // Eye height is approx GhostY + 0.4
        const dy = targetPos[1] - (this.position[1] + 0.4);
        const dist = Math.sqrt(dx*dx + dz*dz);
        // atan2(y, dist)
        // If dy > 0 (target above), pitch should be negative (look up) or positive?
        // Rotation around X axis.
        // +X rotation tilts forward (down) or backward (up)?
        // Right hand rule on X axis (thumb right). Fingers curl Y to Z.
        // +Rotation moves +Y to +Z.
        // So +Pitch looks UP? No, +Y is up.
        // If we rotate +X, +Y goes to +Z (back). So it looks UP?
        // Wait. Y is up. Z is forward (or back).
        // If we rotate around X.
        // Y axis moves towards Z axis.
        // So "Up" vector moves "Back".
        // So the "Front" vector (Z) moves "Down" (-Y).
        // So +Rotation around X makes it look DOWN.
        // So if dy > 0 (look up), we need -Rotation.
        const pitch = -Math.atan2(dy, dist);

        // Apply rotation
        this.leftEye.rotation = [pitch, yaw, 0];
        this.rightEye.rotation = [pitch, yaw, 0];
    }
}
