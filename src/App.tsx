import { MandalaCanvas } from "@/components/mandala-canvas"
import { ControlPanel } from "@/components/control-panel"
import { ErrorBoundary } from "@/components/error-boundary"
import { AppFooter } from "@/components/app-footer"
import { useMandalaConfig } from "@/hooks/use-mangala-config"

export default function App() {
  const { config, update, updateRings, randomize } = useMandalaConfig()

  return (
    <ErrorBoundary>
      <div className="flex h-dvh w-full overflow-hidden pb-14 md:pb-0">
        <MandalaCanvas config={config} />
        <ControlPanel
          config={config}
          onUpdate={update}
          onUpdateRings={updateRings}
          onRandomize={randomize}
        />
      </div>
      <AppFooter />
    </ErrorBoundary>
  )
}
