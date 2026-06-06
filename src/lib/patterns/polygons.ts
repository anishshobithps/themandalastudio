import { drawSymmetric } from "@/lib/canvas";
import type { PatternRenderer } from "./types";

export const renderPolygons: PatternRenderer = ({
    ctx,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    symmetry,
    complexity,
    color,
    config,
}) => {
    const sides = 3 + (complexity % 5);
    const polyR = (outerRadius - innerRadius) * 0.8 * 0.45;
    const mid = innerRadius + (outerRadius - innerRadius) * 0.5;

    ctx.lineWidth = 1;

    drawSymmetric(ctx, centerX, centerY, symmetry, () => {
        ctx.beginPath();
        for (let s = 0; s <= sides; s++) {
            const a = (s / sides) * Math.PI * 2 - Math.PI / 2;
            const px = Math.cos(a) * polyR;
            const py = -mid + Math.sin(a) * polyR;
            if (s === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.strokeStyle = color;

        if (config.fill) {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        }

        ctx.stroke();
    });
};
