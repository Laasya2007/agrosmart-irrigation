"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation, Compass, Mountain, Droplets, Thermometer, Sprout } from "lucide-react"
import { classifyGPSZone, getZoneBasedCropRecommendations, sikkimZoneBoundaries } from "@/lib/gps-zone-classifier"

export function GPSZoneDashboard() {
  const [coordinates, setCoordinates] = useState({ lat: "", lon: "" })
  const [elevation, setElevation] = useState("")
  const [plotArea, setPlotArea] = useState("1000")
  const [zoneData, setZoneData] = useState<any>(null)
  const [isDetecting, setIsDetecting] = useState(false)

  const handleGPSDetection = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported by this browser")
      return
    }

    setIsDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude.toFixed(6),
          lon: position.coords.longitude.toFixed(6),
        })
        setIsDetecting(false)

        // Auto-analyze the detected location
        analyzeLocation(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        setIsDetecting(false)
        alert("GPS detection failed. Please enter coordinates manually.")
      },
    )
  }

  const analyzeLocation = (lat?: number, lon?: number, elev?: number, area?: number) => {
    const latitude = lat || Number.parseFloat(coordinates.lat)
    const longitude = lon || Number.parseFloat(coordinates.lon)
    const elevationValue = elev || Number.parseInt(elevation) || 1000
    const plotAreaValue = area || Number.parseInt(plotArea) || 1000

    if (!latitude || !longitude) return

    const zoneClassification = classifyGPSZone(latitude, longitude)
    const cropRecommendations = getZoneBasedCropRecommendations(latitude, longitude, elevationValue, plotAreaValue)

    setZoneData({
      classification: zoneClassification,
      recommendations: cropRecommendations,
      coordinates: { lat: latitude, lon: longitude },
      elevation: elevationValue,
      plotArea: plotAreaValue,
    })
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSlopeColor = (slope: string) => {
    switch (slope) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* GPS Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            GPS Zone Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="27.3389"
                value={coordinates.lat}
                onChange={(e) => setCoordinates((prev) => ({ ...prev, lat: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="88.6065"
                value={coordinates.lon}
                onChange={(e) => setCoordinates((prev) => ({ ...prev, lon: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elevation">Elevation (m)</Label>
              <Input
                id="elevation"
                type="number"
                placeholder="1000"
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plotArea">Plot Area (m²)</Label>
              <Input
                id="plotArea"
                type="number"
                placeholder="1000"
                value={plotArea}
                onChange={(e) => setPlotArea(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGPSDetection} disabled={isDetecting} className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {isDetecting ? "Detecting..." : "Detect GPS"}
            </Button>
            <Button onClick={() => analyzeLocation()} variant="outline" disabled={!coordinates.lat || !coordinates.lon}>
              Analyze Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone Classification Results */}
      {zoneData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zone Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-green-600" />
                  Zone Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Zone:</span>
                    <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                      {zoneData.classification.zone.name}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Confidence:</span>
                    <Badge
                      className={`${getConfidenceColor(zoneData.classification.confidence)} text-white capitalize`}
                    >
                      {zoneData.classification.confidence}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Method:</span>
                    <Badge variant="outline" className="capitalize">
                      {zoneData.classification.method}
                    </Badge>
                  </div>

                  {zoneData.classification.distance_km > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Distance:</span>
                      <span className="text-sm">{zoneData.classification.distance_km.toFixed(1)} km</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{zoneData.classification.zone.description}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Agricultural Suitability: {zoneData.classification.zone.agricultural_suitability}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Climate & Terrain */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-orange-600" />
                  Climate & Terrain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-sm">Temperature</span>
                    </div>
                    <div className="text-lg font-bold">
                      {zoneData.classification.zone.climate.temperature.min}°C -{" "}
                      {zoneData.classification.zone.climate.temperature.max}°C
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Precipitation</span>
                    </div>
                    <div className="text-lg font-bold">
                      {zoneData.classification.zone.climate.precipitation.annual_mm}mm/year
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-medium text-sm">Slope Category</span>
                    <Badge className={`${getSlopeColor(zoneData.recommendations.slope)} text-white capitalize`}>
                      {zoneData.recommendations.slope}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <span className="font-medium text-sm">Elevation Range</span>
                    <div className="text-sm">
                      {zoneData.classification.zone.elevation_range.min}m -{" "}
                      {zoneData.classification.zone.elevation_range.max}m
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="font-medium text-sm mb-1">Irrigation Strategy</div>
                  <div className="text-sm">{zoneData.recommendations.irrigationStrategy}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Crop Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                Crop Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recommended Crops</h4>
                  <div className="flex flex-wrap gap-2">
                    {zoneData.recommendations.recommendedCrops.map((crop: string) => (
                      <Badge key={crop} variant="secondary">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Best Planting Months</h4>
                  <div className="flex flex-wrap gap-2">
                    {zoneData.recommendations.plantingCalendar.bestMonths.map((month: string) => (
                      <Badge key={month} className="bg-green-600 text-white">
                        {month}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Water Requirement</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {zoneData.recommendations.waterRequirement}L/day
                  </div>
                  <div className="text-sm text-muted-foreground">For {zoneData.plotArea}m² plot</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zone Map Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Sikkim Agricultural Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(sikkimZoneBoundaries).map(([zoneName, zone]) => (
                  <div
                    key={zone.id}
                    className={`p-4 rounded-lg border-2 ${
                      zoneData.classification.zone.id === zone.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200"
                    }`}
                  >
                    <h4 className="font-medium mb-2">{zone.name}</h4>
                    <div className="text-sm space-y-1">
                      <div>
                        Elevation: {zone.elevation_range.min}m - {zone.elevation_range.max}m
                      </div>
                      <div>
                        Temp: {zone.climate.temperature.min}°C - {zone.climate.temperature.max}°C
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{zone.agricultural_suitability}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
