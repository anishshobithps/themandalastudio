import { registerWindow } from "@svgdotjs/svg.js";
import { oklchToHex } from "@/lib/colors";
import { buildMandalaSvg } from "@/lib/renderer/mandala-svg-renderer";
import type { MandalaConfig } from "@/types/mandala";

// `svgdom` (and its `image-size` dependency) is CommonJS and calls
// `require("fs")` at module-eval time. When the serverless function is bundled
// to ESM, a static import inlines that `require` and it throws
// "Dynamic require of \"fs\" is not supported" at load, crashing the function
// before any handler runs. Loading it via a dynamic `import()` of a bare
// specifier keeps it external so it resolves as native CJS at runtime.
type SvgWindow = ReturnType<
    typeof import("svgdom")["createSVGWindow"]
>;

let svgWindow: SvgWindow | null = null;

async function ensureSvgWindow(): Promise<SvgWindow> {
    if (!svgWindow) {
        const { createSVGWindow } = await import("svgdom");
        svgWindow = createSVGWindow();
        registerWindow(svgWindow, svgWindow.document);
    }
    return svgWindow;
}

export async function buildMandalaSvgServer(
    config: MandalaConfig,
    size = 800,
): Promise<string> {
    const window = await ensureSvgWindow();
    return oklchToHex(
        buildMandalaSvg(config, {
            withAnimation: false,
            withBackground: true,
            size,
            document: window.document as never,
        }),
    );
}
