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

    it("publishes the CLI result schema with the documented statuses", () => {
        const statusSchema = (
            CliResultJsonSchema as {
                properties?: { status?: { enum?: string[] } };
            }
        ).properties?.status;

        expect(statusSchema?.enum).toEqual([
            "PASS",
            "FAIL",
            "INFORMATION_MISSING",
            "REVIEW_REQUIRED",
        ]);
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
});
