import { drawSymmetric } from "@/lib/canvas";
import type { PatternRenderer } from "./types";

export const renderDiamonds: PatternRenderer = ({
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
    const w = h * 0.4;
    const mid = innerRadius + (outerRadius - innerRadius) * 0.5;

    ctx.lineWidth = 1;

    drawSymmetric(ctx, centerX, centerY, symmetry, () => {
        ctx.beginPath();
        ctx.moveTo(0, -outerRadius + h * 0.05);
        ctx.lineTo(w, -mid);
        ctx.lineTo(0, -innerRadius - h * 0.05);
        ctx.lineTo(-w, -mid);
        ctx.closePath();
        ctx.strokeStyle = color;

        if (config.fill) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        }

        ctx.stroke();
    });
};
