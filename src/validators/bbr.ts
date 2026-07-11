import { z } from "zod";
import { type Bathroom, BathroomSchema } from "../types/bathroom.js";

// ── BBR constants (Swedish Building Regulations) ──────────────────────────────

/** BBR §3:22 minimum ceiling height for habitable rooms in mm. */
const BBR_MIN_CEILING_HEIGHT_MM = 2_100;

/**
 * BBR §3:146 / EL-säkerhet: minimum distance between an electrical outlet
 * and any water source (sink, bathtub, shower) in mm.
 */
const BBR_MIN_OUTLET_TO_WATER_DISTANCE_MM = 600;

/**
 * BBR §3:225 accessibility: minimum wheelchair turning circle diameter in mm.
 * Requires a circular clear area of ø1 300 mm in wet rooms.
 */
const BBR_MIN_WHEELCHAIR_TURN_DIAMETER_MM = 1_300;

// ── Structured error types ────────────────────────────────────────────────────

const BbrViolationSchema = z.object({
    rule: z.string(),
    message: z.string(),
    actual: z.union([z.string(), z.number()]).optional(),
    required: z.union([z.string(), z.number()]).optional(),
});

export type BbrViolation = z.infer<typeof BbrViolationSchema>;

export class BbrValidationError extends Error {
    readonly violations: BbrViolation[];

    constructor(violations: BbrViolation[]) {
        const summary = violations.map((v) => v.message).join("; ");
        super(`BBR validation failed: ${summary}`);
        this.name = "BbrValidationError";
        this.violations = violations;
    }
}

// ── Distance helper ───────────────────────────────────────────────────────────

function distanceMm(ax: number, ay: number, bx: number, by: number): number {
    return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

// ── Individual rule checks ────────────────────────────────────────────────────

/**
 * BBR §3:22 — Minimum ceiling height check.
 * Bathrooms require at least 2 100 mm.
 */
function checkCeilingHeight(bathroom: Bathroom): BbrViolation[] {
    if (bathroom.ceilingHeight < BBR_MIN_CEILING_HEIGHT_MM) {
        return [
            {
                rule: "BBR §3:22",
                message: `Ceiling height ${bathroom.ceilingHeight} mm is below the minimum ${BBR_MIN_CEILING_HEIGHT_MM} mm`,
                actual: bathroom.ceilingHeight,
                required: BBR_MIN_CEILING_HEIGHT_MM,
            },
        ];
    }
    return [];
}

/**
 * BBR §3:146 / Electrical safety — outlets must be at least 600 mm from
 * every water source (SINK, BATHTUB, SHOWER).
 */
function checkOutletToWaterDistance(bathroom: Bathroom): BbrViolation[] {
    const violations: BbrViolation[] = [];
    const waterTypes = new Set(["SINK", "BATHTUB", "SHOWER"]);

    const outlets = bathroom.components.filter((c) => c.type === "OUTLET");
    const waterSources = bathroom.components.filter((c) => waterTypes.has(c.type));

    for (const outlet of outlets) {
        for (const water of waterSources) {
            const distance = distanceMm(outlet.x, outlet.y, water.x, water.y);
            if (distance < BBR_MIN_OUTLET_TO_WATER_DISTANCE_MM) {
                violations.push({
                    rule: "BBR §3:146",
                    message:
                        `Outlet "${outlet.id}" is ${Math.round(distance)} mm from water source ` +
                        `"${water.id}" (${water.type}), minimum is ${BBR_MIN_OUTLET_TO_WATER_DISTANCE_MM} mm`,
                    actual: Math.round(distance),
                    required: BBR_MIN_OUTLET_TO_WATER_DISTANCE_MM,
                });
            }
        }
    }

    return violations;
}

/**
 * BBR §3:225 — Accessibility: the room must be wide and deep enough to
 * contain a 1 300 mm wheelchair turning circle.
 */
function checkWheelchairTurnCircle(bathroom: Bathroom): BbrViolation[] {
    const violations: BbrViolation[] = [];
    const minDimension = BBR_MIN_WHEELCHAIR_TURN_DIAMETER_MM;

    if (bathroom.width < minDimension) {
        violations.push({
            rule: "BBR §3:225",
            message:
                `Room width ${bathroom.width} mm is too narrow for a ${minDimension} mm wheelchair ` +
                `turning circle`,
            actual: bathroom.width,
            required: minDimension,
        });
    }

    if (bathroom.depth < minDimension) {
        violations.push({
            rule: "BBR §3:225",
            message:
                `Room depth ${bathroom.depth} mm is too shallow for a ${minDimension} mm wheelchair ` +
                `turning circle`,
            actual: bathroom.depth,
            required: minDimension,
        });
    }

    return violations;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Validates a raw bathroom configuration object against BBR rules.
 *
 * Parses the input with Zod first, then runs all BBR rule checks.
 * Throws {@link BbrValidationError} when any rule is violated.
 *
 * @param input - Raw (untyped) bathroom configuration.
 * @returns The validated {@link Bathroom} when all rules pass.
 * @throws {z.ZodError} on schema violations.
 * @throws {BbrValidationError} on BBR rule violations.
 */
export function validateBathroom(input: unknown): Bathroom {
    const bathroom = BathroomSchema.parse(input);

    const violations: BbrViolation[] = [
        ...checkCeilingHeight(bathroom),
        ...checkOutletToWaterDistance(bathroom),
        ...checkWheelchairTurnCircle(bathroom),
    ];

    if (violations.length > 0) {
        throw new BbrValidationError(violations);
    }

    return bathroom;
}
