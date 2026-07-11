import { describe, expect, it } from "vitest";
import { BathroomJsonSchema, CliResultJsonSchema, CliResultSchema } from "./contracts/index.js";

describe("public JSON schemas", () => {
    it("publishes the bathroom schema as an object with room fields", () => {
        expect((BathroomJsonSchema as { type?: string }).type).toBe("object");
        expect(
            Object.keys(
                (BathroomJsonSchema as { properties?: Record<string, unknown> }).properties ?? {},
            ),
        ).toEqual(
            expect.arrayContaining(["id", "name", "width", "depth", "ceilingHeight", "components"]),
        );
    });

    it("publishes the CLI result schema with all documented statuses", () => {
        const raw = CliResultJsonSchema as {
            anyOf?: Array<{ properties?: { status?: { const?: string; enum?: string[] } } }>;
            oneOf?: Array<{ properties?: { status?: { const?: string; enum?: string[] } } }>;
        };
        const variants = raw.anyOf ?? raw.oneOf ?? [];

        const statuses = variants.flatMap((variant) => {
            const status = variant.properties?.status;
            if (!status) {
                return [];
            }
            if (status.const) {
                return [status.const];
            }
            return status.enum ?? [];
        });

        expect(statuses).toEqual(
            expect.arrayContaining(["PASS", "FAIL", "INFORMATION_MISSING", "REVIEW_REQUIRED"]),
        );
    });

    it("validates a representative CLI result envelope", () => {
        const result = CliResultSchema.parse({
            status: "PASS",
            inputPath: "/tmp/input.json",
            output: {
                dxfPath: "/tmp/out/demo.dxf",
                gltfPath: "/tmp/out/demo.gltf",
            },
            metadata: {
                schemaVersion: "v0.1.0",
                generator: "cacad-cli",
                inputSha256: "abc123",
            },
            errors: [],
        });

        expect(result.status).toBe("PASS");
    });

    it("rejects PASS without output and non-PASS with output", () => {
        expect(() =>
            CliResultSchema.parse({
                status: "PASS",
                metadata: {
                    schemaVersion: "v0.1.0",
                    generator: "cacad-cli",
                },
                errors: [],
            }),
        ).toThrow();

        expect(() =>
            CliResultSchema.parse({
                status: "FAIL",
                metadata: {
                    schemaVersion: "v0.1.0",
                    generator: "cacad-cli",
                },
                output: {
                    dxfPath: "/tmp/out/demo.dxf",
                    gltfPath: "/tmp/out/demo.gltf",
                },
                errors: [{ code: "VALIDATION_RULES_FAILED", message: "x" }],
            }),
        ).toThrow();
    });
});
