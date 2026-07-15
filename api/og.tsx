import "takumi-js"
import { Renderer } from "takumi-js/node"
import { fromJsx } from "takumi-js/helpers/jsx"
import { compile } from "tailwindcss"
import { createRequire } from "node:module"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { readFile } from "node:fs/promises"
import { decodeConfig } from "@/lib/config-codec"
import { generateConfig } from "@/lib/random"
import { buildMandalaSvgServer } from "./mandala-svg-server.ts"
import type { MandalaConfig } from "@/types/mandala"

const require = createRequire(import.meta.url)
const currentDir = dirname(fileURLToPath(import.meta.url))
const srcDir = `${currentDir}/../src`

const OG_WIDTH = 1200
const OG_HEIGHT = 630
const ANIMATION_FPS = 20
const ANIMATION_DURATION_MS = 3000

let cachedStylesheet: string | null = null

async function getCompiledStylesheet(): Promise<string> {
  if (cachedStylesheet) return cachedStylesheet

  const compiler = await compile('@import "tailwindcss";', {
    base: srcDir,
    loadStylesheet: async (id, base) => {
      const path = resolveStylesheetPath(id, base)
      return {
        path,
        base: dirname(path),
        content: await readFile(path, "utf8"),
      }
    },
  })

  cachedStylesheet = compiler.build([
    "w-full",
    "h-full",
    "flex",
    "items-center",
    "justify-center",
    "flex-col",
    "relative",
    "absolute",
    "inset-0",
  ])
  return cachedStylesheet
}

function resolveStylesheetPath(id: string, base: string): string {
  if (id === "tailwindcss") return require.resolve("tailwindcss/index.css")
  if (id.startsWith(".")) return `${base}/${id}`
  if (id.startsWith("/")) return id
  return require.resolve(id)
}

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
      tw="w-full h-full flex items-center justify-center relative"
      style={{ backgroundColor: config.colors.background }}
    >
      <img
        src={svgDataUri}
        tw="absolute inset-0 w-full h-full"
        style={{ objectFit: "contain", opacity: 0.95 }}
      />
      <div
        tw="absolute flex flex-col items-center"
        style={{ bottom: "2.5rem", gap: "0.5rem" }}
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
      tw="w-full h-full flex items-center justify-center relative"
      style={{ backgroundColor: config.colors.background }}
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
        tw="absolute flex flex-col items-center"
        style={{ bottom: "2.5rem", gap: "0.5rem" }}
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

const renderer = new Renderer()

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const config = getMandalaConfig(url)
  const isAnimated = url.searchParams.get("animated") === "1"

  const svgString = buildMandalaSvgServer({ ...config, animate: false }, 800)
  const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`

  const stylesheet = await getCompiledStylesheet()

  if (isAnimated) {
    const { node, stylesheets } = await fromJsx(
      <AnimatedCard svgDataUri={svgDataUri} config={config} />
    )

    const gif = await renderer.renderAnimation({
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fps: ANIMATION_FPS,
      format: "gif",
      stylesheets: [stylesheet, ...stylesheets],
      scenes: [{ durationMs: ANIMATION_DURATION_MS, node }],
    })

    return new Response(gif.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    })
  }

  const { node, stylesheets } = await fromJsx(
    <StaticCard svgDataUri={svgDataUri} config={config} />
  )

  const png = await renderer.render(node, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    format: "png",
    stylesheets: [stylesheet, ...stylesheets],
  })

  return new Response(png.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
