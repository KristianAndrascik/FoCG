function initGLContext(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) throw new Error(`Canvas with id "${canvasId}" not found.`);

  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return null;
  }

  return gl;
}

export { initGLContext };