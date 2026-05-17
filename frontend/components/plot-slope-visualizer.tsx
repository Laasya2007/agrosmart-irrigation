"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mountain, Droplets, Sprout, TrendingUp } from "lucide-react"
import { mockPlotSubzones } from "@/lib/mock-data"
import type { PlotSubzone } from "@/lib/types"

interface PlotSlopeVisualizerProps {
  plotId?: string
}

export function PlotSlopeVisualizer({ plotId = "plot-001" }: PlotSlopeVisualizerProps) {
  const [subzones, setSubzones] = useState<PlotSubzone[]>([])
  const [selectedSubzone, setSelectedSubzone] = useState<PlotSubzone | null>(null)
  const [view, setView] = useState<"2d" | "3d">("2d")

  useEffect(() => {
    const plotSubzones = mockPlotSubzones.filter((sz) => sz.plotId === plotId)
    setSubzones(plotSubzones)
    if (plotSubzones.length > 0) {
      setSelectedSubzone(plotSubzones[0])
    }
  }, [plotId])

  const getSlopeColor = (slope: string) => {
    switch (slope) {
      case "high":
        return "#ef4444" // Red for high elevation/slope
      case "medium":
        return "#f59e0b" // Yellow for medium elevation/slope
      case "low":
        return "#10b981" // Green for low elevation/slope
      default:
        return "#6b7280"
    }
  }

  const getSlopeGradient = (slope: string) => {
    switch (slope) {
      case "high":
        return "from-red-400 to-red-600"
      case "medium":
        return "from-yellow-400 to-yellow-600"
      case "low":
        return "from-green-400 to-green-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return "bg-red-500"
    if (priority <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const totalArea = subzones.reduce((sum, sz) => sum + sz.area, 0)
  const totalWaterRequirement = subzones.reduce((sum, sz) => sum + sz.waterRequirement, 0)

  return (
    <div className="space-y-6">
      {/* Plot Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-green-600" />
            Plot Slope Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{subzones.length}</div>
              <div className="text-sm text-muted-foreground">Subzones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalArea.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Area (m²)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalWaterRequirement}</div>
              <div className="text-sm text-muted-foreground">Daily Water (L)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(subzones.reduce((sum, sz) => sum + sz.elevation, 0) / subzones.length)}m
              </div>
              <div className="text-sm text-muted-foreground">Avg Elevation</div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-4">
            <Button variant={view === "2d" ? "default" : "outline"} size="sm" onClick={() => setView("2d")}>
              2D View
            </Button>
            <Button variant={view === "3d" ? "default" : "outline"} size="sm" onClick={() => setView("3d")}>
              3D View
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slope Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Slope Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            {view === "2d" ? (
              <div className="space-y-4">
                {/* 2D Elevation Profile */}
                <div className="relative h-64 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden">
                  {subzones
                    .sort((a, b) => b.elevation - a.elevation)
                    .map((subzone, index) => {
                      const heightPercent = ((subzone.elevation - 1500) / 200) * 100
                      const topPercent = Math.max(0, 100 - heightPercent - 20)

                      return (
                        <div
                          key={subzone.id}
                          className={`absolute left-0 right-0 bg-gradient-to-r ${getSlopeGradient(subzone.slope)} opacity-80 cursor-pointer hover:opacity-100 transition-all border-2 ${
                            selectedSubzone?.id === subzone.id ? "border-white border-4" : "border-transparent"
                          }`}
                          style={{
                            top: `${topPercent}%`,
                            height: "20%",
                            zIndex: subzones.length - index,
                          }}
                          onClick={() => setSelectedSubzone(subzone)}
                        >
                          <div className="p-2 text-white text-sm font-medium">
                            {subzone.name}
                            <div className="text-xs opacity-90">{subzone.elevation}m</div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 3D-style Isometric View */}
                <div className="relative h-64 bg-gradient-to-br from-sky-200 to-green-200 rounded-lg overflow-hidden">
                  {subzones.map((subzone, index) => {
                    const size = Math.sqrt(subzone.area) / 10
                    const left = 20 + ((index * 25) % 60)
                    const top = 20 + Math.floor(index / 3) * 30

                    return (
                      <div
                        key={subzone.id}
                        className={`absolute cursor-pointer transition-all transform hover:scale-110 ${
                          selectedSubzone?.id === subzone.id ? "scale-110 z-10" : ""
                        }`}
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${size}px`,
                          height: `${size}px`,
                        }}
                        onClick={() => setSelectedSubzone(subzone)}
                      >
                        <div
                          className={`w-full h-full bg-gradient-to-br ${getSlopeGradient(subzone.slope)} rounded-lg shadow-lg border-2 ${
                            selectedSubzone?.id === subzone.id ? "border-white" : "border-transparent"
                          }`}
                        >
                          <div className="p-1 text-white text-xs font-medium">{subzone.name.split(" ")[0]}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded"></div>
                <span className="text-xs">High Slope</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
                <span className="text-xs">Medium Slope</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
                <span className="text-xs">Low Slope</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subzone Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subzone Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSubzone ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="crops">Crops</TabsTrigger>
                  <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">{selectedSubzone.name}</h3>
                      <Badge className={`${getSlopeColor(selectedSubzone.slope)} text-white capitalize`}>
                        {selectedSubzone.slope} Slope
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium flex items-center gap-1">
                          <Mountain className="h-4 w-4" />
                          Elevation:
                        </span>
                        <div className="text-lg font-bold">{selectedSubzone.elevation}m</div>
                      </div>
                      <div>
                        <span className="font-medium">Area:</span>
                        <div className="text-lg font-bold">{selectedSubzone.area.toLocaleString()}m²</div>
                      </div>
                      <div>
                        <span className="font-medium">Soil Type:</span>
                        <div className="text-sm">{selectedSubzone.soilType}</div>
                      </div>
                      <div>
                        <span className="font-medium flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Priority:
                        </span>
                        <Badge className={`${getPriorityColor(selectedSubzone.irrigationPriority)} text-white`}>
                          {selectedSubzone.irrigationPriority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="crops" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Sprout className="h-4 w-4 text-green-500" />
                      Recommended Crops
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedSubzone.recommendedCrops.map((crop) => (
                        <Badge key={crop} variant="secondary" className="justify-center">
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Based on {selectedSubzone.slope} slope characteristics and{" "}
                      {selectedSubzone.soilType.toLowerCase()} soil conditions.
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="irrigation" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        Daily Water Requirement
                      </span>
                      <div className="text-2xl font-bold text-blue-600">{selectedSubzone.waterRequirement}L</div>
                    </div>

                    <div>
                      <span className="font-medium">Irrigation Priority:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getPriorityColor(selectedSubzone.irrigationPriority)} text-white`}>
                          Priority {selectedSubzone.irrigationPriority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {selectedSubzone.irrigationPriority <= 2
                            ? "High Priority"
                            : selectedSubzone.irrigationPriority <= 3
                              ? "Medium Priority"
                              : "Low Priority"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm">
                        <strong>Irrigation Strategy:</strong>
                        <br />
                        {selectedSubzone.slope === "high" &&
                          "Drip irrigation recommended for water conservation on steep terrain."}
                        {selectedSubzone.slope === "medium" &&
                          "Sprinkler or drip irrigation suitable for moderate slopes."}
                        {selectedSubzone.slope === "low" &&
                          "Flood or furrow irrigation can be used effectively on flat terrain."}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a subzone from the visualization to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subzone Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subzone Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Subzone</th>
                  <th className="text-left p-2">Slope</th>
                  <th className="text-left p-2">Elevation</th>
                  <th className="text-left p-2">Area</th>
                  <th className="text-left p-2">Water Need</th>
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Main Crops</th>
                </tr>
              </thead>
              <tbody>
                {subzones.map((subzone) => (
                  <tr
                    key={subzone.id}
                    className={`border-b cursor-pointer hover:bg-muted ${
                      selectedSubzone?.id === subzone.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedSubzone(subzone)}
                  >
                    <td className="p-2 font-medium">{subzone.name}</td>
                    <td className="p-2">
                      <Badge className={`${getSlopeColor(subzone.slope)} text-white capitalize text-xs`}>
                        {subzone.slope}
                      </Badge>
                    </td>
                    <td className="p-2">{subzone.elevation}m</td>
                    <td className="p-2">{subzone.area.toLocaleString()}m²</td>
                    <td className="p-2">{subzone.waterRequirement}L</td>
                    <td className="p-2">
                      <Badge className={`${getPriorityColor(subzone.irrigationPriority)} text-white text-xs`}>
                        {subzone.irrigationPriority}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {subzone.recommendedCrops.slice(0, 2).map((crop) => (
                          <Badge key={crop} variant="outline" className="text-xs">
                            {crop}
                          </Badge>
                        ))}
                        {subzone.recommendedCrops.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{subzone.recommendedCrops.length - 2}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
