import { Node } from './Node.js';
import { vec3 } from '../../node_modules/gl-matrix/esm/index.js';

/**
 * Simple point light node.
 * Position inherited from Node transform.
 */
export class Light extends Node {
  constructor({
    color = [1, 1, 1],
    intensity = 1.0,
  } = {}) {
    super({ name: 'Light' });
    this.color = vec3.clone(color);
    this.intensity = intensity;
  }

  getColor(out = vec3.create()) {
    vec3.scale(out, this.color, this.intensity);
    return out;
  }
}
