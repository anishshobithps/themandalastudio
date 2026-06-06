import { drawSymmetric } from "@/lib/canvas";

import type { PatternRenderer } from "./types";

export const renderTriangles: PatternRenderer = ({
    ctx,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    symmetry,
    color,
    config,
}) => {
    const step =
        (Math.PI * 2) /
        symmetry;

    ctx.lineWidth = 1;

    drawSymmetric(
        ctx,
        centerX,
        centerY,
        symmetry,
        () => {
            ctx.beginPath();

            ctx.moveTo(
                0,
                -outerRadius,
            );

            ctx.lineTo(
                -innerRadius *
                Math.sin(
                    step / 2,
                ),
                -innerRadius *
                Math.cos(
                    step / 2,
                ),
            );

            ctx.lineTo(
                innerRadius *
                Math.sin(
                    step / 2,
                ),
                -innerRadius *
                Math.cos(
                    step / 2,
                ),
            );

            ctx.closePath();

            ctx.strokeStyle =
                color;

            if (config.fill) {
                ctx.save();

                ctx.globalAlpha =
                    0.2;

                ctx.fillStyle =
                    color;

                ctx.fill();

                ctx.restore();
            }

            ctx.stroke();
        },
    );
};
