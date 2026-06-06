import type {
    PatternType,
} from "@/types/mandala";

import {
    renderArcs,
} from "./arcs";

import {
    renderPetals,
} from "./petals";

import {
    renderTriangles,
} from "./triangles";

import type {
    PatternRenderer,
} from "./types";

export const patternRegistry =
    new Map<
        PatternType,
        PatternRenderer
    >([
        [
            "petals",
            renderPetals,
        ],
        [
            "arcs",
            renderArcs,
        ],
        [
            "triangles",
            renderTriangles,
        ],
    ]);
