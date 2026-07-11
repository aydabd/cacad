import type { ComponentType } from "./bathroom.js";

export interface ComponentFootprint {
    width: number;
    depth: number;
}

export const COMPONENT_FOOTPRINT_DEFAULTS: Record<ComponentType, ComponentFootprint> = {
    WC: { width: 400, depth: 700 },
    SINK: { width: 500, depth: 400 },
    BATHTUB: { width: 700, depth: 1_600 },
    SHOWER: { width: 900, depth: 900 },
    OUTLET: { width: 80, depth: 80 },
    TOWEL_RAIL: { width: 600, depth: 100 },
    MIRROR: { width: 600, depth: 30 },
};

export function getComponentFootprint(
    type: ComponentType,
    width?: number,
    depth?: number,
): ComponentFootprint {
    const defaults = COMPONENT_FOOTPRINT_DEFAULTS[type];
    return {
        width: width ?? defaults.width,
        depth: depth ?? defaults.depth,
    };
}
