import { PlotSlopeVisualizer } from "@/components/plot-slope-visualizer"

export default function PlotsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-800">Plot Management</h1>
        <p className="text-muted-foreground mt-2">
          Visualize and manage your plot's slope distribution, subzones, and irrigation planning
        </p>
      </div>

      <PlotSlopeVisualizer />
    </div>
  )
}
