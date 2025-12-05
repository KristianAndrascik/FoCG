import { Mesh } from './Mesh.js';
import { Primitives } from './Primitives.js';

export class MazeWall extends Mesh {
    constructor({ name = "maze_wall", program, color = [0.7, 0.4, 0.2] } = {}) {
        const geometry = Primitives.createMazeWall();
        super({ name, geometry, program, color });
    }
}
