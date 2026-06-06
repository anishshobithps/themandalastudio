import { drawSymmetric } from "@/lib/canvas";

import type { PatternRenderer } from "./types";

export const renderPetals: PatternRenderer = ({
    ctx,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    symmetry,
    color,
    config,
}) => {
    const half =
        (Math.PI * 2) /
        symmetry /
        2;

    const petalRadius =
        (outerRadius - innerRadius) *
        0.9;

    const middleRadius =
        innerRadius +
        (outerRadius - innerRadius) *
        0.5;

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
                -innerRadius,
            );

            ctx.bezierCurveTo(
                petalRadius *
                Math.sin(
                    half * 0.6,
                ),
                -(
                    innerRadius +
                    petalRadius * 0.3
                ),
                petalRadius *
                Math.sin(half),
                -middleRadius,
                0,
                -outerRadius,
            );

            ctx.bezierCurveTo(
                -petalRadius *
                Math.sin(half),
                -middleRadius,
                -petalRadius *
                Math.sin(
                    half * 0.6,
                ),
                -(
                    innerRadius +
                    petalRadius * 0.3
                ),
                0,
                -innerRadius,
            );

            ctx.closePath();

            ctx.strokeStyle =
                color;

            if (config.fill) {
                ctx.save();

                ctx.globalAlpha =
                    0.25;

                ctx.fillStyle =
                    color;

                ctx.fill();

                ctx.restore();
            }

            ctx.stroke();
        },
    );
};
