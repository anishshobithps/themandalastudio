import { useState, useCallback } from "react"
import { generateConfig, generateSeed } from "@/lib/random"
import { PATTERNS } from "@/lib/constants"
import { DEFAULT_CONFIG } from "@/lib/defaults"
import type { MandalaConfig, PatternType } from "@/types/mandala"

export function useMandalaConfig() {
    const [config, setConfig] = useState<MandalaConfig>(() => {
        const seed = generateSeed()
        const generated = generateConfig(seed)
        return {
            ...DEFAULT_CONFIG,
            seed,
            rings: generated.rings,
            symmetry: generated.symmetry,
            complexity: generated.complexity,
            scale: generated.scale,
            ringPatterns: generated.patterns,
            colors: generated.colors,
        }
    })

    const update = useCallback((partial: Partial<MandalaConfig>) => {
        setConfig((prev) => ({ ...prev, ...partial }))
    }, [])

    const updateRings = useCallback((rings: number) => {
        setConfig((prev) => ({
            ...prev,
            rings,
            ringPatterns: Array.from(
                { length: rings },
                (_, i) =>
                    prev.ringPatterns[i] ??
                    (PATTERNS[Math.floor(Math.random() * PATTERNS.length)] as PatternType)
            ),
        }))
    }, [])

    const randomize = useCallback((locked: Record<string, boolean>) => {
        const seed = generateSeed()
        const generated = generateConfig(seed)
        setConfig((prev) => ({
            ...prev,
            seed,
            rings: locked.rings ? prev.rings : generated.rings,
            symmetry: locked.symmetry ? prev.symmetry : generated.symmetry,
            complexity: locked.complexity ? prev.complexity : generated.complexity,
            scale: locked.scale ? prev.scale : generated.scale,
            ringPatterns: locked.rings ? prev.ringPatterns : generated.patterns,
            colors: locked.colors ? prev.colors : generated.colors,
        }))
    }, [])

    return { config, update, updateRings, randomize }
}
