import {
    formatCss,
    interpolate,
} from "culori";

import type {
    MandalaColors,
} from "@/types/mandala";

export function getRingColor(
    ringIndex: number,
    totalRings: number,
    colors: MandalaColors,
) {
    const progress =
        ringIndex /
        Math.max(totalRings - 1, 1);

    const gradient = interpolate(
        [
            colors.primary,
            colors.secondary,
            colors.accent,
        ],
        "oklch",
    );

    return formatCss(
        gradient(progress),
    );
}

export function withAlpha(
    color: string,
    alpha: number,
) {
    return `color-mix(
    in oklab,
    ${color} ${alpha * 100}%,
    transparent
  )`;
}

export function createRingGradient(
    colors: MandalaColors,
) {
    const gradient =
        interpolate(
            [
                colors.primary,
                colors.secondary,
                colors.accent,
            ],
            "oklch",
        );

    return (
        progress: number,
    ) =>
        formatCss(
            gradient(progress),
        );
}
