import { useState, useEffect } from "react"
import { parse, formatCss } from "culori"
import {
  ShuffleIcon,
  LockIcon,
  LockOpenIcon,
  SlidersIcon,
  XIcon,
  CaretDownIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  Drawer,
  DrawerClose,
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
      <aside className="hidden w-72 min-w-72 flex-col border-l border-border bg-card md:flex">
        <div className="flex shrink-0 items-baseline justify-between px-5 pt-6 pb-5">
          <div>
            <h1 className="font-heading text-base font-medium tracking-[0.15em] uppercase">
              Mandala
            </h1>
            <p className="mt-0.5 text-[11px] tracking-[0.12em] text-muted-foreground">
              Generator
            </p>
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
        <ScrollArea className="flex-1">
          <div className="px-5 py-5">{panelContent}</div>
        </ScrollArea>
      </aside>

      <div className="fixed right-5 bottom-5 z-50 flex flex-col gap-3 md:hidden">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => onRandomize(locked)}
          aria-label="Randomize"
        >
          <ShuffleIcon size={18} />
        </Button>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button size="icon" aria-label="Open settings">
              <SlidersIcon size={18} />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] flex-col">
            <DrawerHeader className="flex shrink-0 items-center justify-between border-b border-border px-5 pt-4 pb-3">
              <DrawerTitle className="font-heading text-sm tracking-[0.15em] uppercase">
                Settings
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon-sm">
                  <XIcon size={14} />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <ScrollArea className="flex-1">
              <div className="px-4 py-4">{panelContent}</div>
            </ScrollArea>
            <div className="shrink-0 border-t border-border bg-card px-4 py-3">
              <Button
                onClick={() => {
                  onRandomize(locked)
                  setDrawerOpen(false)
                }}
                className="w-full gap-2"
                size="default"
              >
                <ShuffleIcon size={16} />
                Randomize & Close
              </Button>
            </div>
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
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* First-run help section */}
      <Collapsible
        open={showHelp}
        onOpenChange={setShowHelp}
        defaultOpen={false}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 justify-start gap-2 px-0 text-xs font-normal"
          >
            <CaretDownIcon size={12} className="transition-transform" />
            Getting Started
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2 pb-4 text-[13px] leading-relaxed text-foreground/80">
          <p>
            <strong>Rings</strong>: Number of concentric layers
          </p>
          <p>
            <strong>Symmetry</strong>: Rotational sections (more = more
            symmetric)
          </p>
          <p>
            <strong>Complexity</strong>: Detail density
          </p>
          <p>
            <strong>Scale</strong>: Size of the mandala
          </p>
          <p>
            <strong>Lock</strong> values to keep them when randomizing
          </p>
        </CollapsibleContent>
      </Collapsible>

      <Separator />
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
          description="Number of concentric layers"
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
          description="Rotational sections (more = more symmetric)"
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
          description="Detail density of patterns"
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
        {config.animate && (
          <SliderField
            label="Speed"
            value={config.speed}
            min={0}
            max={10}
            step={1}
            onValueChange={([v]) => onUpdate({ speed: v })}
            title="Animation speed (only visible when Animate is enabled)"
          />
        )}
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

        {/* Desktop: 2x2 grid */}
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

        {/* Mobile: Full-width stacked colors */}
        <div className="flex flex-col gap-4 md:hidden">
          {(
            [
              { key: "background", label: "Background" },
              { key: "primary", label: "Primary" },
              { key: "secondary", label: "Secondary" },
              { key: "accent", label: "Accent" },
            ] as const
          ).map(({ key, label }) => (
            <Collapsible key={key} defaultOpen={key === "background"}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group w-full justify-between gap-2 px-2 py-2 text-sm font-medium transition-colors hover:bg-muted/40"
                >
                  <span className="flex items-center gap-2.5 transition-colors group-hover:text-foreground">
                    <div
                      className="h-5 w-5 rounded border-2 border-border transition-all group-hover:border-foreground/50"
                      style={{
                        backgroundColor: config.colors[key],
                      }}
                    />
                    {label}
                  </span>
                  <CaretDownIcon
                    size={14}
                    className="transition-transform duration-200 group-hover:text-foreground/70 data-[state=open]:rotate-180"
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 pb-1">
                <ColorField
                  label={label}
                  value={config.colors[key]}
                  onChange={(v) =>
                    onUpdate({ colors: { ...config.colors, [key]: v } })
                  }
                  mobile
                />
              </CollapsibleContent>
            </Collapsible>
          ))}
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
  description?: string
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
  description,
}: SliderFieldProps) {
  const id = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={id}
          className="text-xs tracking-widest text-muted-foreground uppercase"
          title={title || description}
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

  // Fallback to default if parsing fails
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
  compact = false,
  mobile = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  compact?: boolean
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
        {/* Color swatch preview - larger for touch */}
        <div
          id={`${baseId}-swatch`}
          className="h-12 w-full rounded-md border-2 border-border"
          style={{ backgroundColor: value }}
          role="img"
          aria-label={`${label} color preview: ${value}`}
        />

        {/* Brightness slider */}
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

        {/* Saturation slider */}
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

        {/* Color slider */}
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

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <Label
          htmlFor={`${baseId}-swatch`}
          className="text-[9px] tracking-wider text-muted-foreground uppercase"
        >
          {label}
        </Label>

        {/* Color swatch preview */}
        <div
          id={`${baseId}-swatch`}
          className="h-6 w-full rounded-sm border border-border"
          style={{ backgroundColor: value }}
          role="img"
          aria-label={`${label} color preview: ${value}`}
        />

        {/* Brightness slider */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`${baseId}-l`}
              className="text-[8px] tracking-wider text-muted-foreground/70 uppercase"
              title="Brightness: how light or dark the color is"
            >
              Brightness
            </Label>
            <span className="text-[8px] text-foreground/50 tabular-nums">
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

        {/* Saturation slider */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`${baseId}-c`}
              className="text-[8px] tracking-wider text-muted-foreground/70 uppercase"
              title="Saturation: how vivid or muted the color is"
            >
              Saturation
            </Label>
            <span className="text-[8px] text-foreground/50 tabular-nums">
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

        {/* Color slider */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`${baseId}-h`}
              className="text-[8px] tracking-wider text-muted-foreground/70 uppercase"
              title="Color: the shade from red around the color wheel"
            >
              Color
            </Label>
            <span className="text-[8px] text-foreground/50 tabular-nums">
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

      {/* Brightness slider */}
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

      {/* Saturation slider */}
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

      {/* Color slider */}
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
