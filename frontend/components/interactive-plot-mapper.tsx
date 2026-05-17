"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Map, Layers, Zap, Droplets, Mountain, Sprout, Eye, EyeOff, RotateCcw, Download } from "lucide-react"
import { generatePlotSubzones } from "@/lib/gps-zone-classifier"
import { generateEnhancedCropRecommendations } from "@/lib/enhanced-crop-engine"

interface PlotSubzone {
  id: string
  name: string
  coordinates: { lat: number; lon: number }[]
  slope: "high" | "medium" | "low"
  elevation: number
  area: number
  recommendedCrops: string[]
  waterRequirement: number
  irrigationPriority: number
  cropScore?: number
  soilType?: string
}

interface MapLayer {
  id: string
  name: string
  visible: boolean
  color: string
  opacity: number
}

export function InteractivePlotMapper() {
  const [plotCenter, setPlotCenter] = useState({ lat: "27.3389", lon: "88.6065" })
  const [plotArea, setPlotArea] = useState("2000")
  const [baseElevation, setBaseElevation] = useState("1000")
  const [subzones, setSubzones] = useState<PlotSubzone[]>([])
  const [selectedSubzone, setSelectedSubzone] = useState<PlotSubzone | null>(null)
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: "elevation", name: "Elevation", visible: true, color: "#3b82f6", opacity: 0.7 },
    { id: "crops", name: "Crop Zones", visible: true, color: "#10b981", opacity: 0.6 },
    { id: "irrigation", name: "Irrigation Priority", visible: false, color: "#f59e0b", opacity: 0.5 },
    { id: "soil", name: "Soil Types", visible: false, color: "#8b5cf6", opacity: 0.4 },
  ])
  const [mapView, setMapView] = useState<"2d" | "3d" | "satellite">("2d")
  const [zoomLevel, setZoomLevel] = useState([50])
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePlotMap = async () => {
    if (!plotCenter.lat || !plotCenter.lon) return

    setIsGenerating(true)

    try {
      // Generate subzones based on GPS and area
      const generatedSubzones = generatePlotSubzones(
        Number.parseFloat(plotCenter.lat),
        Number.parseFloat(plotCenter.lon),
        Number.parseInt(plotArea),
        { min: Number.parseInt(baseElevation) - 30, max: Number.parseInt(baseElevation) + 50 },
      )

      // Enhance each subzone with detailed analysis
      const enhancedSubzones = await Promise.all(
        generatedSubzones.map(async (subzone) => {
          const cropRecommendations = generateEnhancedCropRecommendations(
            subzone.coordinates[0].lat,
            subzone.coordinates[0].lon,
            subzone.elevation,
            subzone.area,
          )

          return {
            ...subzone,
            cropScore: cropRecommendations.cropScores[0]?.score || 50,
            soilType: subzone.slope === "high" ? "rocky" : subzone.slope === "medium" ? "loamy" : "clay",
          }
        }),
      )

      setSubzones(enhancedSubzones)
      if (enhancedSubzones.length > 0) {
        setSelectedSubzone(enhancedSubzones[0])
      }
    } catch (error) {
      console.error("Error generating plot map:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleLayer = (layerId: string) => {
    setMapLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)))
  }

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setMapLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, opacity: opacity / 100 } : layer)))
  }

  const getSlopeColor = (slope: string) => {
    switch (slope) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      case "low":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return "#ef4444"
    if (priority <= 3) return "#f59e0b"
    return "#10b981"
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"
    if (score >= 60) return "#3b82f6"
    if (score >= 40) return "#f59e0b"
    return "#ef4444"
  }

  // Calculate plot statistics
  const totalWaterRequirement = subzones.reduce((sum, sz) => sum + sz.waterRequirement, 0)
  const avgCropScore =
    subzones.length > 0 ? Math.round(subzones.reduce((sum, sz) => sum + (sz.cropScore || 0), 0) / subzones.length) : 0
  const highPriorityZones = subzones.filter((sz) => sz.irrigationPriority <= 2).length

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-blue-600" />
            Interactive Plot Mapper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Center Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={plotCenter.lat}
                onChange={(e) => setPlotCenter((prev) => ({ ...prev, lat: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lon">Center Longitude</Label>
              <Input
                id="lon"
                type="number"
                step="any"
                value={plotCenter.lon}
                onChange={(e) => setPlotCenter((prev) => ({ ...prev, lon: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Total Area (m²)</Label>
              <Input id="area" type="number" value={plotArea} onChange={(e) => setPlotArea(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elevation">Base Elevation (m)</Label>
              <Input
                id="elevation"
                type="number"
                value={baseElevation}
                onChange={(e) => setBaseElevation(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generatePlotMap}
              disabled={isGenerating || !plotCenter.lat || !plotCenter.lon}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Plot Map"}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plot Statistics */}
      {subzones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Subzones</span>
              </div>
              <div className="text-2xl font-bold">{subzones.length}</div>
              <div className="text-sm text-muted-foreground">{Number.parseInt(plotArea).toLocaleString()}m² total</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Water Need</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{totalWaterRequirement}L</div>
              <div className="text-sm text-muted-foreground">per day</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sprout className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Avg Crop Score</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(avgCropScore)}`}>{avgCropScore}%</div>
              <div className="text-sm text-muted-foreground">suitability</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mountain className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-sm">High Priority</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{highPriorityZones}</div>
              <div className="text-sm text-muted-foreground">irrigation zones</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Mapping Interface */}
      {subzones.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Visualization */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Plot Visualization</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={mapView === "2d" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMapView("2d")}
                    >
                      2D
                    </Button>
                    <Button
                      variant={mapView === "3d" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMapView("3d")}
                    >
                      3D
                    </Button>
                    <Button
                      variant={mapView === "satellite" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMapView("satellite")}
                    >
                      Satellite
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Interactive Map Canvas */}
                <div className="relative h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <svg className="w-full h-full" viewBox="0 0 400 300">
                    {/* Background grid */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Render subzones */}
                    {subzones.map((subzone, index) => {
                      const centerX = 100 + (index % 2) * 200
                      const centerY = 75 + Math.floor(index / 2) * 150
                      const size = Math.sqrt(subzone.area) / 15

                      // Determine fill color based on active layers
                      let fillColor = getSlopeColor(subzone.slope)
                      let opacity = 0.7

                      if (mapLayers.find((l) => l.id === "crops" && l.visible)) {
                        fillColor = getScoreColor(subzone.cropScore || 50)
                        opacity = mapLayers.find((l) => l.id === "crops")?.opacity || 0.6
                      } else if (mapLayers.find((l) => l.id === "irrigation" && l.visible)) {
                        fillColor = getPriorityColor(subzone.irrigationPriority)
                        opacity = mapLayers.find((l) => l.id === "irrigation")?.opacity || 0.5
                      }

                      return (
                        <g key={subzone.id}>
                          {/* Subzone polygon */}
                          <polygon
                            points={`${centerX - size},${centerY - size} ${centerX + size},${centerY - size} ${centerX + size},${centerY + size} ${centerX - size},${centerY + size}`}
                            fill={fillColor}
                            fillOpacity={opacity}
                            stroke={selectedSubzone?.id === subzone.id ? "#ffffff" : "#000000"}
                            strokeWidth={selectedSubzone?.id === subzone.id ? "3" : "1"}
                            className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all"
                            onClick={() => setSelectedSubzone(subzone)}
                          />

                          {/* Subzone label */}
                          <text
                            x={centerX}
                            y={centerY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-medium fill-white pointer-events-none"
                          >
                            {subzone.name.split(" ")[0]}
                          </text>

                          {/* Elevation indicator */}
                          <text
                            x={centerX}
                            y={centerY + 12}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs fill-white opacity-80 pointer-events-none"
                          >
                            {subzone.elevation}m
                          </text>
                        </g>
                      )
                    })}

                    {/* Compass */}
                    <g transform="translate(350, 50)">
                      <circle cx="0" cy="0" r="25" fill="white" fillOpacity="0.9" stroke="#333" strokeWidth="1" />
                      <path d="M 0 -20 L 5 -5 L 0 0 L -5 -5 Z" fill="#ef4444" />
                      <text x="0" y="-30" textAnchor="middle" className="text-xs font-bold">
                        N
                      </text>
                    </g>

                    {/* Scale */}
                    <g transform="translate(20, 270)">
                      <line x1="0" y1="0" x2="50" y2="0" stroke="#333" strokeWidth="2" />
                      <line x1="0" y1="-3" x2="0" y2="3" stroke="#333" strokeWidth="2" />
                      <line x1="50" y1="-3" x2="50" y2="3" stroke="#333" strokeWidth="2" />
                      <text x="25" y="15" textAnchor="middle" className="text-xs">
                        50m
                      </text>
                    </g>
                  </svg>

                  {/* Zoom Control */}
                  <div className="absolute top-4 left-4 bg-white rounded-lg p-2 shadow-md">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs">Zoom: {zoomLevel[0]}%</Label>
                      <Slider
                        value={zoomLevel}
                        onValueChange={setZoomLevel}
                        max={200}
                        min={25}
                        step={25}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>

                {/* Map Legend */}
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs">High Slope/Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-xs">Medium Slope/Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs">Low Slope/High Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs">Good Crop Score</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Layer Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Map Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mapLayers.map((layer) => (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleLayer(layer.id)} className="p-1">
                          {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <span className="text-sm font-medium">{layer.name}</span>
                      </div>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: layer.color, opacity: layer.opacity }}
                      ></div>
                    </div>
                    {layer.visible && (
                      <div className="ml-6">
                        <Label className="text-xs">Opacity: {Math.round(layer.opacity * 100)}%</Label>
                        <Slider
                          value={[layer.opacity * 100]}
                          onValueChange={(value) => updateLayerOpacity(layer.id, value[0])}
                          max={100}
                          min={10}
                          step={10}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Subzone Details */}
            {selectedSubzone && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedSubzone.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Slope:</span>
                      <Badge className={`ml-1 ${getSlopeColor(selectedSubzone.slope)} text-white capitalize text-xs`}>
                        {selectedSubzone.slope}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Elevation:</span>
                      <span className="ml-1">{selectedSubzone.elevation}m</span>
                    </div>
                    <div>
                      <span className="font-medium">Area:</span>
                      <span className="ml-1">{selectedSubzone.area.toLocaleString()}m²</span>
                    </div>
                    <div>
                      <span className="font-medium">Water:</span>
                      <span className="ml-1">{selectedSubzone.waterRequirement}L/day</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">Crop Score:</span>
                    <div className={`text-lg font-bold ${getScoreColor(selectedSubzone.cropScore || 50)}`}>
                      {selectedSubzone.cropScore || 50}%
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">Recommended Crops:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSubzone.recommendedCrops.slice(0, 3).map((crop) => (
                        <Badge key={crop} variant="secondary" className="text-xs">
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">Priority:</span>
                    <Badge
                      className={`ml-1 ${getPriorityColor(selectedSubzone.irrigationPriority)} text-white text-xs`}
                    >
                      {selectedSubzone.irrigationPriority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
