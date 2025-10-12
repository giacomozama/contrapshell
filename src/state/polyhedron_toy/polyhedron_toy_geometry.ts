export enum PlatonicSolidType {
    Tetrahedron,
    Hexahedron,
    Octahedron,
    Dodecahedron,
    Icosahedron,
}

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

// ngl this is brutally vibecoded
export function generatePlatonicSolid(type: PlatonicSolidType, sideLength: number) {
    let baseVertices = [];
    let edges = [];
    let baseSideLength = 0;

    switch (type) {
        case PlatonicSolidType.Tetrahedron:
            // 4 vertices, 6 edges
            // Vertices are 4 non-adjacent corners of a cube
            baseVertices = [
                [1, 1, 1],
                [-1, -1, 1],
                [-1, 1, -1],
                [1, -1, -1],
            ];
            baseSideLength = 2 * Math.sqrt(2);
            edges = [
                [0, 1],
                [0, 2],
                [0, 3],
                [1, 2],
                [1, 3],
                [2, 3],
            ];
            break;

        case PlatonicSolidType.Hexahedron:
            // 8 vertices, 12 edges
            baseVertices = [
                [1, 1, 1],
                [-1, 1, 1],
                [-1, -1, 1],
                [1, -1, 1],
                [1, 1, -1],
                [-1, 1, -1],
                [-1, -1, -1],
                [1, -1, -1],
            ];
            baseSideLength = 2;
            edges = [
                [0, 1],
                [1, 2],
                [2, 3],
                [3, 0],
                [4, 5],
                [5, 6],
                [6, 7],
                [7, 4],
                [0, 4],
                [1, 5],
                [2, 6],
                [3, 7],
            ];
            break;

        case PlatonicSolidType.Octahedron:
            // 6 vertices, 12 edges (dual of a cube)
            baseVertices = [
                [1, 0, 0],
                [-1, 0, 0],
                [0, 1, 0],
                [0, -1, 0],
                [0, 0, 1],
                [0, 0, -1],
            ];
            baseSideLength = Math.sqrt(2);
            edges = [
                [0, 2],
                [0, 3],
                [0, 4],
                [0, 5],
                [1, 2],
                [1, 3],
                [1, 4],
                [1, 5],
                [2, 4],
                [3, 4],
                [2, 5],
                [3, 5],
            ];
            break;

        case PlatonicSolidType.Dodecahedron:
            // 20 vertices, 30 edges
            const p2 = GOLDEN_RATIO * GOLDEN_RATIO;
            baseVertices = [
                [1, p2, 0],
                [-1, p2, 0],
                [1, -p2, 0],
                [-1, -p2, 0],
                [0, 1, p2],
                [0, -1, p2],
                [0, 1, -p2],
                [0, -1, -p2],
                [p2, 0, 1],
                [-p2, 0, 1],
                [p2, 0, -1],
                [-p2, 0, -1],
                [GOLDEN_RATIO, GOLDEN_RATIO, GOLDEN_RATIO],
                [-GOLDEN_RATIO, GOLDEN_RATIO, GOLDEN_RATIO],
                [GOLDEN_RATIO, -GOLDEN_RATIO, GOLDEN_RATIO],
                [GOLDEN_RATIO, GOLDEN_RATIO, -GOLDEN_RATIO],
                [-GOLDEN_RATIO, -GOLDEN_RATIO, GOLDEN_RATIO],
                [-GOLDEN_RATIO, GOLDEN_RATIO, -GOLDEN_RATIO],
                [GOLDEN_RATIO, -GOLDEN_RATIO, -GOLDEN_RATIO],
                [-GOLDEN_RATIO, -GOLDEN_RATIO, -GOLDEN_RATIO],
            ];
            baseSideLength = 2;
            edges = [
                [0, 1],
                [0, 12],
                [0, 15],
                [1, 13],
                [1, 17],
                [2, 3],
                [2, 14],
                [2, 18],
                [3, 16],
                [3, 19],
                [4, 5],
                [4, 12],
                [4, 13],
                [5, 14],
                [5, 16],
                [6, 7],
                [6, 15],
                [6, 17],
                [7, 18],
                [7, 19],
                [8, 10],
                [8, 12],
                [8, 14],
                [9, 11],
                [9, 13],
                [9, 16],
                [10, 15],
                [10, 18],
                [11, 17],
                [11, 19],
            ];
            break;

        case PlatonicSolidType.Icosahedron:
            // 12 vertices, 30 edges (dual of a dodecahedron)
            baseVertices = [
                [0, 1, GOLDEN_RATIO],
                [0, -1, GOLDEN_RATIO],
                [0, 1, -GOLDEN_RATIO],
                [0, -1, -GOLDEN_RATIO],
                [1, GOLDEN_RATIO, 0],
                [-1, GOLDEN_RATIO, 0],
                [1, -GOLDEN_RATIO, 0],
                [-1, -GOLDEN_RATIO, 0],
                [GOLDEN_RATIO, 0, 1],
                [-GOLDEN_RATIO, 0, 1],
                [GOLDEN_RATIO, 0, -1],
                [-GOLDEN_RATIO, 0, -1],
            ];
            baseSideLength = 2;
            edges = [
                [0, 1],
                [0, 4],
                [0, 5],
                [0, 8],
                [0, 9],
                [1, 6],
                [1, 7],
                [1, 8],
                [1, 9],
                [2, 3],
                [2, 4],
                [2, 5],
                [2, 10],
                [2, 11],
                [3, 6],
                [3, 7],
                [3, 10],
                [3, 11],
                [4, 5],
                [4, 8],
                [4, 10],
                [5, 9],
                [5, 11],
                [6, 7],
                [6, 8],
                [6, 10],
                [7, 9],
                [7, 11],
                [8, 10],
                [9, 11],
            ];
            break;
    }

    const scale = sideLength / baseSideLength;
    const vertices = baseVertices.map((v) => v.map((coord) => coord * scale));

    return { vertices, edges };
}

