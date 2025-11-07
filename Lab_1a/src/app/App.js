import { initBuffers } from "./../init-buffers.js";
import { drawScene } from "./../draw-scene.js";

class App {
  constructor() {
    this.gl = null;
    this.programInfo = null;
    this.buffers = null;
    this.rotationAngle = 0;
    this.canvas = null;
  }

  init() {
    this.canvas = document.querySelector("#gl-canvas");
    this.gl = this.canvas.getContext("webgl");

    if (this.gl === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }

    this.setupShaders();
    this.buffers = initBuffers(this.gl);
    drawScene(this.gl, this.programInfo, this.buffers);
  }

  setupShaders() {
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

    const shaderProgram = this.initShaderProgram(this.gl, vsSource, fsSource);
    
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        vertexColor: this.gl.getAttribLocation(shaderProgram, "aVertexColor"),
      },
      uniformLocations: {
        projectionMatrix: this.gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
        modelViewMatrix: this.gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      },
    };
  }

  initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
      return null;
    }

    return shaderProgram;
  }

  loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

 
}


export { App };