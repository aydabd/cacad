import { describe, expect, it } from "vitest";
import type { Bathroom } from "../types/bathroom.js";
import { generateGltf } from "./draw3d.js";

const bathroomFixture: Bathroom = {
    id: "bath-3d-01",
    name: "Test Bathroom 3D",
    width: 2_400,
    depth: 1_800,
    ceilingHeight: 2_400,
    components: [
        { id: "wc-01", type: "WC", x: 200, y: 200 },
        { id: "sink-01", type: "SINK", x: 800, y: 200 },
        { id: "outlet-01", type: "OUTLET", x: 1_500, y: 900 },
    ],
};

describe("generateGltf", () => {
    it("returns a glTF 2.0 document with a single scene", () => {
        const gltf = generateGltf(bathroomFixture);

        expect(gltf.asset.version).toBe("2.0");
        expect(gltf.scene).toBe(0);
        expect(gltf.scenes).toHaveLength(1);
        expect(gltf.scenes[0]?.name).toBe("Test Bathroom 3D");
    });

    it("creates nodes and meshes for walls and fixtures", () => {
        const gltf = generateGltf(bathroomFixture);

        // 4 perimeter walls + 3 fixtures
        expect(gltf.nodes).toHaveLength(7);
        expect(gltf.meshes).toHaveLength(7);
        expect(gltf.nodes.every((node) => typeof node.mesh === "number")).toBe(true);
    });

    it("includes material palette entries required by the CAD pipeline", () => {
        const gltf = generateGltf(bathroomFixture);
        const materialNames = gltf.materials.map((material) => material.name);

        expect(materialNames).toContain("WALLS");
        expect(materialNames).toContain("PLUMBING");
        expect(materialNames).toContain("ELECTRICAL");
        expect(materialNames).toContain("DEFAULT");
    });

    it("embeds a base64 binary buffer for a self-contained artifact", () => {
        const gltf = generateGltf(bathroomFixture);

        expect(gltf.buffers).toHaveLength(1);
        expect(gltf.buffers[0]?.byteLength).toBeGreaterThan(0);
        expect(gltf.buffers[0]?.uri).toMatch(/^data:application\/octet-stream;base64,/);
    });
});
