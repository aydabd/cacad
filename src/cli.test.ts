import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runCli } from "./cli.js";
import { CliResultSchema } from "./contracts/cli.js";

describe("runCli", () => {
    it("returns HELP for --help", async () => {
        const { exitCode, result } = await runCli(["--help"]);

        expect(exitCode).toBe(0);
        expect(result.errors[0]?.code).toBe("HELP");
        expect(result.errors[0]?.message).toContain("Usage:");
    });

    it("returns CLI_ARGUMENT_ERROR when --input is missing", async () => {
        const { exitCode, result } = await runCli(["--out-dir", "artifacts"]);

        expect(exitCode).toBe(2);
        expect(result.status).toBe("INFORMATION_MISSING");
        expect(result.errors[0]?.code).toBe("CLI_ARGUMENT_ERROR");
    });

    it("returns INPUT_JSON_INVALID for malformed JSON input", async () => {
        const dir = await mkdtemp(join(tmpdir(), "cacad-cli-json-"));
        const inputPath = join(dir, "input.json");
        const reportPath = join(dir, "result.json");

        await writeFile(inputPath, "{ not-json", "utf8");

        const { exitCode, result } = await runCli(["--input", inputPath, "--report", reportPath]);

        expect(exitCode).toBe(2);
        expect(result.status).toBe("INFORMATION_MISSING");
        expect(result.errors[0]?.code).toBe("INPUT_JSON_INVALID");
    });

    it("returns CLI_ARGUMENT_ERROR when --prefix contains path separators", async () => {
        const dir = await mkdtemp(join(tmpdir(), "cacad-cli-prefix-"));
        const inputPath = join(dir, "input.json");
        await writeFile(
            inputPath,
            JSON.stringify({
                id: "bath-01",
                name: "Main Bathroom",
                width: 2400,
                depth: 1800,
                ceilingHeight: 2400,
                components: [{ id: "wc-01", type: "WC", x: 300, y: 300 }],
            }),
            "utf8",
        );

        const { exitCode, result } = await runCli(["--input", inputPath, "--prefix", "../pwn"]);

        expect(exitCode).toBe(2);
        expect(result.status).toBe("INFORMATION_MISSING");
        expect(result.errors[0]?.code).toBe("CLI_ARGUMENT_ERROR");
    });

    it("returns INPUT_FILE_NOT_FOUND when the input file is missing", async () => {
        const dir = await mkdtemp(join(tmpdir(), "cacad-cli-missing-"));
        const inputPath = join(dir, "missing.json");
        const reportPath = join(dir, "result.json");

        const { exitCode, result } = await runCli(["--input", inputPath, "--report", reportPath]);

        expect(exitCode).toBe(2);
        expect(result.status).toBe("INFORMATION_MISSING");
        expect(result.errors[0]?.code).toBe("INPUT_FILE_NOT_FOUND");
    });

    it("returns PASS and writes DXF, glTF, and report files for valid input", async () => {
        const dir = await mkdtemp(join(tmpdir(), "cacad-cli-pass-"));
        const inputPath = join(dir, "input.json");
        const outDir = join(dir, "out");
        const reportPath = join(dir, "result.json");

        const input = {
            id: "bath-01",
            name: "Main Bathroom",
            width: 2400,
            depth: 1800,
            ceilingHeight: 2400,
            components: [
                { id: "wc-01", type: "WC", x: 300, y: 300 },
                { id: "sink-01", type: "SINK", x: 900, y: 200 },
                { id: "outlet-01", type: "OUTLET", x: 1600, y: 900 },
            ],
        };

        await writeFile(inputPath, JSON.stringify(input, null, 2), "utf8");

        const { exitCode, result } = await runCli([
            "--input",
            inputPath,
            "--out-dir",
            outDir,
            "--prefix",
            "phase2",
            "--report",
            reportPath,
        ]);

        expect(exitCode).toBe(0);
        expect(result.status).toBe("PASS");
        expect(result.output?.dxfPath).toContain("phase2.dxf");
        expect(result.output?.gltfPath).toContain("phase2.gltf");

        expect(result.output).toBeDefined();
        if (!result.output) {
            throw new Error("Expected output paths for PASS status");
        }

        expect(() => CliResultSchema.parse(result)).not.toThrow();

        const dxf = await readFile(result.output.dxfPath, "utf8");
        const gltf = await readFile(result.output.gltfPath, "utf8");
        const report = await readFile(reportPath, "utf8");

        expect(dxf).toContain("SECTION");
        expect(gltf).toContain('"asset"');
        expect(report).toContain('"status": "PASS"');
    });

    it("returns INFORMATION_MISSING for schema-invalid input", async () => {
        const dir = await mkdtemp(join(tmpdir(), "cacad-cli-invalid-"));
        const inputPath = join(dir, "input.json");
        const reportPath = join(dir, "result.json");

        await writeFile(inputPath, JSON.stringify({ name: "missing fields" }), "utf8");

        const { exitCode, result } = await runCli(["--input", inputPath, "--report", reportPath]);

        expect(exitCode).toBe(2);
        expect(result.status).toBe("INFORMATION_MISSING");
        expect(result.errors[0]?.code).toBe("INPUT_SCHEMA_INVALID");
    });

    it("returns FAIL for synthetic rule violations", async () => {
        const dir = await mkdtemp(join(tmpdir(), "cacad-cli-fail-"));
        const inputPath = join(dir, "input.json");
        const reportPath = join(dir, "result.json");

        const input = {
            id: "bath-02",
            name: "Too Small Bathroom",
            width: 1000,
            depth: 1000,
            ceilingHeight: 1800,
            components: [
                { id: "sink-01", type: "SINK", x: 0, y: 0 },
                { id: "outlet-01", type: "OUTLET", x: 100, y: 0 },
            ],
        };

        await writeFile(inputPath, JSON.stringify(input, null, 2), "utf8");

        const { exitCode, result } = await runCli(["--input", inputPath, "--report", reportPath]);

        expect(exitCode).toBe(2);
        expect(result.status).toBe("FAIL");
        expect(result.errors[0]?.code).toBe("VALIDATION_RULES_FAILED");
    });
});
