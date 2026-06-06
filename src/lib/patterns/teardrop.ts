import { drawSymmetric } from "@/lib/canvas";
import type { PatternRenderer } from "./types";

export const renderTeardrop: PatternRenderer = ({
    ctx,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    symmetry,
    color,
    config,
}) => {
    const h = (outerRadius - innerRadius) * 0.85;
    const w = h * 0.32;
    const base = innerRadius + h * 0.05;

    ctx.lineWidth = 1;

    drawSymmetric(ctx, centerX, centerY, symmetry, () => {
        ctx.beginPath();
        ctx.moveTo(0, -base);
        ctx.bezierCurveTo(w, -base - h * 0.3, w * 1.2, -base - h * 0.7, 0, -outerRadius);
        ctx.bezierCurveTo(-w * 1.2, -base - h * 0.7, -w, -base - h * 0.3, 0, -base);
        ctx.closePath();
        ctx.strokeStyle = color;

        if (config.fill) {
            ctx.save();
            ctx.globalAlpha = 0.28;
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        }

        ctx.stroke();
    });
};
