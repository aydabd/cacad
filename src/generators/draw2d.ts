import DxfWriter from "dxf-writer";
import type { Bathroom, BathroomComponent } from "../types/bathroom.js";

// ── DXF layer names ───────────────────────────────────────────────────────────

const LAYER_WALLS = "WALLS";
const LAYER_WINDOWS = "WINDOWS";
const LAYER_ELECTRICAL = "ELECTRICAL";
const LAYER_PLUMBING = "PLUMBING";
const LAYER_ANNOTATIONS = "ANNOTATIONS";

// ── DXF colour indices (AutoCAD colour numbers) ───────────────────────────────

const COLOR_WALLS = 7; // white / black
const COLOR_ELECTRICAL = 3; // green
const COLOR_PLUMBING = 5; // blue
const COLOR_ANNOTATIONS = 1; // red

// ── Layer setup ───────────────────────────────────────────────────────────────

function setupLayers(dxf: DxfWriter): void {
    dxf.addLayer(LAYER_WALLS, COLOR_WALLS, "CONTINUOUS");
    dxf.addLayer(LAYER_WINDOWS, 4, "DASHED");
    dxf.addLayer(LAYER_ELECTRICAL, COLOR_ELECTRICAL, "CONTINUOUS");
    dxf.addLayer(LAYER_PLUMBING, COLOR_PLUMBING, "CONTINUOUS");
    dxf.addLayer(LAYER_ANNOTATIONS, COLOR_ANNOTATIONS, "CONTINUOUS");
}

// ── Room outline ──────────────────────────────────────────────────────────────

function drawWalls(dxf: DxfWriter, width: number, depth: number): void {
    dxf.setActiveLayer(LAYER_WALLS);
    // Bottom wall
    dxf.drawLine(0, 0, width, 0);
    // Right wall
    dxf.drawLine(width, 0, width, depth);
    // Top wall
    dxf.drawLine(width, depth, 0, depth);
    // Left wall
    dxf.drawLine(0, depth, 0, 0);
}

// ── Component drawing ─────────────────────────────────────────────────────────

const COMPONENT_DEFAULTS: Record<string, { width: number; depth: number }> = {
    WC: { width: 400, depth: 700 },
    SINK: { width: 500, depth: 400 },
    BATHTUB: { width: 700, depth: 1_600 },
    SHOWER: { width: 900, depth: 900 },
    OUTLET: { width: 80, depth: 80 },
    TOWEL_RAIL: { width: 600, depth: 100 },
    MIRROR: { width: 600, depth: 30 },
};

function componentLayer(type: BathroomComponent["type"]): string {
    switch (type) {
        case "OUTLET":
            return LAYER_ELECTRICAL;
        case "WC":
        case "SINK":
        case "BATHTUB":
        case "SHOWER":
            return LAYER_PLUMBING;
        default:
            return LAYER_ANNOTATIONS;
    }
}

function drawComponent(dxf: DxfWriter, component: BathroomComponent): void {
    const defaults = COMPONENT_DEFAULTS[component.type] ?? { width: 300, depth: 300 };
    const w = component.width ?? defaults.width;
    const d = component.depth ?? defaults.depth;
    const x = component.x;
    const y = component.y;

    dxf.setActiveLayer(componentLayer(component.type));

    // Draw bounding rectangle
    dxf.drawLine(x, y, x + w, y);
    dxf.drawLine(x + w, y, x + w, y + d);
    dxf.drawLine(x + w, y + d, x, y + d);
    dxf.drawLine(x, y + d, x, y);

    // Add centre cross for identification
    dxf.drawLine(x + w / 2 - 20, y + d / 2, x + w / 2 + 20, y + d / 2);
    dxf.drawLine(x + w / 2, y + d / 2 - 20, x + w / 2, y + d / 2 + 20);

    // Label
    const label = component.label ?? `${component.type} ${component.id}`;
    dxf.setActiveLayer(LAYER_ANNOTATIONS);
    dxf.drawText(x + 10, y + d / 2, 80, 0, label);
}

// ── Electrical outlets: safety zone circle ────────────────────────────────────

/**
 * Draws a 600 mm safety radius circle around every electrical outlet to make
 * the BBR §3:146 exclusion zone visible on the plan.
 */
function drawOutletSafetyZones(dxf: DxfWriter, bathroom: Bathroom): void {
    dxf.setActiveLayer(LAYER_ELECTRICAL);
    for (const component of bathroom.components) {
        if (component.type === "OUTLET") {
            // dxf-writer uses point3d helper; draw a circle at the outlet centre
            const cx = component.x + 40;
            const cy = component.y + 40;
            dxf.drawCircle(cx, cy, 600);
        }
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generates a DXF string from a validated {@link Bathroom} definition.
 *
 * Layers produced:
 * - `WALLS`       — room perimeter
 * - `WINDOWS`     — reserved for future window openings
 * - `ELECTRICAL`  — outlets and their 600 mm safety zones
 * - `PLUMBING`    — WC, sink, bathtub, shower fixtures
 * - `ANNOTATIONS` — labels and other text
 *
 * @param bathroom - A validated bathroom definition (use `validateBathroom` first).
 * @returns DXF file content as a string.
 */
export function generateDxf(bathroom: Bathroom): string {
    const dxf = new DxfWriter();
    setupLayers(dxf);
    drawWalls(dxf, bathroom.width, bathroom.depth);

    for (const component of bathroom.components) {
        drawComponent(dxf, component);
    }

    drawOutletSafetyZones(dxf, bathroom);

    return dxf.toDxfString();
}
