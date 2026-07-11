import type { Bathroom } from "../types/bathroom.js";
import { getComponentFootprint } from "../types/component-defaults.js";

// ── glTF 2.0 minimal type definitions ────────────────────────────────────────

interface GltfAsset {
    version: "2.0";
    generator: string;
}

interface GltfScene {
    name: string;
    nodes: number[];
}

interface GltfNode {
    name: string;
    mesh?: number;
    translation?: [number, number, number];
}

interface GltfMesh {
    name: string;
    primitives: GltfPrimitive[];
}

interface GltfPrimitive {
    attributes: { POSITION: number };
    indices: number;
    material: number;
    mode: number;
}

interface GltfBufferView {
    buffer: number;
    byteOffset: number;
    byteLength: number;
    target: number;
}

interface GltfAccessor {
    bufferView: number;
    componentType: number;
    count: number;
    type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4";
    max?: number[];
    min?: number[];
}

interface GltfBuffer {
    byteLength: number;
    uri: string;
}

interface GltfMaterial {
    name: string;
    pbrMetallicRoughness: {
        baseColorFactor: [number, number, number, number];
        metallicFactor: number;
        roughnessFactor: number;
    };
}

export interface GltfDocument {
    asset: GltfAsset;
    scene: number;
    scenes: GltfScene[];
    nodes: GltfNode[];
    meshes: GltfMesh[];
    materials: GltfMaterial[];
    accessors: GltfAccessor[];
    bufferViews: GltfBufferView[];
    buffers: GltfBuffer[];
}

// ── Material palette ──────────────────────────────────────────────────────────

const MATERIALS: GltfMaterial[] = [
    {
        name: "WALLS",
        pbrMetallicRoughness: {
            baseColorFactor: [0.8, 0.8, 0.8, 1.0],
            metallicFactor: 0.0,
            roughnessFactor: 0.9,
        },
    },
    {
        name: "PLUMBING",
        pbrMetallicRoughness: {
            baseColorFactor: [0.2, 0.5, 0.9, 1.0],
            metallicFactor: 0.4,
            roughnessFactor: 0.3,
        },
    },
    {
        name: "ELECTRICAL",
        pbrMetallicRoughness: {
            baseColorFactor: [0.1, 0.8, 0.1, 1.0],
            metallicFactor: 0.0,
            roughnessFactor: 0.7,
        },
    },
    {
        name: "DEFAULT",
        pbrMetallicRoughness: {
            baseColorFactor: [0.6, 0.6, 0.6, 1.0],
            metallicFactor: 0.0,
            roughnessFactor: 0.8,
        },
    },
];

const MATERIAL_INDEX: Record<string, number> = {
    WALLS: 0,
    WC: 1,
    SINK: 1,
    BATHTUB: 1,
    SHOWER: 1,
    OUTLET: 2,
    TOWEL_RAIL: 3,
    MIRROR: 3,
};

// ── Geometry helpers (millimetre → metre conversion) ──────────────────────────

/** Converts mm to metres for glTF (which uses SI units). */
function mm(value: number): number {
    return value / 1_000;
}

/**
 * Builds a box mesh geometry as Float32 vertex data and Uint16 index data.
 * Origin is at the box corner (x=0, y=0, z=0); dimensions are in metres.
 */
function buildBoxGeometry(
    width: number,
    height: number,
    depth: number,
): { vertices: Float32Array; indices: Uint16Array } {
    const w = width;
    const h = height;
    const d = depth;

    // 8 unique vertices of an axis-aligned box
    const positions: number[] = [
        0,
        0,
        0,
        w,
        0,
        0,
        w,
        h,
        0,
        0,
        h,
        0, // front face (z=0)
        0,
        0,
        d,
        w,
        0,
        d,
        w,
        h,
        d,
        0,
        h,
        d, // back face (z=d)
    ];

    // 6 faces × 2 triangles × 3 indices
    const indexData: number[] = [
        0,
        1,
        2,
        0,
        2,
        3, // front
        5,
        4,
        7,
        5,
        7,
        6, // back
        4,
        0,
        3,
        4,
        3,
        7, // left
        1,
        5,
        6,
        1,
        6,
        2, // right
        3,
        2,
        6,
        3,
        6,
        7, // top
        4,
        5,
        1,
        4,
        1,
        0, // bottom
    ];

    return {
        vertices: new Float32Array(positions),
        indices: new Uint16Array(indexData),
    };
}

// ── Buffer builder ────────────────────────────────────────────────────────────

interface BufferChunk {
    data: Uint8Array;
    byteOffset: number;
}

function toBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const nodeBuffer = (
        globalThis as {
            Buffer?: { from: (input: Uint8Array) => { toString: (encoding: string) => string } };
        }
    ).Buffer;
    if (nodeBuffer) {
        return `data:application/octet-stream;base64,${nodeBuffer.from(bytes).toString("base64")}`;
    }

    const parts: string[] = [];
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.byteLength; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        parts.push(String.fromCharCode(...chunk));
    }
    const binary = parts.join("");
    return `data:application/octet-stream;base64,${btoa(binary)}`;
}

// ── glTF document builder ─────────────────────────────────────────────────────

interface ComponentDef {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    materialIndex: number;
}

