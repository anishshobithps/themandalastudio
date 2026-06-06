import { useState, useEffect } from "react"
import { parse, formatCss } from "culori"
import {
  ShuffleIcon,
  LockIcon,
  LockOpenIcon,
  SlidersIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react"
import {
  buildMandalaSvg,
  downloadSvg,
} from "@/lib/renderer/mandala-svg-renderer"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { MandalaConfig } from "@/types/mandala"

interface ControlPanelProps {
  config: MandalaConfig
  onUpdate: (partial: Partial<MandalaConfig>) => void
  onUpdateRings: (rings: number) => void
  onRandomize: (locked: Record<string, boolean>) => void
}

type LockedKey = "rings" | "symmetry" | "complexity" | "scale" | "colors"

const LOCKED_DEFAULTS: Record<LockedKey, boolean> = {
  rings: false,
  symmetry: false,
  complexity: false,
  scale: false,
  colors: false,
}

export function ControlPanel({
  config,
  onUpdate,
  onUpdateRings,
  onRandomize,
}: ControlPanelProps) {
  const [locked, setLocked] =
    useState<Record<LockedKey, boolean>>(LOCKED_DEFAULTS)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches
      if (!isMobile && drawerOpen) {
        setDrawerOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [drawerOpen])

  const toggleLock = (key: LockedKey) =>
    setLocked((prev) => ({ ...prev, [key]: !prev[key] }))

  const panelContent = (
    <PanelContent
      config={config}
      locked={locked}
      onUpdate={onUpdate}
      onUpdateRings={onUpdateRings}
      onRandomize={() => onRandomize(locked)}
      onToggleLock={toggleLock}
    />
  )

  return (
    <TooltipProvider>
      <aside className="hidden w-72 min-w-72 flex-col overflow-hidden border-l border-border bg-card md:flex">
        <div className="flex shrink-0 items-baseline justify-between px-5 pt-6 pb-5">
          <div>
            <h1 className="font-heading text-base font-medium tracking-[0.15em] uppercase">
              The Mandala Studio
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-[10px] text-muted-foreground/50 tabular-nums transition-colors hover:text-muted-foreground"
                  aria-label="Learn about seed"
                >
                  #{config.seed}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs text-xs">
                <div className="space-y-1">
                  <p className="font-medium">Seed: {config.seed}</p>
                  <p>
                    This unique number determines your mandala's pattern. Save
                    it to recreate the same design later.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <Separator />
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-5 py-5">{panelContent}</div>
        </ScrollArea>
      </aside>

      <div className="fixed right-6 bottom-20 z-50 flex flex-col gap-3 md:hidden">
        <Button
          size="icon-lg"
          variant="secondary"
          onClick={() => onRandomize(locked)}
          aria-label="Randomize mandala pattern"
          className="shadow-lg transition-all hover:shadow-xl"
        >
          <ShuffleIcon size={24} />
        </Button>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              size="icon-lg"
              aria-label="Open settings drawer"
              className="shadow-lg transition-all hover:shadow-xl"
            >
              <SlidersIcon size={24} />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] flex-col">
            <DrawerHeader className="shrink-0 border-b border-border px-5 pt-4 pb-3">
              <DrawerTitle className="font-heading text-sm tracking-[0.15em] uppercase">
                Settings
              </DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="min-h-0 flex-1">
              <div className="px-4 py-4">{panelContent}</div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </div>
    </TooltipProvider>
  )
}

interface PanelContentProps {
  config: MandalaConfig
  locked: Record<LockedKey, boolean>
  onUpdate: (partial: Partial<MandalaConfig>) => void
  onUpdateRings: (rings: number) => void
  onRandomize: () => void
  onToggleLock: (key: LockedKey) => void
}

