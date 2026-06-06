import { drawSymmetric } from "@/lib/canvas";

import type { PatternRenderer } from "./types";

export const renderArcs: PatternRenderer = ({
    ctx,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    symmetry,
    color,
}) => {
    const step =
        (Math.PI * 2) /
        symmetry;

    const gap =
        step * 0.12;

    ctx.lineWidth = 1.2;

    drawSymmetric(
        ctx,
        centerX,
        centerY,
        symmetry,
        () => {
            ctx.strokeStyle =
                color;

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                outerRadius,
                -step / 2 + gap,
                step / 2 - gap,
            );

            ctx.stroke();

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                innerRadius,
                -step / 2 + gap,
                step / 2 - gap,
            );

            ctx.stroke();

            const outerX =
                outerRadius *
                Math.cos(
                    -step / 2 + gap,
                );

            const outerY =
                outerRadius *
                Math.sin(
                    -step / 2 + gap,
                );

            const innerX =
                innerRadius *
                Math.cos(
                    -step / 2 + gap,
                );

            const innerY =
                innerRadius *
                Math.sin(
                    -step / 2 + gap,
                );

            ctx.beginPath();

            ctx.moveTo(
                outerX,
                outerY,
            );

            ctx.lineTo(
                innerX,
                innerY,
            );

            ctx.stroke();
        },
    );
};
