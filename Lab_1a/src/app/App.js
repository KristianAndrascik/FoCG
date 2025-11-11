import { ShaderProgram } from "../gl/ShaderProgram.js";
import { initGLContext } from "../gl/GLContext.js";
import { RenderSystem } from "../systems/RenderSystem.js";


class App {
  constructor(canvasId) {
    this.gl = initGLContext(canvasId);
    if (!this.gl) throw new Error("WebGL init failed");

    this.shaderProgram = null;
    this.renderSystem = null;
  }

  init() {
    

    const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec4 aVertexColor;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying lowp vec4 vColor;
      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
      }
    `;

    const fsSource = `
      varying lowp vec4 vColor;
      void main(void) {
        gl_FragColor = vColor;
      }
    `;

    this.shaderProgram = new ShaderProgram(this.gl, vsSource, fsSource);
    this.renderSystem = new RenderSystem(this.gl, this.shaderProgram);


    this.loop();
  } 

  loop(time=0) {

    const deltaTime = time - (this.lastTime || 0);
    this.lastTime = time;
    
    this.renderSystem.drawScene(deltaTime);
    requestAnimationFrame((t) => this.loop(t));
  }

  
  }

export { App };
