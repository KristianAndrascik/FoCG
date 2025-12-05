
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
}
