import { drawSymmetric } from "@/lib/canvas";
import type { PatternRenderer } from "./types";

export const renderCrosses: PatternRenderer = ({
    ctx,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    symmetry,
    color,
}) => {
    const arm = (outerRadius - innerRadius) * 0.35;
    const mid = innerRadius + (outerRadius - innerRadius) * 0.5;

    ctx.lineWidth = 1.2;

    drawSymmetric(ctx, centerX, centerY, symmetry, () => {
        ctx.beginPath();
        ctx.moveTo(-arm, -mid);
        ctx.lineTo(arm, -mid);
        ctx.moveTo(0, -mid - arm);
        ctx.lineTo(0, -mid + arm);
        ctx.strokeStyle = color;
        ctx.stroke();
    });
};