// also vibecoded
export function generateIcosphere(radius: number, subdivisions: number) {
    subdivisions = Math.max(0, Math.floor(subdivisions));

    // Start with the 12 vertices of a base icosahedron on a unit sphere
    const vertices = [
        [-1, GOLDEN_RATIO, 0],
        [1, GOLDEN_RATIO, 0],
        [-1, -GOLDEN_RATIO, 0],
        [1, -GOLDEN_RATIO, 0],
        [0, -1, GOLDEN_RATIO],
        [0, 1, GOLDEN_RATIO],
        [0, -1, -GOLDEN_RATIO],
        [0, 1, -GOLDEN_RATIO],
        [GOLDEN_RATIO, 0, -1],
        [GOLDEN_RATIO, 0, 1],
        [-GOLDEN_RATIO, 0, -1],
        [-GOLDEN_RATIO, 0, 1],
    ].map((v) => {
        const mag = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
        return [v[0] / mag, v[1] / mag, v[2] / mag];
    });

    // And the 20 triangular faces of the icosahedron
    let faces = [
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],
        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],
        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],
        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1],
    ];

    // --- Subdivision Process ---
    // This is the core logic for creating the icosphere's detail.
    const midpointCache = new Map<string, number>();

    function getMidpointIndex(p1_idx: number, p2_idx: number) {
        // Create a unique key for the edge by sorting vertex indices
        const key = p1_idx < p2_idx ? `${p1_idx},${p2_idx}` : `${p2_idx},${p1_idx}`;

        const cached = midpointCache.get(key)
        if (cached !== undefined) return cached;

        const v1 = vertices[p1_idx];
        const v2 = vertices[p2_idx];

        // Calculate the midpoint and normalize it to project it onto the unit sphere
        const midpoint = [(v1[0] + v2[0]) / 2, (v1[1] + v2[1]) / 2, (v1[2] + v2[2]) / 2];
        const mag = Math.sqrt(midpoint[0] ** 2 + midpoint[1] ** 2 + midpoint[2] ** 2);
        const normalizedMidpoint = [midpoint[0] / mag, midpoint[1] / mag, midpoint[2] / mag];

        // Add the new vertex and store its index in the cache
        const newIndex = vertices.length;
        vertices.push(normalizedMidpoint);
        midpointCache.set(key, newIndex);

        return newIndex;
    }

    for (let i = 0; i < subdivisions; i++) {
        const newFaces = [];
        for (const face of faces) {
            const v1 = face[0];
            const v2 = face[1];
            const v3 = face[2];

            // Get the indices of the new vertices at the midpoints of each edge
            const m12 = getMidpointIndex(v1, v2);
            const m23 = getMidpointIndex(v2, v3);
            const m31 = getMidpointIndex(v3, v1);

            // Replace the single large triangle with four smaller ones
            newFaces.push([v1, m12, m31]);
            newFaces.push([v2, m23, m12]);
            newFaces.push([v3, m31, m23]);
            newFaces.push([m12, m23, m31]); // The central triangle
        }
        faces = newFaces;
    }

    // --- Final Scaling and Edge Generation ---

    // Scale all vertices by the final radius
    if (radius !== 1) {
        for (const v of vertices) {
            v[0] *= radius;
            v[1] *= radius;
            v[2] *= radius;
        }
    }

    // Generate a unique edge list from the final faces
    const edgeSet = new Set<string>();
    for (const face of faces) {
        for (let i = 0; i < 3; i++) {
            const v1 = face[i];
            const v2 = face[(i + 1) % 3];
            const edge = v1 < v2 ? `${v1},${v2}` : `${v2},${v1}`;
            edgeSet.add(edge);
        }
    }
    const edges = Array.from(edgeSet).map((edgeStr) => edgeStr.split(",").map(Number));

    return { vertices, edges };
}
