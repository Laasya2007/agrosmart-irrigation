"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Droplets, Calendar, TrendingUp } from "lucide-react"
import { getCropRecommendations, generatePlantingCalendar } from "@/lib/zone-utils"

interface CropRecommendationSystemProps {
  defaultLatitude?: number
  defaultLongitude?: number
  defaultElevation?: number
}

export function CropRecommendationSystem({
  defaultLatitude = 27.3389,
  defaultLongitude = 88.6065,
  defaultElevation = 1650,
}: CropRecommendationSystemProps) {
  const [latitude, setLatitude] = useState(defaultLatitude)
  const [longitude, setLongitude] = useState(defaultLongitude)
  const [elevation, setElevation] = useState(defaultElevation)
  const [soilType, setSoilType] = useState<string>("")
  const [selectedCrop, setSelectedCrop] = useState<string>("")
  const [recommendations, setRecommendations] = useState<any>(null)
  const [plantingCalendar, setPlantingCalendar] = useState<any>(null)

  const generateRecommendations = () => {
    const recs = getCropRecommendations(latitude, longitude, elevation, soilType)
    setRecommendations(recs)

    if (recs.recommendedCrops.length > 0) {
      setSelectedCrop(recs.recommendedCrops[0])
    }
  }

  useEffect(() => {
    generateRecommendations()
  }, [latitude, longitude, elevation, soilType])

  useEffect(() => {
    if (selectedCrop && recommendations) {
      const calendar = generatePlantingCalendar(selectedCrop, recommendations.zone)
      setPlantingCalendar(calendar)
    }
  }, [selectedCrop, recommendations])

  const getSlopeColor = (slope: string) => {
    switch (slope) {
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getZoneColor = (zoneId: string) => {
    switch (zoneId) {
      case "NS":
        return "bg-blue-500"
      case "ES":
        return "bg-green-500"
      case "SS":
        return "bg-orange-500"
      case "WS":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Location Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Plot Location & Characteristics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elevation">Elevation (m)</Label>
              <Input
                id="elevation"
                type="number"
                value={elevation}
                onChange={(e) => setElevation(Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type</Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="loamy">Loamy</SelectItem>
                  <SelectItem value="sandy-loam">Sandy Loam</SelectItem>
                  <SelectItem value="well-drained">Well-drained</SelectItem>
                  <SelectItem value="rich-loam">Rich Loam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generateRecommendations} className="mt-4">
            Generate Recommendations
          </Button>
        </CardContent>
      </Card>

      {/* Zone & Slope Analysis */}
      {recommendations && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zone Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.zone ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getZoneColor(recommendations.zone.id)} text-white`}>
                      {recommendations.zone.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendations.zone.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Temperature:</span>
                      <br />
                      {recommendations.zone.climate.temperature.min}°C - {recommendations.zone.climate.temperature.max}
                      °C
                    </div>
                    <div>
                      <span className="font-medium">Annual Rainfall:</span>
                      <br />
                      {recommendations.zone.climate.precipitation.annual_mm}mm
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Zone data not available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Slope Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${getSlopeColor(recommendations.slope)} text-white capitalize`}>
                    {recommendations.slope} Slope
                  </Badge>
                  <span className="text-sm text-muted-foreground">{elevation}m elevation</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      Water Need:
                    </span>
                    <div className="text-lg font-bold text-blue-600">{recommendations.waterRequirement}L/day</div>
                  </div>
                  <div>
                    <span className="font-medium">Irrigation:</span>
                    <br />
                    <span className="capitalize">{recommendations.irrigationFrequency}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Crop Recommendations */}
      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Recommended Crops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {recommendations.recommendedCrops.map((crop: string) => (
                <Button
                  key={crop}
                  variant={selectedCrop === crop ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCrop(crop)}
                  className="justify-start"
                >
                  {crop}
                </Button>
              ))}
            </div>

            {/* Selected Crop Details */}
            {selectedCrop && plantingCalendar && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-lg mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  {selectedCrop} - Planting Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium text-sm">Best Planting Months:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {plantingCalendar.bestPlantingMonths.map((month: string) => (
                        <Badge key={month} variant="secondary" className="text-xs">
                          {month}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Harvest Months:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {plantingCalendar.harvestMonths.map((month: string) => (
                        <Badge key={month} variant="outline" className="text-xs">
                          {month}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Growth Duration:</span>
                    <div className="text-lg font-bold text-green-600">{plantingCalendar.growthDuration} days</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
