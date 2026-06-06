import { drawSymmetric } from "@/lib/canvas";
import type { PatternRenderer } from "./types";

export const renderLotus: PatternRenderer = ({
    ctx,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    symmetry,
    color,
    config,
}) => {
    const half = (Math.PI * 2) / symmetry / 2;
    const midR = innerRadius + (outerRadius - innerRadius) * 0.5;

    ctx.lineWidth = 1;

    drawSymmetric(ctx, centerX, centerY, symmetry, () => {
        ctx.beginPath();
        ctx.moveTo(0, -innerRadius);
        ctx.quadraticCurveTo(
            midR * Math.sin(half) * 1.5,
            -midR * Math.cos(half) * 0.5,
            0,
            -outerRadius
        );
        ctx.quadraticCurveTo(
            -midR * Math.sin(half) * 1.5,
            -midR * Math.cos(half) * 0.5,
            0,
            -innerRadius
        );
        ctx.closePath();
        ctx.strokeStyle = color;

        if (config.fill) {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        }

        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -innerRadius);
        ctx.quadraticCurveTo(
            midR * Math.sin(half * 0.5) * 0.8,
            -(innerRadius + (outerRadius - innerRadius) * 0.3),
            0,
            -midR
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });
};
