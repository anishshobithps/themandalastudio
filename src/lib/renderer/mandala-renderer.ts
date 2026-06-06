import { patternRegistry } from "@/lib/patterns";

import {
    BASE_ROTATION_SPEED,
    SPEED_MULTIPLIER,
} from "@/lib/constants";

import {
    clearCanvas,
} from "@/lib/canvas";

import {
    createRingGradient,
} from "@/lib/colors";

import type {
    MandalaConfig,
    RendererState,
} from "@/types/mandala";

export class MandalaRenderer {
    private readonly canvas: HTMLCanvasElement;

    private readonly ctx: CanvasRenderingContext2D;

    private state: RendererState = {
        rotation: 0,
    };

    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    resize(
        width: number,
        height: number,
    ) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    update(
        deltaTime: number,
        config: MandalaConfig,
    ) {
        if (!config.animate) {
            return;
        }

        const rotationSpeed =
            BASE_ROTATION_SPEED +
            config.speed *
            SPEED_MULTIPLIER;

        this.state.rotation +=
            rotationSpeed *
            (deltaTime / 1000);
    }

    draw(
        config: MandalaConfig,
    ) {
        const width =
            this.canvas.width;

        const height =
            this.canvas.height;

        clearCanvas(
            this.ctx,
            width,
            height,
            config.colors.background,
        );

        if (
            config.ringPatterns.length ===
            0
        ) {
            return;
        }

        const centerX =
            width / 2;

        const centerY =
            height / 2;

        const maxRadius =
            Math.min(
                width,
                height,
            ) *
            0.35 *
            config.scale;

        const gradient =
            createRingGradient(
                config.colors,
            );

        this.ctx.save();

        this.ctx.translate(
            centerX,
            centerY,
        );

        this.ctx.rotate(
            this.state.rotation,
        );

        this.ctx.translate(
            -centerX,
            -centerY,
        );

        for (
            let ringIndex = 0;
            ringIndex <
            config.rings;
            ringIndex++
        ) {
            const outerRadius =
                maxRadius *
                ((ringIndex + 1) /
                    config.rings);

            const innerRadius =
                ringIndex === 0
                    ? maxRadius * 0.04
                    : maxRadius *
                    (ringIndex /
                        config.rings);

            const pattern =
                config.ringPatterns[
                ringIndex %
                config.ringPatterns
                    .length
                ];

            const renderer =
                patternRegistry.get(
                    pattern,
                );

            if (!renderer) {
                continue;
            }

            const progress =
                ringIndex /
                Math.max(
                    config.rings - 1,
                    1,
                );

            renderer({
                ctx: this.ctx,

                centerX,
                centerY,

                outerRadius,
                innerRadius,

                symmetry:
                    config.symmetry,

                complexity:
                    config.complexity,

                color:
                    gradient(
                        progress,
                    ),

                config,
            });
        }

        this.ctx.beginPath();

        this.ctx.arc(
            centerX,
            centerY,
            maxRadius * 0.04,
            0,
            Math.PI * 2,
        );

        this.ctx.fillStyle =
            gradient(0);

        this.ctx.fill();

        this.ctx.restore();
    }
}
