// obj file parser
// https://en.wikipedia.org/wiki/Wavefront_.obj_file

export function parseOBJ(text) {
    const lines = text.split('\n');
    const vertices = [];
    const textureCoords = [];
    const normals = [];
    const faces = [];
    for (const line of lines) {
        const parts = line.trim().split(' ');
        
        
        // Parse vertex positions
        // Example: v 0.123 0.234 0.345
        if (parts[0] === 'v') {
            const vertex = parts.slice(1).map(Number);
            vertices.push(vertex);
        }
        // Parse texture coordinates
        // Example: vt 0.500 1 [0]
        else if (parts[0] === 'vt') {
            const texCoord = parts.slice(1).map(Number);
            textureCoords.push(texCoord);
        }
        
        // Parse vertex normals
        // Example: vn 0.707 0.000 0.707
        else if (parts[0] === 'vn') {
            const normal = parts.slice(1).map(Number);
            normals.push(normal);
        }

        // Parse faces
        // Example: f 1/1/1 2/2/2 3/3/3
        else if (parts[0] === 'f') {
            const face = parts.slice(1).map(part => {
                const indices = part.split('/').map(idx => parseInt(idx, 10) - 1);
                return {
                    vertexIndex: indices[0],
                    textureIndex: indices[1],
                    normalIndex: indices[2],
                };
            });
            faces.push(face);
        }

        else {
            // Ignore other lines (comments, mtllib, usemtl, etc.)
            continue;
        }
    }

    return {
        vertices,
        textureCoords,
        normals,
        faces,
    };
       
}


