import { describe, expect, it } from "vitest";
import type { Bathroom } from "../types/bathroom.js";
import { generateDxf } from "./draw2d.js";

const bathroomFixture: Bathroom = {
    id: "bath-2d-01",
    name: "Test Bathroom 2D",
    width: 2_400,
    depth: 1_800,
    ceilingHeight: 2_400,
    components: [
        { id: "wc-01", type: "WC", x: 200, y: 200 },
        { id: "sink-01", type: "SINK", x: 800, y: 200 },
        { id: "outlet-01", type: "OUTLET", x: 1_500, y: 900 },
    ],
};

describe("generateDxf", () => {
    it("returns a non-empty DXF document", () => {
        const dxf = generateDxf(bathroomFixture);

        expect(dxf.length).toBeGreaterThan(0);
        expect(dxf).toContain("SECTION");
        expect(dxf).toContain("ENTITIES");
    });

    it("includes expected CAD layers", () => {
        const dxf = generateDxf(bathroomFixture);

        expect(dxf).toContain("WALLS");
        expect(dxf).toContain("WINDOWS");
        expect(dxf).toContain("ELECTRICAL");
        expect(dxf).toContain("PLUMBING");
        expect(dxf).toContain("ANNOTATIONS");
    });

    it("draws the room outline with the fixture dimensions", () => {
        const dxf = generateDxf(bathroomFixture);

        expect(dxf).toContain("2400");
        expect(dxf).toContain("1800");
    });

    it("adds outlet safety zone circles to visualize the BBR 600 mm rule", () => {
        const dxf = generateDxf(bathroomFixture);

        expect(dxf).toContain("CIRCLE");
        expect(dxf).toContain("600");
    });
});
