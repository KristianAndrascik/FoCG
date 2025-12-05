import { Mesh } from './Mesh.js';
import { Primitives } from './Primitives.js';

export class Ground extends Mesh {
    constructor({ name = "ground", width = 40, depth = 40, program, color = [0.5, 0.5, 0.5] } = {}) {
        const geometry = Primitives.createPlane(width, depth);
        super({ name, geometry, program, color });
    }
}
