
export class Primitives {
    static createPlane(width = 1, depth = 1) {
        const hWidth = width / 2;
        const hDepth = depth / 2;
        return {
            vertices: [
                [-hWidth, 0, hDepth],
                [hWidth, 0, hDepth],
                [hWidth, 0, -hDepth],
                [-hWidth, 0, -hDepth]
            ],
            normals: [
                [0, 1, 0],  // Up
                [0, -1, 0]  // Down
            ],
            faces: [
                // Top face (CCW)
                [
                    { vertexIndex: 0, normalIndex: 0 },
                    { vertexIndex: 1, normalIndex: 0 },
                    { vertexIndex: 2, normalIndex: 0 }
                ],
                [
                    { vertexIndex: 0, normalIndex: 0 },
                    { vertexIndex: 2, normalIndex: 0 },
                    { vertexIndex: 3, normalIndex: 0 }
                ],
                // Bottom face (CW relative to top, so CCW from bottom)
                // 0->2->1
                [
                    { vertexIndex: 0, normalIndex: 1 },
                    { vertexIndex: 2, normalIndex: 1 },
                    { vertexIndex: 1, normalIndex: 1 }
                ],
                // 0->3->2
                [
                    { vertexIndex: 0, normalIndex: 1 },
                    { vertexIndex: 3, normalIndex: 1 },
                    { vertexIndex: 2, normalIndex: 1 }
                ]
            ]
        };
    }

    static createMazeWall() {
        // Box 1x1x0.25 (y=0 to 0.25) + Pyramid height 0.75 (y=0.25 to 1.0)
        // Total height 1.0. Width/Depth 1.
        
        const vertices = [
            // Bottom 4 (y=0)
            [-0.5, 0, 0.5],  // 0: Front-Left
            [ 0.5, 0, 0.5],  // 1: Front-Right
            [ 0.5, 0, -0.5], // 2: Back-Right
            [-0.5, 0, -0.5], // 3: Back-Left
            
            // Top 4 (y=0.25) - Base of pyramid
            [-0.5, 0.25, 0.5],  // 4: Front-Left
            [ 0.5, 0.25, 0.5],  // 5: Front-Right
            [ 0.5, 0.25, -0.5], // 6: Back-Right
            [-0.5, 0.25, -0.5], // 7: Back-Left
            
            // Tip (y=1.0)
            [ 0, 1.0, 0]       // 8: Tip
        ];

        const normals = [
            [0, -1, 0],       // 0: Bottom
            [0, 0, 1],        // 1: Front
            [1, 0, 0],        // 2: Right
            [0, 0, -1],       // 3: Back
            [-1, 0, 0],       // 4: Left
            [0, 0.5547, 0.8321],  // 5: Pyr Front
            [0.8321, 0.5547, 0],  // 6: Pyr Right
            [0, 0.5547, -0.8321], // 7: Pyr Back
            [-0.8321, 0.5547, 0]  // 8: Pyr Left
        ];

        const faces = [
            // Box Bottom
            [ {v:0, n:0}, {v:2, n:0}, {v:1, n:0} ],
            [ {v:0, n:0}, {v:3, n:0}, {v:2, n:0} ],

            // Box Front
            [ {v:0, n:1}, {v:1, n:1}, {v:5, n:1} ],
            [ {v:0, n:1}, {v:5, n:1}, {v:4, n:1} ],

            // Box Right
            [ {v:1, n:2}, {v:2, n:2}, {v:6, n:2} ],
            [ {v:1, n:2}, {v:6, n:2}, {v:5, n:2} ],

            // Box Back
            [ {v:2, n:3}, {v:3, n:3}, {v:7, n:3} ],
            [ {v:2, n:3}, {v:7, n:3}, {v:6, n:3} ],

            // Box Left
            [ {v:3, n:4}, {v:0, n:4}, {v:4, n:4} ],
            [ {v:3, n:4}, {v:4, n:4}, {v:7, n:4} ],

            // Pyramid Front
            [ {v:4, n:5}, {v:5, n:5}, {v:8, n:5} ],

            // Pyramid Right
            [ {v:5, n:6}, {v:6, n:6}, {v:8, n:6} ],

            // Pyramid Back
            [ {v:6, n:7}, {v:7, n:7}, {v:8, n:7} ],

            // Pyramid Left
            [ {v:7, n:8}, {v:4, n:8}, {v:8, n:8} ]
        ];

        // Map simplified face structure to expected format
        const formattedFaces = faces.map(face => 
            face.map(v => ({ vertexIndex: v.v, normalIndex: v.n }))
        );

        return { vertices, normals, faces: formattedFaces };
    }

