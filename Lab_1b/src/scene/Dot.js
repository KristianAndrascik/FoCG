import { Mesh } from './Mesh.js';
import { Primitives } from './Primitives.js';

export class Dot extends Mesh {
    constructor({ name = "dot", program, color = [1, 0.8, 0.8] } = {}) { // Light pinkish/white dots
        const geometry = Primitives.createSphere(0.1, 8, 8); // Small sphere
        super({ name, geometry, program, color });
        this.castShadow = true;
    }
}
