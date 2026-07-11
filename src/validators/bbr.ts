import { type Bathroom, BathroomSchema } from "../types/bathroom.js";
import { getComponentFootprint } from "../types/component-defaults.js";

// ── Synthetic sample rule constants (demonstration only) ─────────────────────

/** Demonstration threshold: minimum ceiling height in mm. */
const EXAMPLE_MIN_CEILING_HEIGHT_MM = 2_100;

/**
 * Demonstration threshold: minimum distance between an electrical outlet and
 * any water source (sink, bathtub, shower), in mm.
 */
const EXAMPLE_MIN_OUTLET_TO_WATER_DISTANCE_MM = 600;

/**
 * Demonstration threshold: minimum turning-circle diameter in mm.
 */
const EXAMPLE_MIN_TURN_DIAMETER_MM = 1_300;

// ── Structured error types ────────────────────────────────────────────────────

export interface BbrViolation {
    rule: string;
    message: string;
    actual?: string | number;
    required?: string | number;
}

export class BbrValidationError extends Error {
    readonly violations: BbrViolation[];

    constructor(violations: BbrViolation[]) {
        const summary = violations.map((v) => v.message).join("; ");
        super(`Synthetic rule validation failed: ${summary}`);
        this.name = "BbrValidationError";
        this.violations = violations;
    }
}

// ── Distance helper ───────────────────────────────────────────────────────────

function distanceMm(ax: number, ay: number, bx: number, by: number): number {
    return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

function componentCenterMm(component: Bathroom["components"][number]): { x: number; y: number } {
    const footprint = getComponentFootprint(component.type, component.width, component.depth);

    return {
        x: component.x + footprint.width / 2,
        y: component.y + footprint.depth / 2,
    };
}

// ── Individual rule checks ────────────────────────────────────────────────────

/**
 * Synthetic rule: minimum ceiling height check.
 */
function checkCeilingHeight(bathroom: Bathroom): BbrViolation[] {
    if (bathroom.ceilingHeight < EXAMPLE_MIN_CEILING_HEIGHT_MM) {
        return [
            {
                rule: "EXAMPLE_RULE_MIN_CEILING_HEIGHT",
                message: `Ceiling height ${bathroom.ceilingHeight} mm is below the minimum ${EXAMPLE_MIN_CEILING_HEIGHT_MM} mm`,
                actual: bathroom.ceilingHeight,
                required: EXAMPLE_MIN_CEILING_HEIGHT_MM,
            },
        ];
    }
    return [];
}

/**
 * Synthetic rule: outlets must be at least 600 mm from every water source.
 */
function checkOutletToWaterDistance(bathroom: Bathroom): BbrViolation[] {
    const violations: BbrViolation[] = [];
    const waterTypes = new Set(["SINK", "BATHTUB", "SHOWER"]);

    const outlets = bathroom.components.filter((c) => c.type === "OUTLET");
    const waterSources = bathroom.components.filter((c) => waterTypes.has(c.type));

    for (const outlet of outlets) {
        for (const water of waterSources) {
            const outletCenter = componentCenterMm(outlet);
            const waterCenter = componentCenterMm(water);
            const distance = distanceMm(
                outletCenter.x,
                outletCenter.y,
                waterCenter.x,
                waterCenter.y,
            );
            if (distance < EXAMPLE_MIN_OUTLET_TO_WATER_DISTANCE_MM) {
                const reportedDistance = Number(distance.toFixed(1));
                violations.push({
                    rule: "EXAMPLE_RULE_OUTLET_TO_WATER_DISTANCE",
                    message:
                        `Outlet "${outlet.id}" is ${reportedDistance} mm from water source ` +
                        `"${water.id}" (${water.type}), minimum is ${EXAMPLE_MIN_OUTLET_TO_WATER_DISTANCE_MM} mm`,
                    actual: reportedDistance,
                    required: EXAMPLE_MIN_OUTLET_TO_WATER_DISTANCE_MM,
                });
            }
        }
    }

    return violations;
}

/**
 * Synthetic rule: the room must fit a minimum turning-circle diameter.
 */
function checkWheelchairTurnCircle(bathroom: Bathroom): BbrViolation[] {
    const violations: BbrViolation[] = [];
    const minDimension = EXAMPLE_MIN_TURN_DIAMETER_MM;

    if (bathroom.width < minDimension) {
        violations.push({
            rule: "EXAMPLE_RULE_MIN_TURN_DIAMETER",
            message:
                `Room width ${bathroom.width} mm is too narrow for a ${minDimension} mm wheelchair ` +
                `turning circle`,
            actual: bathroom.width,
            required: minDimension,
        });
    }

    if (bathroom.depth < minDimension) {
        violations.push({
            rule: "EXAMPLE_RULE_MIN_TURN_DIAMETER",
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
 * Validates a raw bathroom configuration object against synthetic example rules.
 *
 * Parses the input with Zod first, then runs all synthetic rule checks.
 * Throws {@link BbrValidationError} when any rule is violated.
 *
 * This validator is for demonstration and testing only. It is not legal or
 * regulatory compliance evidence.
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
