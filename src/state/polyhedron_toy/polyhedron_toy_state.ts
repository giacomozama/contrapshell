import { cava } from "../cava/cava_state";
import { eyeCandyConfig } from "../eye_candy/eye_candy_state";
import { mediaState } from "../media/media_state";
import { MediaStatus } from "../media/types";
import { generateIcosphere } from "./polyhedron_toy_geometry";

const scale = 85;
const wobbleSpeed = 4;
const wobbleFactor = 0.2;

const { vertices, edges } = generateIcosphere(2.5, 1);
// const { vertices, edges } = generatePlatonicSolid(PlatonicSolidType.Dodecahedron, 2);

const projectionMatrix = [
    [1, 0, 0],
    [0, 1, 0],
];

const xRotMat = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
];

const yRotMat = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
];

const chaos = vertices.map(() => Math.random() * 2 * Math.PI);

const baseRho = (() => {
    const [x, y, z] = vertices[0];
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
})();

const adaptedCavaValues = new Array(vertices.length).map(() => 0);

function getAdaptedCavaValues() {
    const original = cava?.get_values();
    if (!original) return;

    if (original.length < vertices.length) {
        const chunkSize = Math.ceil(vertices.length / original.length);
        for (let i = 0; i < vertices.length; i++) {
            adaptedCavaValues[i] = original[Math.floor(i / chunkSize)];
        }
    } else {
        const chunkSize = Math.floor(original.length / vertices.length);

        for (let i = 0; i < vertices.length; i++) {
            let sum = 0;
            for (let j = 0; j < chunkSize; j++) {
                sum += original[i * chunkSize + j];
            }
            adaptedCavaValues[i] = sum / chunkSize;
        }
    }

    return adaptedCavaValues;
}

const rotatedPoints1 = [0, 0, 0];
const rotatedPoints2 = [0, 0, 0];

function matMul(m: number[][], point: number[], output: number[]) {
    const row = m.length;
    const col = m[0].length;

    output.fill(0);

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            output[i] += m[i][j] * point[j];
        }
    }
}

export function projectPoints(screenWidth: number, screenHeight: number, time: number) {
    const angleX = (time / 8_000_000) % (Math.PI * 2);
    const angleY = (time / 24_000_000) % (Math.PI * 2);

    const cavaValues =
        eyeCandyConfig.get().polyhedronToyCavaEnabled && mediaState.status.get() === MediaStatus.Playing
            ? getAdaptedCavaValues()
            : undefined;

    for (let i = 0; i < vertices.length; i++) {
        const vert = vertices[i];
        const [x, y, z] = vert;
        let r = Math.sqrt(x * x + y * y + z * z);
        const phi = Math.atan2(y, x);
        const theta = Math.acos(z / r);

        const displ = cavaValues
            ? Math.min(cavaValues[i] * 5 * wobbleFactor, 2)
            : Math.sin((angleX + chaos[i]) * 3 * wobbleSpeed) * wobbleFactor;

        r = baseRho + displ;

        vert[0] = r * Math.sin(theta) * Math.cos(phi);
        vert[1] = r * Math.sin(theta) * Math.sin(phi);
        vert[2] = r * Math.cos(theta);
    }

    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    xRotMat[1][1] = cosX;
    xRotMat[1][2] = -sinX;
    xRotMat[2][1] = sinX;
    xRotMat[2][2] = cosX;

    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    yRotMat[0][0] = cosY;
    yRotMat[0][2] = -sinY;
    yRotMat[2][0] = sinY;
    yRotMat[2][2] = cosY;

    for (let i = 0; i < vertices.length; i++) {
        matMul(xRotMat, vertices[i], rotatedPoints1);
        matMul(yRotMat, rotatedPoints1, rotatedPoints2);

        rotatedPoints2[0] *= scale;
        rotatedPoints2[1] *= scale;
        rotatedPoints2[2] *= scale;

        matMul(projectionMatrix, rotatedPoints2, projected2d[i]);
        projected2d[i][0] += screenWidth / 2;
        projected2d[i][1] += screenHeight / 2;
    }
}

export const projected2d: number[][] = new Array(vertices.length).fill(0).map(() => new Array(2).fill(0));

export { edges };
