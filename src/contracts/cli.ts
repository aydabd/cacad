import { toJSONSchema, z } from "zod";

export const CliStatusSchema = z.enum(["PASS", "FAIL", "INFORMATION_MISSING", "REVIEW_REQUIRED"]);

export const CliErrorSchema = z.object({
    code: z.string().min(1),
    message: z.string().min(1),
});

export const CliOutputSchema = z.object({
    dxfPath: z.string().min(1),
    gltfPath: z.string().min(1),
});

export const CliMetadataSchema = z.object({
    schemaVersion: z.string().min(1),
    generator: z.string().min(1),
    inputSha256: z.string().min(1).optional(),
});

const CliResultBaseSchema = z.object({
    inputPath: z.string().min(1).optional(),
    metadata: CliMetadataSchema,
    errors: z.array(CliErrorSchema),
});

const CliPassResultSchema = CliResultBaseSchema.extend({
    status: z.literal("PASS"),
    output: CliOutputSchema,
});

const CliNonPassResultSchema = CliResultBaseSchema.extend({
    status: z.enum(["FAIL", "INFORMATION_MISSING", "REVIEW_REQUIRED"]),
    output: z.never().optional(),
});

export const CliResultSchema = z.union([CliPassResultSchema, CliNonPassResultSchema]);

export type CliStatus = z.infer<typeof CliStatusSchema>;
export type CliError = z.infer<typeof CliErrorSchema>;
export type CliOutput = z.infer<typeof CliOutputSchema>;
export type CliMetadata = z.infer<typeof CliMetadataSchema>;
export type CliResult = z.infer<typeof CliResultSchema>;

export const CliResultJsonSchema = toJSONSchema(CliResultSchema);
