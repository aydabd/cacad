#!/usr/bin/env node

import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ZodError } from "zod";
import { generateDxf } from "./generators/draw2d.js";
import { generateGltf } from "./generators/draw3d.js";
import { BbrValidationError, validateBathroom } from "./validators/bbr.js";

export type CliStatus = "PASS" | "FAIL" | "INFORMATION_MISSING" | "REVIEW_REQUIRED";

export interface CliOptions {
    inputPath: string;
    outDir: string;
    filePrefix: string;
    reportPath: string;
}

interface CliError {
    code: string;
    message: string;
}

export interface CliResult {
    status: CliStatus;
    inputPath?: string;
    output?: {
        dxfPath: string;
        gltfPath: string;
    };
    metadata: {
        schemaVersion: string;
        generator: string;
        inputSha256?: string;
    };
    errors: CliError[];
}

const SCHEMA_VERSION = "v0.1.0";

function printHelp(): string {
    return [
        "cacad - synthetic CAD artifact generator",
        "",
        "Usage:",
        "  cacad --input <path> [--out-dir <dir>] [--prefix <name>] [--report <path>]",
        "",
        "Options:",
        "  --input   Path to input bathroom JSON (required)",
        "  --out-dir Output directory for artifacts (default: artifacts)",
        "  --prefix  Output file name prefix (default: bathroom)",
        "  --report  Path to result JSON report (default: <out-dir>/report.json)",
        "  --help    Show this message",
    ].join("\n");
}

function isFlagToken(value: string | undefined): boolean {
    return value === undefined || value.startsWith("--");
}

export function parseArgs(args: string[]): CliOptions | null {
    if (args.includes("--help") || args.includes("-h")) {
        return null;
    }

    const getValue = (flag: string): string | undefined => {
        const index = args.indexOf(flag);
        if (index < 0) {
            return undefined;
        }
        const value = args[index + 1];
        if (isFlagToken(value)) {
            return undefined;
        }
        return value;
    };

    const inputPath = getValue("--input");
    if (!inputPath) {
        throw new Error("Missing required option: --input <path>");
    }

    const outDir = getValue("--out-dir") ?? "artifacts";
    const filePrefix = getValue("--prefix") ?? "bathroom";
    const reportPath = getValue("--report") ?? join(outDir, "report.json");

    return {
        inputPath,
        outDir,
        filePrefix,
        reportPath,
    };
}

function sha256(content: string): string {
    return createHash("sha256").update(content).digest("hex");
}

function buildBaseResult(): CliResult {
    return {
        status: "REVIEW_REQUIRED",
        metadata: {
            schemaVersion: SCHEMA_VERSION,
            generator: "cacad-cli",
        },
        errors: [],
    };
}

async function writeReport(reportPath: string, result: CliResult): Promise<void> {
    const resolved = resolve(reportPath);
    await mkdir(dirname(resolved), { recursive: true });
    await writeFile(resolved, JSON.stringify(result, null, 2), "utf8");
}

export async function runCli(argv: string[]): Promise<{ exitCode: number; result: CliResult }> {
    let options: CliOptions;
    try {
        const parsed = parseArgs(argv);
        if (!parsed) {
            const help = printHelp();
            return {
                exitCode: 0,
                result: {
                    ...buildBaseResult(),
                    status: "REVIEW_REQUIRED",
                    errors: [{ code: "HELP", message: help }],
                },
            };
        }
        options = parsed;
    } catch (error) {
        return {
            exitCode: 2,
            result: {
                ...buildBaseResult(),
                status: "INFORMATION_MISSING",
                errors: [{ code: "CLI_ARGUMENT_ERROR", message: (error as Error).message }],
            },
        };
    }

    const result = buildBaseResult();
    const absoluteInput = resolve(options.inputPath);
    result.inputPath = absoluteInput;

    try {
        const rawInput = await readFile(absoluteInput, "utf8");
        result.metadata.inputSha256 = sha256(rawInput);

        const input = JSON.parse(rawInput) as unknown;
        const bathroom = validateBathroom(input);

        const dxf = generateDxf(bathroom);
        const gltf = JSON.stringify(generateGltf(bathroom), null, 2);

        await mkdir(options.outDir, { recursive: true });

        const dxfPath = resolve(options.outDir, `${options.filePrefix}.dxf`);
        const gltfPath = resolve(options.outDir, `${options.filePrefix}.gltf`);

        await writeFile(dxfPath, dxf, "utf8");
        await writeFile(gltfPath, gltf, "utf8");

        result.status = "PASS";
        result.output = {
            dxfPath,
            gltfPath,
        };

        await writeReport(options.reportPath, result);

        return { exitCode: 0, result };
    } catch (error) {
        if (error instanceof BbrValidationError) {
            result.status = "FAIL";
            result.errors.push({
                code: "VALIDATION_RULES_FAILED",
                message: error.message,
            });
        } else if (error instanceof ZodError) {
            result.status = "INFORMATION_MISSING";
            result.errors.push({
                code: "INPUT_SCHEMA_INVALID",
                message: error.message,
            });
        } else if (error instanceof SyntaxError) {
            result.status = "INFORMATION_MISSING";
            result.errors.push({
                code: "INPUT_JSON_INVALID",
                message: error.message,
            });
        } else {
            result.status = "REVIEW_REQUIRED";
            result.errors.push({
                code: "UNEXPECTED_ERROR",
                message: error instanceof Error ? error.message : String(error),
            });
        }

        await writeReport(options.reportPath, result);

        return { exitCode: 2, result };
    }
}

async function main(): Promise<void> {
    const { exitCode, result } = await runCli(process.argv.slice(2));

    if (result.errors[0]?.code === "HELP") {
        // Help text is stored in error message to keep a single result shape.
        process.stdout.write(`${result.errors[0].message}\n`);
        process.exit(0);
    }

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exit(exitCode);
}

const entryFile = process.argv[1];
if (entryFile && realpathSync(entryFile) === fileURLToPath(import.meta.url)) {
    void main();
}
