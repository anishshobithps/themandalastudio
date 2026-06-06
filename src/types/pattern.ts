import type {
    MandalaConfig,
} from "./mandala";

export interface PatternRenderOptions {
    ctx: CanvasRenderingContext2D;

    centerX: number;
    centerY: number;

    outerRadius: number;
    innerRadius: number;

    symmetry: number;
    complexity: number;

    color: string;

    config: MandalaConfig;
}