const COMPONENT_DEFAULT_HEIGHT_MM: Record<string, number> = {
    WC: 500,
    SINK: 200,
    BATHTUB: 500,
    SHOWER: 2_200,
    OUTLET: 30,
    TOWEL_RAIL: 20,
    MIRROR: 800,
};

const WALL_THICKNESS_MM = 150;

/**
 * Generates a glTF 2.0 document from a validated {@link Bathroom}.
 *
 * The model uses SI units (metres). Each bathroom component and the four
 * perimeter walls are represented as box meshes on separate glTF nodes so
 * that renderers such as Three.js can toggle individual layers.
 *
 * @param bathroom - A validated bathroom definition (use `validateBathroom` first).
 * @returns A {@link GltfDocument} that can be serialised to JSON and served
 *          directly to a browser for rendering with Three.js / model-viewer.
 */
export function generateGltf(bathroom: Bathroom): GltfDocument {
    const components: ComponentDef[] = [];

    // ── Room walls ────────────────────────────────────────────────────────────
    const t = WALL_THICKNESS_MM;
    const w = bathroom.width;
    const d = bathroom.depth;
    const wallHeight = bathroom.ceilingHeight;

    // Bottom wall
    components.push({
        name: "wall-bottom",
        x: 0,
        y: 0,
        width: w,
        height: wallHeight,
        depth: t,
        materialIndex: 0,
    });
    // Top wall
    components.push({
        name: "wall-top",
        x: 0,
        y: d - t,
        width: w,
        height: wallHeight,
        depth: t,
        materialIndex: 0,
    });
    // Left wall
    components.push({
        name: "wall-left",
        x: 0,
        y: 0,
        width: t,
        height: wallHeight,
        depth: d,
        materialIndex: 0,
    });
    // Right wall
    components.push({
        name: "wall-right",
        x: w - t,
        y: 0,
        width: t,
        height: wallHeight,
        depth: d,
        materialIndex: 0,
    });

    // ── Fixtures ──────────────────────────────────────────────────────────────
    for (const comp of bathroom.components) {
        const footprint = getComponentFootprint(comp.type, comp.width, comp.depth);
        const defaultHeight = COMPONENT_DEFAULT_HEIGHT_MM[comp.type] ?? 400;
        components.push({
            name: `${comp.type.toLowerCase()}-${comp.id}`,
            x: comp.x,
            y: comp.y,
            width: footprint.width,
            height: defaultHeight,
            depth: footprint.depth,
            materialIndex: MATERIAL_INDEX[comp.type] ?? 3,
        });
    }

    // ── Build binary data ─────────────────────────────────────────────────────
    const chunks: BufferChunk[] = [];
    const accessors: GltfAccessor[] = [];
    const bufferViews: GltfBufferView[] = [];
    const meshes: GltfMesh[] = [];
    const nodes: GltfNode[] = [];
    let byteOffset = 0;

    for (const comp of components) {
        const { vertices, indices } = buildBoxGeometry(
            mm(comp.width),
            mm(comp.height),
            mm(comp.depth),
        );

        const vertexBytes = vertices.buffer as ArrayBuffer;
        const indexBytes = indices.buffer as ArrayBuffer;

        const vertexViewIndex = bufferViews.length;
        bufferViews.push({
            buffer: 0,
            byteOffset,
            byteLength: vertexBytes.byteLength,
            target: 34962,
        });
        chunks.push({ data: new Uint8Array(vertexBytes), byteOffset });
        byteOffset += vertexBytes.byteLength;

        const indexViewIndex = bufferViews.length;
        bufferViews.push({
            buffer: 0,
            byteOffset,
            byteLength: indexBytes.byteLength,
            target: 34963,
        });
        chunks.push({ data: new Uint8Array(indexBytes), byteOffset });
        byteOffset += indexBytes.byteLength;

        const posAccessorIndex = accessors.length;
        accessors.push({
            bufferView: vertexViewIndex,
            componentType: 5126, // FLOAT
            count: vertices.length / 3,
            type: "VEC3",
            min: [0, 0, 0],
            max: [mm(comp.width), mm(comp.height), mm(comp.depth)],
        });

        const idxAccessorIndex = accessors.length;
        accessors.push({
            bufferView: indexViewIndex,
            componentType: 5123, // UNSIGNED_SHORT
            count: indices.length,
            type: "SCALAR",
        });

        const meshIndex = meshes.length;
        meshes.push({
            name: comp.name,
            primitives: [
                {
                    attributes: { POSITION: posAccessorIndex },
                    indices: idxAccessorIndex,
                    material: comp.materialIndex,
                    mode: 4, // TRIANGLES
                },
            ],
        });

        nodes.push({
            name: comp.name,
            mesh: meshIndex,
            translation: [mm(comp.x), 0, mm(comp.y)],
        });
    }

    // ── Merge binary chunks into a single buffer ──────────────────────────────
    const combined = new Uint8Array(byteOffset);
    for (const chunk of chunks) {
        combined.set(chunk.data, chunk.byteOffset);
    }

    return {
        asset: { version: "2.0", generator: "cacad/draw3d" },
        scene: 0,
        scenes: [{ name: bathroom.name, nodes: nodes.map((_, i) => i) }],
        nodes,
        meshes,
        materials: MATERIALS,
        accessors,
        bufferViews,
        buffers: [{ byteLength: byteOffset, uri: toBase64(combined.buffer) }],
    };
}
