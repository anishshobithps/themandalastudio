import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import { useAnimationFrame } from "@/hooks/use-animation-frame"
import { useCanvasSize } from "@/hooks/use-canvas-size"
import { MandalaCanvasSkeleton } from "@/components/mandala-canvas-skeleton"

import { MandalaRenderer } from "@/lib/renderer/mandala-renderer"

import type { MandalaConfig } from "@/types/mandala"

interface MandalaCanvasProps {
  config: MandalaConfig
}

export function MandalaCanvas({ config }: MandalaCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<MandalaRenderer>(null)
  const [isLoading, setIsLoading] = useState(true)

  const size = useCanvasSize(containerRef)

  useLayoutEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    try {
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        return
      }

      rendererRef.current = new MandalaRenderer(canvas, ctx)
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to initialize canvas:", error)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const renderer = rendererRef.current

    if (!renderer) {
      return
    }

    renderer.resize(size.width, size.height)
  }, [size])

  const frame = useCallback(
    (deltaTime: number) => {
      const renderer = rendererRef.current

      if (!renderer) {
        return
      }

      renderer.update(deltaTime, config)

      renderer.draw(config)
    },
    [config]
  )

  useAnimationFrame(frame)

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {isLoading && <MandalaCanvasSkeleton />}
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        role="img"
        aria-label="Generated mandala pattern with customizable rings, symmetry, and colors. Use the control panel to adjust parameters."
      />
    </div>
  )
}
