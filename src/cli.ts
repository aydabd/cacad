#!/usr/bin/env node

import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ZodError } from "zod";
import type { CliResult } from "./contracts/cli.js";
import { generateDxf } from "./generators/draw2d.js";
import { generateGltf } from "./generators/draw3d.js";
import { BbrValidationError, validateBathroom } from "./validators/bbr.js";

export type { CliError, CliMetadata, CliOutput, CliResult, CliStatus } from "./contracts/cli.js";

export interface CliOptions {
    inputPath: string;
    outDir: string;
    filePrefix: string;
    reportPath: string;
}

type CliPassResult = Extract<CliResult, { status: "PASS" }>;
type CliNonPassResult = Exclude<CliResult, { status: "PASS" }>;
type CliNonPassStatus = CliNonPassResult["status"];

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

function normalizePrefix(prefix: string): string {
    if (prefix.trim().length === 0) {
        throw new Error("Missing required option value: --prefix <name>");
    }

    if (prefix.includes("/") || prefix.includes("\\")) {
        throw new Error("Invalid --prefix value: path separators are not allowed");
    }

    return prefix;
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
            throw new Error(`Missing required option value: ${flag} <value>`);
        }
        return value;
    };

    const inputPath = getValue("--input");
    if (!inputPath) {
        throw new Error("Missing required option: --input <path>");
    }

    const outDir = getValue("--out-dir") ?? "artifacts";
    const filePrefix = normalizePrefix(getValue("--prefix") ?? "bathroom");
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

function buildResultBase(inputPath?: string): {
    inputPath?: string;
    metadata: CliResult["metadata"];
    errors: CliResult["errors"];
} {
    const base = {
        metadata: {
            schemaVersion: SCHEMA_VERSION,
            generator: "cacad-cli",
        },
        errors: [],
    };

    if (inputPath === undefined) {
        return base;
    }

    return {
        ...base,
        inputPath,
    };
}

function buildPassResult(
    base: ReturnType<typeof buildResultBase>,
    output: CliPassResult["output"],
): CliPassResult {
    return {
        ...base,
        status: "PASS",
        output,
    };
}

function buildNonPassResult(
    base: ReturnType<typeof buildResultBase>,
    status: CliNonPassStatus,
    errors: CliResult["errors"],
): CliNonPassResult {
    return {
        ...base,
        status,
        errors,
    };
}

async function writeReport(reportPath: string, result: CliResult): Promise<void> {
    const resolved = resolve(reportPath);
    await mkdir(dirname(resolved), { recursive: true });
    await writeFile(resolved, JSON.stringify(result, null, 2), "utf8");
}

async function writeReportBestEffort(reportPath: string, result: CliResult): Promise<void> {
    try {
        await writeReport(reportPath, result);
    } catch (error) {
        // Report output is best-effort and must not break CLI result emission.
        result.errors.push({
            code: "REPORT_WRITE_FAILED",
            message:
                error instanceof Error
                    ? `Report could not be written to ${resolve(reportPath)}: ${error.message}`
                    : `Report could not be written to ${resolve(reportPath)}`,
        });
    }
}

export async function runCli(argv: string[]): Promise<{ exitCode: number; result: CliResult }> {
    let options: CliOptions;
    try {
        const parsed = parseArgs(argv);
        if (!parsed) {
            const help = printHelp();
            const base = buildResultBase();
            return {
                exitCode: 0,
                result: buildNonPassResult(base, "REVIEW_REQUIRED", [
                    { code: "HELP", message: help },
                ]),
            };
        }
        options = parsed;
    } catch (error) {
        const base = buildResultBase();
        return {
            exitCode: 2,
            result: buildNonPassResult(base, "INFORMATION_MISSING", [
                { code: "CLI_ARGUMENT_ERROR", message: (error as Error).message },
            ]),
        };
    }

    const absoluteInput = resolve(options.inputPath);
    const base = buildResultBase(absoluteInput);

    try {
        const rawInput = await readFile(absoluteInput, "utf8");
        base.metadata.inputSha256 = sha256(rawInput);

        const input = JSON.parse(rawInput) as unknown;
        const bathroom = validateBathroom(input);

        const dxf = generateDxf(bathroom);
        const gltf = JSON.stringify(generateGltf(bathroom), null, 2);

        await mkdir(options.outDir, { recursive: true });

        const dxfPath = resolve(options.outDir, `${options.filePrefix}.dxf`);
        const gltfPath = resolve(options.outDir, `${options.filePrefix}.gltf`);

        await writeFile(dxfPath, dxf, "utf8");
        await writeFile(gltfPath, gltf, "utf8");

        const result = buildPassResult(base, {
            dxfPath,
            gltfPath,
        });

        await writeReportBestEffort(options.reportPath, result);

        return { exitCode: 0, result };
    } catch (error) {
        const errors: CliResult["errors"] = [];
        let status: CliNonPassStatus = "REVIEW_REQUIRED";

        if (error instanceof BbrValidationError) {
            status = "FAIL";
            errors.push({
                code: "VALIDATION_RULES_FAILED",
                message: error.message,
            });
        } else if (
            error instanceof Error &&
            "code" in error &&
            (error.code === "ENOENT" || error.code === "EISDIR")
        ) {
            status = "INFORMATION_MISSING";
            errors.push({
                code: "INPUT_FILE_NOT_FOUND",
                message: `Input file could not be read: ${absoluteInput}`,
            });
        } else if (error instanceof ZodError) {
            status = "INFORMATION_MISSING";
            errors.push({
                code: "INPUT_SCHEMA_INVALID",
                message: error.message,
            });
        } else if (error instanceof SyntaxError) {
            status = "INFORMATION_MISSING";
            errors.push({
                code: "INPUT_JSON_INVALID",
                message: error.message,
            });
        } else {
            status = "REVIEW_REQUIRED";
            errors.push({
                code: "UNEXPECTED_ERROR",
                message: error instanceof Error ? error.message : String(error),
            });
        }

        const result = buildNonPassResult(base, status, errors);

        await writeReportBestEffort(options.reportPath, result);

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
