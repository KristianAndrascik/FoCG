
function initBuffers(gl) {
  console.log("Starting initBuffers...");
  
  const trunk = createTrunkBuffers(gl);
  console.log("Trunk created:", trunk);
  
  const cone = createConeBuffers(gl);
  console.log("Cone created:", cone);
  
  const decorations = createDecorationBuffers(gl);
  console.log("Decorations created:", decorations);

  const box = createBoxBuffers(gl);
  console.log("Box created:", box);
  
  return {
    trunk: trunk,
    cone: cone,
    decorations: decorations,
    box: box
  };
}

function createTrunkBuffers(gl) {
  // Create a cylinder for the trunk
  const positions = [];
  const colors = [];
  const indices = [];
  
  const trunkHeight = 0.5;
  const trunkRadius = 0.1;
  const segments = 8; // How round the trunk is
  
  // Generate cylinder vertices
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = trunkRadius * Math.cos(angle);
    const z = trunkRadius * Math.sin(angle);
    
    // Bottom vertex (y = 0)
    positions.push(x, 0, z);
    colors.push(0.55, 0.27, 0.07, 1.0); // Brown
    
    // Top vertex (y = trunkHeight)
    positions.push(x, trunkHeight, z);
    colors.push(0.55, 0.27, 0.07, 1.0); // Brown
  }
  
  // Generate indices for sides
  for (let i = 0; i < segments; i++) {
    const bottomLeft = i * 2;
    const bottomRight = (i + 1) * 2;
    const topLeft = i * 2 + 1;
    const topRight = (i + 1) * 2 + 1;
    
    // First triangle
    indices.push(bottomLeft, bottomRight, topLeft);
    // Second triangle
    indices.push(topLeft, bottomRight, topRight);
  }
  
  return createBufferSet(gl, positions, colors, indices);
}



function createConeBuffers(gl) {
  // Create a cone for the upper part of the tree
  const positions = [];
  const colors = [];
  const indices = [];

  const coneHeight = 1.0;
  const coneRadius = 0.5;
  const segments = 8;
  
  // Top of the cone
  positions.push(0, coneHeight, 0);
  colors.push(0.0, 0.5, 0.0, 1.0); // Green
  const topIndex = 0;
  
  // Generate base circle vertices
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = coneRadius * Math.cos(angle);
    const z = coneRadius * Math.sin(angle);

    positions.push(x, 0, z);
    colors.push(0.0, 0.5, 0.0, 1.0); // Green
  }

  // Generate indices for the cone
  for (let i = 1; i <= segments; i++) {
    indices.push(topIndex, i, i + 1);
  }

  return createBufferSet(gl, positions, colors, indices);
}


function createSphereBuffers(gl, radius = 0.1, latitudeBands = 8, longitudeBands = 8, color = [0.5, 0.5, 0.5, 1.0]) {
  const positions = [];
  const colors = [];
  const indices = [];

  // Generate vertices
  for (let lat = 0; lat <= latitudeBands; lat++) {
    const theta = lat * Math.PI / latitudeBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= longitudeBands; lon++) {
      const phi = lon * 2 * Math.PI / longitudeBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      positions.push(radius * x, radius * y, radius * z);
      colors.push(...color); // Use the provided color
    }
  }

  // Generate indices
  for (let lat = 0; lat < latitudeBands; lat++) {
    for (let lon = 0; lon < longitudeBands; lon++) {
      const first = (lat * (longitudeBands + 1)) + lon;
      const second = first + longitudeBands + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return createBufferSet(gl, positions, colors, indices);
}

function createDecorationBuffers(gl) {
  try {
    console.log("Creating decoration buffers...");
    
    // Create sphere buffers for decorations
    const greyBall = createSphereBuffers(gl, 0.08, 8, 8, [0.7, 0.7, 0.7, 1.0]);
    const darkGreyBall = createSphereBuffers(gl, 0.06, 8, 8, [0.3, 0.3, 0.3, 1.0]);
    
    console.log("Grey ball created:", greyBall);
    console.log("Dark grey ball created:", darkGreyBall);
    
    return {
      grey: greyBall,
      darkGrey: darkGreyBall
    };
  } catch (error) {
    console.error("Error in createDecorationBuffers:", error);
    return undefined;
  }
}

function createBoxBuffers(gl) {
  // Create a simple red box (cube)
  const positions = [
    // Front face
    -0.1, -0.1,  0.1,
     0.1, -0.1,  0.1,
      0.1,  0.1,  0.1,
    -0.1,  0.1,  0.1,
    // Back face
    -0.1, -0.1, -0.1,   
    -0.1,  0.1, -0.1,
      0.1,  0.1, -0.1,
      0.1, -0.1, -0.1,
    // Top face
    -0.1,  0.1, -0.1,
    -0.1,  0.1,  0.1,
      0.1,  0.1,  0.1,
      0.1,  0.1, -0.1,
    // Bottom face
    -0.1, -0.1, -0.1,
      0.1, -0.1, -0.1,
      0.1, -0.1,  0.1,
    -0.1, -0.1,  0.1,
    // Right face
      0.1, -0.1, -0.1,
      0.1,  0.1, -0.1,
      0.1,  0.1,  0.1,
      0.1, -0.1,  0.1,
    // Left face
    -0.1, -0.1, -0.1,
    -0.1, -0.1,  0.1,
    -0.1,  0.1,  0.1,
    -0.1,  0.1, -0.1,
  ];

  const faceColors = [
    [1.0, 0.0, 0.0, 1.0],    // Front face: red
    [0.5, 0.0, 0.0, 1.0],    // Back face: dark red
    [1.0, 0.0, 0.0, 1.0],    // Top face: red
    [1.0, 0.0, 0.0, 1.0],    // Bottom face: red
    [0.5, 0.0, 0.0, 1.0],    // Right face: dark red
    [1.0, 0.0, 0.0, 1.0],    // Left face: red
  ];

  let colors = [];

for (const c of faceColors) {
  // Repeat each color four times for the four vertices of the face
  colors = colors.concat(c, c, c, c);
}

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9, 10,      8, 10, 11,    // top
   12, 13, 14,     12, 14, 15,    // bottom
   16, 17, 18,     16, 18, 19,    // right
   20, 21, 22,     20, 22, 23,    // left
 ];

  return createBufferSet(gl, positions, colors, indices);
}

function createBufferSet(gl, positions, colors, indices) {

  /// For each object, we need position, color, and index (how to create triangles) buffers.
  /// bindBuffer = setting them as the current buffer
  /// bufferData = transferring data to the GPU, STATIC_DRAW means we won't change it often, data in form of typed array

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    vertexCount: indices.length
  };
}




export { initBuffers };