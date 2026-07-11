import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { BbrValidationError, validateBathroom } from "./bbr.js";

// ── Shared fixtures ───────────────────────────────────────────────────────────

/** A compliant bathroom that passes all BBR checks. */
const compliantBathroom = {
    id: "bath-01",
    name: "Main Bathroom",
    width: 2_400,
    depth: 1_800,
    ceilingHeight: 2_400,
    components: [
        { id: "wc-01", type: "WC", x: 300, y: 300, width: 400, depth: 700 },
        { id: "sink-01", type: "SINK", x: 900, y: 200, width: 500, depth: 400 },
        { id: "outlet-01", type: "OUTLET", x: 900, y: 900 },
    ],
};

// ── Schema validation (Zod) ───────────────────────────────────────────────────

describe("validateBathroom — schema validation", () => {
    it("returns a typed Bathroom for a valid input", () => {
        const result = validateBathroom(compliantBathroom);
        expect(result.id).toBe("bath-01");
        expect(result.components).toHaveLength(3);
    });

    it("throws ZodError when required fields are missing", () => {
        expect(() => validateBathroom({})).toThrow(ZodError);
    });

    it("throws ZodError when ceilingHeight is negative", () => {
        expect(() => validateBathroom({ ...compliantBathroom, ceilingHeight: -100 })).toThrow(
            ZodError,
        );
    });

    it("throws ZodError when width is zero", () => {
        expect(() => validateBathroom({ ...compliantBathroom, width: 0 })).toThrow(ZodError);
    });

    it("throws ZodError when components array is empty", () => {
        expect(() => validateBathroom({ ...compliantBathroom, components: [] })).toThrow(ZodError);
    });

    it("throws ZodError for an unknown component type", () => {
        const badComponent = { id: "x-01", type: "JACUZZI", x: 0, y: 0 };
        expect(() =>
            validateBathroom({
                ...compliantBathroom,
                components: [badComponent],
            }),
        ).toThrow(ZodError);
    });
});

// ── BBR §3:22 — Ceiling height ────────────────────────────────────────────────

describe("validateBathroom — BBR §3:22 ceiling height", () => {
    it("passes when ceiling height equals the minimum 2 100 mm", () => {
        const result = validateBathroom({
            ...compliantBathroom,
            ceilingHeight: 2_100,
        });
        expect(result.ceilingHeight).toBe(2_100);
    });

    it("throws BbrValidationError when ceiling height is below 2 100 mm", () => {
        expect(() => validateBathroom({ ...compliantBathroom, ceilingHeight: 2_099 })).toThrow(
            BbrValidationError,
        );
    });

    it("includes the BBR §3:22 rule reference in the violation", () => {
        try {
            validateBathroom({ ...compliantBathroom, ceilingHeight: 1_800 });
        } catch (error) {
            expect(error).toBeInstanceOf(BbrValidationError);
            const bbrError = error as BbrValidationError;
            expect(bbrError.violations[0]?.rule).toBe("BBR §3:22");
            expect(bbrError.violations[0]?.actual).toBe(1_800);
            expect(bbrError.violations[0]?.required).toBe(2_100);
        }
    });
});

// ── BBR §3:146 — Electrical outlet distance from water sources ────────────────

