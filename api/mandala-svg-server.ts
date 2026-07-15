import { createSVGWindow } from "svgdom";
import { registerWindow } from "@svgdotjs/svg.js";
import { oklchToHex } from "@/lib/colors";
import { buildMandalaSvg } from "@/lib/renderer/mandala-svg-renderer";
import type { MandalaConfig } from "@/types/mandala";

const svgWindow = createSVGWindow();
registerWindow(svgWindow, svgWindow.document);

export function buildMandalaSvgServer(config: MandalaConfig, size = 800): string {
    return oklchToHex(
        buildMandalaSvg(config, {
            withAnimation: false,
            withBackground: true,
            size,
            document: svgWindow.document as never,
        }),
    );
}