function PanelContent({
  config,
  locked,
  onUpdate,
  onUpdateRings,
  onRandomize,
  onToggleLock,
}: PanelContentProps) {
  const [activeColorTab, setActiveColorTab] = useState<
    "background" | "primary" | "secondary" | "accent"
  >("background")

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <section className="flex flex-col gap-2 md:gap-4">
        <SliderField
          label="Rings"
          value={config.rings}
          min={2}
          max={8}
          step={1}
          locked={locked.rings}
          onLockToggle={() => onToggleLock("rings")}
          onValueChange={([v]) => onUpdateRings(v)}
          title="Number of concentric layers"
        />
        <SliderField
          label="Symmetry"
          value={config.symmetry}
          min={4}
          max={24}
          step={2}
          locked={locked.symmetry}
          onLockToggle={() => onToggleLock("symmetry")}
          onValueChange={([v]) => onUpdate({ symmetry: v })}
          title="Rotational sections (more = more symmetric)"
        />
        <SliderField
          label="Complexity"
          value={config.complexity}
          min={1}
          max={10}
          step={1}
          locked={locked.complexity}
          onLockToggle={() => onToggleLock("complexity")}
          onValueChange={([v]) => onUpdate({ complexity: v })}
          title="Detail density of patterns"
        />
        <SliderField
          label="Scale"
          value={config.scale}
          min={0.4}
          max={1.4}
          step={0.05}
          locked={locked.scale}
          onLockToggle={() => onToggleLock("scale")}
          onValueChange={([v]) => onUpdate({ scale: v })}
          format={(v) => v.toFixed(2)}
        />
        <SliderField
          label="Speed"
          value={config.speed}
          min={0}
          max={10}
          step={1}
          locked={!config.animate}
          onValueChange={([v]) => onUpdate({ speed: v })}
          title="Animation speed (only visible when Animate is enabled)"
        />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs tracking-widest text-muted-foreground uppercase">
            Colors
          </Label>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onToggleLock("colors")}
            aria-label={locked.colors ? "Unlock colors" : "Lock colors"}
          >
            {locked.colors ? (
              <LockIcon size={12} className="text-foreground" />
            ) : (
              <LockOpenIcon size={12} />
            )}
          </Button>
        </div>

        <div className="hidden grid-cols-2 gap-3 md:grid">
          {(
            [
              { key: "background", label: "Background" },
              { key: "primary", label: "Primary" },
              { key: "secondary", label: "Secondary" },
              { key: "accent", label: "Accent" },
            ] as const
          ).map(({ key, label }) => (
            <ColorField
              key={key}
              label={label}
              value={config.colors[key]}
              onChange={(v) =>
                onUpdate({ colors: { ...config.colors, [key]: v } })
              }
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          <div className="flex gap-1.5">
            {(
              [
                { key: "background", label: "BG" },
                { key: "primary", label: "Primary" },
                { key: "secondary", label: "Sec" },
                { key: "accent", label: "Accent" },
              ] as const
            ).map(({ key, label }) => (
              <Button
                key={key}
                variant={activeColorTab === key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveColorTab(key)}
                className="flex-1 gap-2 text-xs"
              >
                <div
                  className="h-3 w-3 rounded-full border border-current"
                  style={{
                    backgroundColor: config.colors[key],
                  }}
                />
                {label}
              </Button>
            ))}
          </div>
          {activeColorTab && (
            <ColorField
              label={
                activeColorTab.charAt(0).toUpperCase() + activeColorTab.slice(1)
              }
              value={config.colors[activeColorTab]}
              onChange={(v) =>
                onUpdate({ colors: { ...config.colors, [activeColorTab]: v } })
              }
              mobile
            />
          )}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="toggle-fill"
            className="text-xs tracking-widest text-muted-foreground uppercase"
            title="Fill shapes with colors"
          >
            Fill shapes
          </Label>
          <Switch
            id="toggle-fill"
            checked={config.fill}
            onCheckedChange={(v) => onUpdate({ fill: v })}
            aria-label="Toggle fill shapes"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="toggle-animate"
            className="text-xs tracking-widest text-muted-foreground uppercase"
            title="Enable animation loop"
          >
            Animate
          </Label>
          <Switch
            id="toggle-animate"
            checked={config.animate}
            onCheckedChange={(v) => onUpdate({ animate: v })}
            aria-label="Toggle animation"
          />
        </div>
      </section>

      <Separator />

      <Button onClick={onRandomize} className="w-full gap-2">
        <ShuffleIcon size={14} />
        Randomize
      </Button>

      <Separator />

      <ExportSection config={config} />
    </div>
  )
}

const SIZE_PRESETS = [
  { label: "Icon", value: 512, title: "512×512 - app icons, favicons" },
  { label: "HD", value: 1080, title: "1080×1080 - social media, print" },
  { label: "2K", value: 2048, title: "2048×2048 - high-res print" },
  { label: "4K", value: 4096, title: "4096×4096 - large format / posters" },
] as const

type SizePreset = (typeof SIZE_PRESETS)[number]["value"]

function ExportSection({ config }: { config: MandalaConfig }) {
  const [withAnimation, setWithAnimation] = useState(true)
  const [withBackground, setWithBackground] = useState(true)
  const [size, setSize] = useState<SizePreset>(2048)
  const [exporting, setExporting] = useState(false)

  const handleExport = () => {
    setExporting(true)
    // defer to next tick so the button state updates before the heavy SVG build
    setTimeout(() => {
      try {
        const svg = buildMandalaSvg(config, {
          withAnimation,
          withBackground,
          size,
        })
        downloadSvg(svg, `mandala-${config.seed}-${size}.svg`)
      } finally {
        setExporting(false)
      }
    }, 0)
  }

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-xs tracking-widest text-muted-foreground uppercase">
        Export SVG
      </Label>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-foreground/60">Size</Label>
        <div className="grid grid-cols-4 gap-1">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              title={preset.title}
              onClick={() => setSize(preset.value)}
              className={[
                "rounded-md border py-1 text-xs font-medium transition-colors",
                size === preset.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-foreground/70 hover:border-foreground/40 hover:text-foreground",
              ].join(" ")}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          {SIZE_PRESETS.find((p) => p.value === size)?.title}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label
          htmlFor="export-animate"
          className="text-xs text-foreground/80"
          title="Include SMIL animation - the exported SVG will spin when opened in a browser"
        >
          Animated
        </Label>
        <Switch
          id="export-animate"
          checked={withAnimation}
          onCheckedChange={setWithAnimation}
          aria-label="Include animation in SVG export"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label
          htmlFor="export-bg"
          className="text-xs text-foreground/80"
          title="Include the background color rectangle in the exported SVG"
        >
          Background
        </Label>
        <Switch
          id="export-bg"
          checked={withBackground}
          onCheckedChange={setWithBackground}
          aria-label="Include background in SVG export"
        />
      </div>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={handleExport}
        disabled={exporting}
        aria-label="Download mandala as SVG file"
      >
        <DownloadSimpleIcon size={14} />
        {exporting ? "Building…" : "Download SVG"}
      </Button>
    </div>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  locked?: boolean
  onLockToggle?: () => void
  onValueChange: (v: number[]) => void
  format?: (v: number) => string
  title?: string
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  locked,
  onLockToggle,
  onValueChange,
  format,
  title,
}: SliderFieldProps) {
  const id = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={id}
          className="text-xs tracking-widest text-muted-foreground uppercase"
          title={title}
        >
          {label}
        </Label>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-foreground/80 tabular-nums">
            {format ? format(value) : value}
          </span>
          {onLockToggle && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onLockToggle}
              aria-label={
                locked
                  ? `Unlock ${label} (will randomize on next shuffle)`
                  : `Lock ${label} (won't change when randomizing)`
              }
              title={
                locked
                  ? `Unlock ${label} (will randomize on next shuffle)`
                  : `Lock ${label} (won't change when randomizing)`
              }
              className="text-muted-foreground hover:text-foreground"
            >
              {locked ? (
                <LockIcon size={11} className="text-foreground" />
              ) : (
                <LockOpenIcon size={11} />
              )}
            </Button>
          )}
        </div>
      </div>
      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={locked}
        onValueChange={onValueChange}
      />
    </div>
  )
}

