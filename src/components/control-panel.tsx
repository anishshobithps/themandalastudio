import { useState } from "react"
import { formatHex, parse } from "culori"
import { Shuffle, Lock, LockOpen, Sliders, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
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
    <>
      <aside className="hidden w-72 min-w-72 flex-col border-l border-border bg-card md:flex">
        <div className="flex flex-shrink-0 items-baseline justify-between px-5 pt-6 pb-5">
          <div>
            <h1 className="font-heading text-base font-medium tracking-[0.15em] uppercase">
              Mandala
            </h1>
            <p className="mt-0.5 text-[11px] tracking-[0.12em] text-muted-foreground">
              Generator
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
            #{config.seed}
          </span>
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
          <Shuffle size={18} />
        </Button>

        <Drawer>
          <DrawerTrigger asChild>
            <Button size="icon" aria-label="Open settings">
              <Sliders size={18} />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="flex items-center justify-between px-5 pt-4 pb-2">
              <DrawerTitle className="font-heading text-sm tracking-[0.15em] uppercase">
                Mandala Generator
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon-sm">
                  <X size={14} />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <ScrollArea className="max-h-[65dvh]">
              <div className="px-5 pb-8">{panelContent}</div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </div>
    </>
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
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <SliderField
          label="Rings"
          value={config.rings}
          min={2}
          max={8}
          step={1}
          locked={locked.rings}
          onLockToggle={() => onToggleLock("rings")}
          onValueChange={([v]) => onUpdateRings(v)}
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
          onValueChange={([v]) => onUpdate({ speed: v })}
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
              <Lock size={12} className="text-foreground" />
            ) : (
              <LockOpen size={12} />
            )}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="toggle-fill"
            className="text-xs tracking-widest text-muted-foreground uppercase"
          >
            Fill shapes
          </Label>
          <Switch
            id="toggle-fill"
            checked={config.fill}
            onCheckedChange={(v) => onUpdate({ fill: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="toggle-animate"
            className="text-xs tracking-widest text-muted-foreground uppercase"
          >
            Animate
          </Label>
          <Switch
            id="toggle-animate"
            checked={config.animate}
            onCheckedChange={(v) => onUpdate({ animate: v })}
          />
        </div>
      </section>

      <Separator />

      <Button onClick={onRandomize} className="w-full gap-2">
        <Shuffle size={14} />
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
}: SliderFieldProps) {
  const id = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-xs tracking-widest text-muted-foreground uppercase"
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
              aria-label={locked ? `Unlock ${label}` : `Lock ${label}`}
            >
              {locked ? (
                <Lock size={11} className="text-foreground" />
              ) : (
                <LockOpen size={11} />
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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const id = `color-${label.toLowerCase()}`
  const hex =
    formatHex(parse(value) ?? { mode: "rgb", r: 0.5, g: 0.5, b: 0.5 }) ??
    "#888888"

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-[10px] tracking-wider text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <Input
        id={id}
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-8 w-full cursor-pointer px-1 py-0.5",
          "[&::-webkit-color-swatch-wrapper]:p-0",
          "[&::-webkit-color-swatch]:rounded-sm",
          "[&::-webkit-color-swatch]:border-none"
        )}
      />
    </div>
  )
}
