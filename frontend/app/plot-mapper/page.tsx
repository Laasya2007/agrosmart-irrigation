"use client"

import { InteractivePlotMapper } from "@/components/interactive-plot-mapper"

export default function PlotMapperPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interactive Plot Mapper</h1>
        <p className="text-muted-foreground">
          Visualize and analyze your agricultural plots with GPS-based zoning, slope analysis, and crop recommendations.
        </p>
      </div>

      <InteractivePlotMapper />
    </div>
  )
}
