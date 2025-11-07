function drawScene(gl, programInfo, buffers, cameraAngle = 0) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );

  // Create a view matrix that orbits around the scene
  const viewMatrix = mat4.create();
  const cameraRadius = 8.0; // Distance from center
  const cameraX = Math.sin(cameraAngle) * cameraRadius;
  const cameraZ = Math.cos(cameraAngle) * cameraRadius;

  // Create view matrix looking at the center
  mat4.lookAt(
    viewMatrix,
    [cameraX, 2.0, cameraZ], // Camera position (orbiting)
    [0, 0, -6], // Look at point (center of tree)
    [0, 1, 0] // Up direction
  );

  // Combine view matrix with projection
  const viewProjectionMatrix = mat4.create();
  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  // Use combined matrix as projection
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    viewProjectionMatrix
  );


   const treeZ = -5.7;

  // Define objects to render with their transformations
  const objects = [
    {
      name: "trunk",
      buffer: buffers.trunk,
      position: [0.0, 0.0, treeZ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    {
      name: "cone",
      buffer: buffers.cone,
      position: [0.0, 0.5, treeZ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    }, 
    {
      name: "box",
      buffer: buffers.box,
      position: [0.3, 0.0, treeZ + 0.2],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    }
  ];

    if (buffers.decorations) {
       objects.push(
      {
        name: 'ball4',
        buffer: buffers.decorations.grey,
        position: [0.0, 1.5, treeZ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
    );
  } else {
    console.log("Decorations not available - drawing tree without balls");
  }


  // Draw each object
  objects.forEach((object) => {
    renderObject(gl, programInfo, object);
  });
}

function renderObject(gl, programInfo, object) {
  const { buffer, position, rotation, scale } = object;

  // Create model-view matrix for this object
  const modelViewMatrix = mat4.create();

  // Apply transformations
  mat4.translate(modelViewMatrix, modelViewMatrix, position);

  // Apply rotation (if any)
  if (rotation[0] !== 0)
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation[0]);
  if (rotation[1] !== 0)
    mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation[1]);
  if (rotation[2] !== 0)
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation[2]);

  // Apply scale (if any)
  if (scale[0] !== 1 || scale[1] !== 1 || scale[2] !== 1) {
    mat4.scale(modelViewMatrix, modelViewMatrix, scale);
  }

  // Set the model-view matrix uniform
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  // Set up attributes
  setPositionAttribute(gl, buffer, programInfo);
  setColorAttribute(gl, buffer, programInfo);

  // Bind indices and draw
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indices);

  const vertexCount = buffer.vertexCount;
  const type = gl.UNSIGNED_SHORT;
  const offset = 0;
  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffers, programInfo) {
  const numComponents = 3;
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// Tell WebGL how to pull out the colors from the color buffer
// into the vertexColor attribute.
function setColorAttribute(gl, buffers, programInfo) {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

export { drawScene };
