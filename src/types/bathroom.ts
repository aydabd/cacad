import { z } from "zod";

/**
 * Supported electrical component types in a bathroom layout.
 */
export const ComponentTypeSchema = z.enum([
    "WC",
    "SINK",
    "BATHTUB",
    "SHOWER",
    "OUTLET",
    "TOWEL_RAIL",
    "MIRROR",
]);

export type ComponentType = z.infer<typeof ComponentTypeSchema>;

/**
 * A single component placed in the bathroom with its type and 2D position (mm).
 */
export const BathroomComponentSchema = z.object({
    id: z.string().min(1),
    type: ComponentTypeSchema,
    /** X coordinate from the room origin, in millimetres. */
    x: z.number().finite(),
    /** Y coordinate from the room origin, in millimetres. */
    y: z.number().finite(),
    /** Component width in millimetres (along the X axis). */
    width: z.number().positive().optional(),
    /** Component depth in millimetres (along the Y axis). */
    depth: z.number().positive().optional(),
    /** Free-form label for plans and legends. */
    label: z.string().optional(),
});

export type BathroomComponent = z.infer<typeof BathroomComponentSchema>;

/**
 * Complete bathroom room definition used as input to the CAD generators and BBR validators.
 *
 * All measurements are in millimetres (mm).
 */
export const BathroomSchema = z.object({
    /** Unique room identifier. */
    id: z.string().min(1),
    /** Human-readable name shown on drawings. */
    name: z.string().min(1),
    /** Room width in mm (X axis). */
    width: z.number().positive(),
    /** Room depth in mm (Y axis). */
    depth: z.number().positive(),
    /** Ceiling height in mm. Minimum 2 100 mm per BBR §3:22. */
    ceilingHeight: z.number().positive(),
    /** Placed components inside this room. */
    components: z.array(BathroomComponentSchema).min(1),
});

export type Bathroom = z.infer<typeof BathroomSchema>;
