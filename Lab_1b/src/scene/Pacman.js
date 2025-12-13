import { Node } from './Node.js';
import { Mesh } from './Mesh.js';
import { Primitives } from './Primitives.js';

export class Pacman extends Node {
    constructor({ program } = {}) {
        super({ name: "pacman" });
        
        this.program = program;
        this.mouthAngle = 0;
        this.mouthSpeed = 10; // radians per second
        this.mouthOpen = true;
        this.maxMouthAngle = 0.6; // ~35 degrees

        // Create parts
        this._createGeometry();
    }

    _createGeometry() {
        // Top Hemisphere
        // theta 0 to PI/2
        const topGeo = Primitives.createSphere(0.5, 20, 20, 0, Math.PI * 2, 0, Math.PI/2);
        this.topHalf = new Mesh({ 
            name: "pacman_top", 
            geometry: topGeo, 
            program: this.program, 
            color: [1, 1, 0] // Yellow
        });
        this.addChild(this.topHalf);

        // Cap for top hemisphere (facing down)
        const topCapGeo = Primitives.createDisk(0.5, 20);
        this.topCap = new Mesh({
            name: "pacman_top_cap",
            geometry: topCapGeo,
            program: this.program,
            color: [1, 1, 0] // Yellow
        });
        // Disk is in XZ plane facing +Y. We need it to face -Y (down).
        this.topCap.setRotationEuler(Math.PI, 0, 0);
        this.topHalf.addChild(this.topCap);


        // Bottom Hemisphere
        // theta PI/2 to PI
        const botGeo = Primitives.createSphere(0.5, 20, 20, 0, Math.PI * 2, Math.PI/2, Math.PI/2);
        this.bottomHalf = new Mesh({ 
            name: "pacman_bottom", 
            geometry: botGeo, 
            program: this.program, 
            color: [1, 1, 0] // Yellow
        });
        this.addChild(this.bottomHalf);

        // Cap for bottom hemisphere (facing up)
        const botCapGeo = Primitives.createDisk(0.5, 20);
        this.botCap = new Mesh({
            name: "pacman_bot_cap",
            geometry: botCapGeo,
            program: this.program,
            color: [1, 1, 0] // Yellow
        });
        // Disk is in XZ plane facing +Y. That's correct for bottom half top.
        this.bottomHalf.addChild(this.botCap);


        // Eyes (attached to top half)
        const eyeGeo = Primitives.createSphere(0.06, 10, 10);
        
        // Hinge is X axis. Mouth opens at +/- Z.
        // Let's assume Front is +Z.
        // Eyes should be at +Z, +Y, +/- X.
        
        this.leftEye = new Mesh({
            name: "eye_left",
            geometry: eyeGeo,
            program: this.program,
            color: [0, 0, 0] // Black
        });
        // Position relative to top half
        this.leftEye.setPosition(0.25, 0.3, 0.25);
        this.topHalf.addChild(this.leftEye);

        this.rightEye = new Mesh({
            name: "eye_right",
            geometry: eyeGeo,
            program: this.program,
            color: [0, 0, 0] // Black
        });
        this.rightEye.setPosition(-0.25, 0.3, 0.25);
        this.topHalf.addChild(this.rightEye);
    }

    upload(gl) {
        this.topHalf.upload(gl);
        this.topCap.upload(gl);
        this.bottomHalf.upload(gl);
        this.botCap.upload(gl);
        this.leftEye.upload(gl);
        this.rightEye.upload(gl);
    }

    update(dt) {
        // Animate mouth
        if (this.mouthOpen) {
            this.mouthAngle += this.mouthSpeed * dt;
            if (this.mouthAngle >= this.maxMouthAngle) {
                this.mouthAngle = this.maxMouthAngle;
                this.mouthOpen = false;
            }
        } else {
            this.mouthAngle -= this.mouthSpeed * dt;
            if (this.mouthAngle <= 0.02) { // Don't close completely to avoid Z-fighting
                this.mouthAngle = 0.02;
                this.mouthOpen = true;
            }
        }

        // Rotate halves around X axis
        // Top rotates back (negative)
        this.topHalf.setRotationEuler(-this.mouthAngle, 0, 0);
        
        // Bottom rotates down (positive)
        this.bottomHalf.setRotationEuler(this.mouthAngle, 0, 0);
    }
}