describe("validateBathroom — BBR §3:146 outlet-to-water distance", () => {
    it("passes when outlet is exactly 600 mm from a sink", () => {
        const bathroom = {
            ...compliantBathroom,
            components: [
                { id: "sink-01", type: "SINK", x: 0, y: 0 },
                { id: "outlet-01", type: "OUTLET", x: 600, y: 0 },
            ],
        };
        const result = validateBathroom(bathroom);
        expect(result.components).toHaveLength(2);
    });

    it("throws BbrValidationError when outlet is less than 600 mm from a sink", () => {
        const bathroom = {
            ...compliantBathroom,
            components: [
                { id: "sink-01", type: "SINK", x: 0, y: 0 },
                { id: "outlet-01", type: "OUTLET", x: 500, y: 0 },
            ],
        };
        expect(() => validateBathroom(bathroom)).toThrow(BbrValidationError);
    });

    it("reports the measured distance and minimum in the violation", () => {
        const bathroom = {
            ...compliantBathroom,
            components: [
                { id: "sink-01", type: "SINK", x: 0, y: 0 },
                { id: "outlet-01", type: "OUTLET", x: 400, y: 0 },
            ],
        };
        try {
            validateBathroom(bathroom);
        } catch (error) {
            expect(error).toBeInstanceOf(BbrValidationError);
            const bbrError = error as BbrValidationError;
            const violation = bbrError.violations[0];
            expect(violation?.rule).toBe("BBR §3:146");
            expect(violation?.actual).toBe(400);
            expect(violation?.required).toBe(600);
        }
    });

    it("throws BbrValidationError when outlet is too close to a bathtub", () => {
        const bathroom = {
            ...compliantBathroom,
            components: [
                { id: "bath-01", type: "BATHTUB", x: 0, y: 0 },
                { id: "outlet-01", type: "OUTLET", x: 300, y: 0 },
            ],
        };
        expect(() => validateBathroom(bathroom)).toThrow(BbrValidationError);
    });

    it("throws BbrValidationError when outlet is too close to a shower", () => {
        const bathroom = {
            ...compliantBathroom,
            components: [
                { id: "shower-01", type: "SHOWER", x: 0, y: 0 },
                { id: "outlet-01", type: "OUTLET", x: 200, y: 100 },
            ],
        };
        expect(() => validateBathroom(bathroom)).toThrow(BbrValidationError);
    });

    it("passes when there are no outlets in the room", () => {
        const bathroom = {
            ...compliantBathroom,
            components: [
                { id: "wc-01", type: "WC", x: 300, y: 300 },
                { id: "sink-01", type: "SINK", x: 900, y: 200 },
            ],
        };
        const result = validateBathroom(bathroom);
        expect(result).toBeDefined();
    });
});

// ── BBR §3:225 — Wheelchair turning circle ────────────────────────────────────

describe("validateBathroom — BBR §3:225 wheelchair turning circle", () => {
    it("passes when room is exactly 1 300 mm × 1 300 mm", () => {
        const bathroom = {
            ...compliantBathroom,
            width: 1_300,
            depth: 1_300,
        };
        const result = validateBathroom(bathroom);
        expect(result.width).toBe(1_300);
    });

    it("throws BbrValidationError when width is below 1 300 mm", () => {
        expect(() => validateBathroom({ ...compliantBathroom, width: 1_200 })).toThrow(
            BbrValidationError,
        );
    });

    it("throws BbrValidationError when depth is below 1 300 mm", () => {
        expect(() => validateBathroom({ ...compliantBathroom, depth: 1_200 })).toThrow(
            BbrValidationError,
        );
    });

    it("reports both width and depth violations when both are too small", () => {
        try {
            validateBathroom({ ...compliantBathroom, width: 1_000, depth: 1_000 });
        } catch (error) {
            expect(error).toBeInstanceOf(BbrValidationError);
            const bbrError = error as BbrValidationError;
            const rules = bbrError.violations.map((v) => v.rule);
            expect(rules.filter((r) => r === "BBR §3:225")).toHaveLength(2);
        }
    });
});

// ── Multiple simultaneous violations ─────────────────────────────────────────

describe("validateBathroom — multiple violations", () => {
    it("collects all violations in a single error", () => {
        const bathroom = {
            ...compliantBathroom,
            ceilingHeight: 1_800,
            width: 1_000,
            depth: 1_000,
            components: [
                { id: "sink-01", type: "SINK", x: 0, y: 0 },
                { id: "outlet-01", type: "OUTLET", x: 100, y: 0 },
            ],
        };
        try {
            validateBathroom(bathroom);
        } catch (error) {
            expect(error).toBeInstanceOf(BbrValidationError);
            const bbrError = error as BbrValidationError;
            expect(bbrError.violations.length).toBeGreaterThanOrEqual(3);
        }
    });
});
