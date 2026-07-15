import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import type { MandalaConfig } from "@/types/mandala"
import { buildMandalaSvgServer } from "./mandala-svg-server.ts"
import { decodeConfig } from "@/lib/config-codec"
import { generateConfig } from "@/lib/random"

const OG_WIDTH = 1200
const OG_HEIGHT = 630
const ANIMATION_FPS = 20
const ANIMATION_DURATION_MS = 3000

function getMandalaConfig(url: URL): MandalaConfig {
  const seed = url.searchParams.has("seed")
    ? parseInt(url.searchParams.get("seed")!, 10)
    : Math.floor(Math.random() * 999999)
  const configParam = url.searchParams.get("c")

  if (configParam) {
    const decoded = decodeConfig(configParam, seed)
    if (decoded) return decoded
  }

  const generated = generateConfig(seed)
  return {
    seed,
    rings: generated.rings,
    symmetry: generated.symmetry,
    complexity: generated.complexity,
    scale: generated.scale,
    speed: 1,
    fill: true,
    animate: false,
    colors: generated.colors,
    ringPatterns: generated.patterns,
  }
}

function StaticCard({
  svgDataUri,
  config,
}: {
  svgDataUri: string
  config: MandalaConfig
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: config.colors.background,
      }}
    >
      <img
        src={svgDataUri}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: 0.95,
        }}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bottom: "2.5rem",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            color: config.colors.primary,
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textShadow: `0 2px 20px ${config.colors.background}`,
          }}
        >
          The Mandala Studio
        </span>
        <span
          style={{
            color: config.colors.secondary,
            fontSize: "1.1rem",
            opacity: 0.8,
          }}
        >
          Infinite generative mandala art
        </span>
      </div>
    </div>
  )
}

function AnimatedCard({
  svgDataUri,
  config,
}: {
  svgDataUri: string
  config: MandalaConfig
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: config.colors.background,
      }}
    >
      <style>{`
        @keyframes mandala-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <img
        src={svgDataUri}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: 0.95,
          animation: "mandala-spin 8s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bottom: "2.5rem",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            color: config.colors.primary,
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          The Mandala Studio
        </span>
        <span
          style={{
            color: config.colors.secondary,
            fontSize: "1.1rem",
            opacity: 0.8,
          }}
        >
          Infinite generative mandala art
        </span>
      </div>
    </div>
  )
}

let cachedRenderer: import("@takumi-rs/wasm/no-bundler").Renderer | null = null
let cachedFromJsx: typeof import("takumi-js/helpers/jsx").fromJsx | null = null

// `takumi-js/wasm` relies on a bundler-specific auto-loader (`@takumi-rs/wasm`'s
// `./auto` export) to initialise the WebAssembly module. On Vercel the function
// is bundled to ESM and that auto-loader resolves to a variant that either
// imports a Vite-only `?url` asset or an extensionless path that Node's ESM
// resolver rejects — so `new Renderer()` never gets a live WASM instance. We
// bypass it: load the raw `no-bundler` bindings and initialise them ourselves
// from the `.wasm` bytes (shipped via the `includeFiles` glob in vercel.json).
async function getTakumi() {
  if (!cachedRenderer || !cachedFromJsx) {
    const [wasmMod, jsxMod] = await Promise.all([
      import("@takumi-rs/wasm/no-bundler"),
      import("takumi-js/helpers/jsx"),
    ])
    if (!cachedRenderer) {
      const wasmPath = createRequire(import.meta.url).resolve(
        "@takumi-rs/wasm/takumi_wasm_bg.wasm",
      )
      wasmMod.initSync({ module: await readFile(wasmPath) })
      cachedRenderer = new wasmMod.Renderer()
    }
    cachedFromJsx = jsxMod.fromJsx
  }
  return { renderer: cachedRenderer, fromJsx: cachedFromJsx }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { renderer, fromJsx } = await getTakumi()

    const url = new URL(request.url)
    const config = getMandalaConfig(url)
    const isAnimated = url.searchParams.get("animated") === "1"

    const svgString = await buildMandalaSvgServer({ ...config, animate: false }, 800)
    const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`

    if (isAnimated) {
      const { node, stylesheets } = await fromJsx(
        <AnimatedCard svgDataUri={svgDataUri} config={config} />
      )

      const gif = renderer.renderAnimation({
        width: OG_WIDTH,
        height: OG_HEIGHT,
        fps: ANIMATION_FPS,
        format: "gif",
        stylesheets,
        scenes: [{ durationMs: ANIMATION_DURATION_MS, node }],
      })

      return new Response(Buffer.from(gif), {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      })
    }

    const { node, stylesheets } = await fromJsx(
      <StaticCard svgDataUri={svgDataUri} config={config} />
    )

    const png = renderer.render(node, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      format: "png",
      stylesheets,
    })

    return new Response(Buffer.from(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    })
  } catch (error) {
    const err = error as Error
    return new Response(
      `OG render failed\n\n${err?.name}: ${err?.message}\n\n${err?.stack ?? String(error)}`,
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    )
  }
}