interface OklchColor {
  l: number
  c: number
  h: number
}

function parseOklchColor(colorString: string): OklchColor {
  const parsed = parse(colorString)
  if (parsed && parsed.mode === "oklch") {
    return {
      l: parsed.l ?? 0.5,
      c: parsed.c ?? 0.1,
      h: parsed.h ?? 0,
    }
  }

  return { l: 0.5, c: 0.1, h: 0 }
}

function oklchToString(color: OklchColor): string {
  return formatCss({
    mode: "oklch",
    l: Math.max(0, Math.min(1, color.l)),
    c: Math.max(0, Math.min(0.4, color.c)),
    h: ((color.h % 360) + 360) % 360,
  })
}

function ColorField({
  label,
  value,
  onChange,
  mobile = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  mobile?: boolean
}) {
  const baseId = `color-${label.toLowerCase()}`
  const color = parseOklchColor(value)

  const updateColor = (partial: Partial<OklchColor>) => {
    const updated = { ...color, ...partial }
    onChange(oklchToString(updated))
  }

  if (mobile) {
    return (
      <div className="flex flex-col gap-3 pl-1">
        <div
          id={`${baseId}-swatch`}
          className="h-12 w-full rounded-md border-2 border-border"
          style={{ backgroundColor: value }}
          role="img"
          aria-label={`${label} color preview: ${value}`}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`${baseId}-l`}
              className="text-xs font-medium text-foreground"
              title="Brightness: how light or dark the color is"
            >
              Brightness
            </Label>
            <span className="text-xs text-foreground/70 tabular-nums">
              {(color.l * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            id={`${baseId}-l`}
            value={[color.l]}
            min={0}
            max={1}
            step={0.02}
            onValueChange={([v]) => updateColor({ l: v })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`${baseId}-c`}
              className="text-xs font-medium text-foreground"
              title="Saturation: how vivid or muted the color is"
            >
              Saturation
            </Label>
            <span className="text-xs text-foreground/70 tabular-nums">
              {(color.c * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            id={`${baseId}-c`}
            value={[color.c]}
            min={0}
            max={0.4}
            step={0.01}
            onValueChange={([v]) => updateColor({ c: v })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`${baseId}-h`}
              className="text-xs font-medium text-foreground"
              title="Color: the shade from red around the color wheel"
            >
              Color
            </Label>
            <span className="text-xs text-foreground/70 tabular-nums">
              {color.h.toFixed(0)}°
            </span>
          </div>
          <Slider
            id={`${baseId}-h`}
            value={[color.h]}
            min={0}
            max={360}
            step={1}
            onValueChange={([v]) => updateColor({ h: v })}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Label
        htmlFor={`${baseId}-swatch`}
        className="text-[10px] tracking-wider text-muted-foreground uppercase"
      >
        {label}
      </Label>

      {/* Color swatch preview */}
      <div
        id={`${baseId}-swatch`}
        className="h-8 w-full rounded-sm border border-border"
        style={{ backgroundColor: value }}
        role="img"
        aria-label={`${label} color preview: ${value}`}
      />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`${baseId}-l`}
            className="text-[9px] tracking-wider text-muted-foreground/80 uppercase"
            title="Brightness: how light or dark the color is"
          >
            Brightness
          </Label>
          <span className="text-[9px] text-foreground/60 tabular-nums">
            {(color.l * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          id={`${baseId}-l`}
          value={[color.l]}
          min={0}
          max={1}
          step={0.02}
          onValueChange={([v]) => updateColor({ l: v })}
          className="h-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`${baseId}-c`}
            className="text-[9px] tracking-wider text-muted-foreground/80 uppercase"
            title="Saturation: how vivid or muted the color is"
          >
            Saturation
          </Label>
          <span className="text-[9px] text-foreground/60 tabular-nums">
            {(color.c * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          id={`${baseId}-c`}
          value={[color.c]}
          min={0}
          max={0.4}
          step={0.01}
          onValueChange={([v]) => updateColor({ c: v })}
          className="h-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`${baseId}-h`}
            className="text-[9px] tracking-wider text-muted-foreground/80 uppercase"
            title="Color: the shade from red around the color wheel"
          >
            Color
          </Label>
          <span className="text-[9px] text-foreground/60 tabular-nums">
            {color.h.toFixed(0)}°
          </span>
        </div>
        <Slider
          id={`${baseId}-h`}
          value={[color.h]}
          min={0}
          max={360}
          step={1}
          onValueChange={([v]) => updateColor({ h: v })}
          className="h-1"
        />
      </div>
    </div>
  )
}
