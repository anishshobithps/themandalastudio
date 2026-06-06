import type { PatternRenderer } from "./types";

export const renderWaves: PatternRenderer = ({
    ctx,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    symmetry,
    color,
}) => {
    const step = (Math.PI * 2) / symmetry;
    const steps = 24;

    ctx.lineWidth = 1;

    for (let i = 0; i < symmetry; i++) {
        const aStart = step * i;
        const aEnd = step * (i + 1);

        ctx.beginPath();

        for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const angle = aStart + (aEnd - aStart) * t;
            const wave =
                Math.sin(t * Math.PI * 2) * (outerRadius - innerRadius) * 0.2;
            const dist = (outerRadius + innerRadius) * 0.5 + wave;

            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;

            if (s === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.strokeStyle = color;
        ctx.stroke();
    }
};
