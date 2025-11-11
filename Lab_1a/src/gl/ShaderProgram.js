
class ShaderProgram {
  constructor(gl, vsSource, fsSource) {
    this.gl = gl;
    this.program = this._initProgram(vsSource, fsSource);
  }

  _initProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vertexShader = this._loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this._loadShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program:", gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  _loadShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("An error occurred compiling the shaders:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  use() {
    this.gl.useProgram(this.program);
  }
}

export { ShaderProgram };