    static createSphere(radius = 1, latBands = 20, longBands = 20, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
        const vertices = [];
        const normals = [];
        const faces = [];

        for (let lat = 0; lat <= latBands; lat++) {
            const theta = thetaStart + (lat / latBands) * thetaLength;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let long = 0; long <= longBands; long++) {
                const phi = phiStart + (long / longBands) * phiLength;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                vertices.push([radius * x, radius * y, radius * z]);
                normals.push([x, y, z]);
            }
        }

        for (let lat = 0; lat < latBands; lat++) {
            for (let long = 0; long < longBands; long++) {
                const first = (lat * (longBands + 1)) + long;
                const second = first + longBands + 1;

                // Two triangles per quad
                faces.push([
                    { vertexIndex: first, normalIndex: first },
                    { vertexIndex: first + 1, normalIndex: first + 1 },
                    { vertexIndex: second, normalIndex: second }
                ]);

                faces.push([
                    { vertexIndex: second, normalIndex: second },
                    { vertexIndex: first + 1, normalIndex: first + 1 },
                    { vertexIndex: second + 1, normalIndex: second + 1 },
                ]);
            }
        }

        return { vertices, normals, faces };
    }

    static createDisk(radius = 1, segments = 20) {
        const vertices = [];
        const normals = [];
        const faces = [];

        // Center vertex
        vertices.push([0, 0, 0]);
        normals.push([0, 1, 0]); // Up

        // Perimeter vertices
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            vertices.push([x, 0, z]);
            normals.push([0, 1, 0]);
        }

        // Faces
        for (let i = 1; i <= segments; i++) {
            faces.push([
                { vertexIndex: 0, normalIndex: 0 },
                { vertexIndex: i, normalIndex: i },
                { vertexIndex: i + 1, normalIndex: i + 1 }
            ]);
        }

        return { vertices, normals, faces };
    }

    static createCylinder(radius = 0.5, height = 1, segments = 20) {
        const vertices = [];
        const normals = [];
        const faces = [];

        const halfHeight = height / 2;

        // 1. Top Cap Center
        vertices.push([0, halfHeight, 0]); 
        normals.push([0, 1, 0]);

        // 2. Bottom Cap Center
        vertices.push([0, -halfHeight, 0]);
        normals.push([0, -1, 0]);

        // 3. Top Ring (for Cap)
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            vertices.push([x, halfHeight, z]);
            normals.push([0, 1, 0]);
        }

        // 4. Bottom Ring (for Cap)
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            vertices.push([x, -halfHeight, z]);
            normals.push([0, -1, 0]);
        }

        // 5. Top Ring (for Side)
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            vertices.push([x, halfHeight, z]);
            normals.push([x, 0, z]); // Normal points out
        }

        // 6. Bottom Ring (for Side)
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            vertices.push([x, -halfHeight, z]);
            normals.push([x, 0, z]); // Normal points out
        }

        // Indices calculation
        const topCenterIdx = 0;
        const bottomCenterIdx = 1;
        const topCapStart = 2;
        const bottomCapStart = 2 + segments + 1;
        const sideTopStart = bottomCapStart + segments + 1;
        const sideBottomStart = sideTopStart + segments + 1;

        // Faces: Top Cap
        for (let i = 0; i < segments; i++) {
            faces.push([
                { vertexIndex: topCenterIdx, normalIndex: topCenterIdx },
                { vertexIndex: topCapStart + i + 1, normalIndex: topCapStart + i + 1 },
                { vertexIndex: topCapStart + i, normalIndex: topCapStart + i }
            ]);
        }

        // Faces: Bottom Cap
        for (let i = 0; i < segments; i++) {
            faces.push([
                { vertexIndex: bottomCenterIdx, normalIndex: bottomCenterIdx },
                { vertexIndex: bottomCapStart + i, normalIndex: bottomCapStart + i },
                { vertexIndex: bottomCapStart + i + 1, normalIndex: bottomCapStart + i + 1 }
            ]);
        }

        // Faces: Sides
        for (let i = 0; i < segments; i++) {
            const top1 = sideTopStart + i;
            const top2 = sideTopStart + i + 1;
            const bottom1 = sideBottomStart + i;
            const bottom2 = sideBottomStart + i + 1;

            faces.push([
                { vertexIndex: top1, normalIndex: top1 },
                { vertexIndex: bottom1, normalIndex: bottom1 },
                { vertexIndex: top2, normalIndex: top2 }
            ]);

            faces.push([
                { vertexIndex: bottom1, normalIndex: bottom1 },
                { vertexIndex: bottom2, normalIndex: bottom2 },
                { vertexIndex: top2, normalIndex: top2 }
            ]);
        }

        return { vertices, normals, faces };
    }
}
