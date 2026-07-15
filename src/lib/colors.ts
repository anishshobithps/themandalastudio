import {
    formatCss,
    formatHex8,
    interpolate,
    parse,
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

export function encodeColor(color: string): [number, number, number] {
    const parsed = parse(color);
    if (parsed && parsed.mode === "oklch") {
        return [
            Math.round((parsed.l ?? 0) * 1000),
            Math.round((parsed.c ?? 0) * 10000),
            Math.round(parsed.h ?? 0),
        ];
    }
    return [500, 1000, 0];
}

export function decodeColor([l, c, h]: [number, number, number]): string {
    return formatCss({ mode: "oklch", l: l / 1000, c: c / 10000, h });
}

export function oklchToHex(value: string): string {
    return value.replace(/oklch\([^)]*\)/g, (match) => formatHex8(match) ?? match);
}
