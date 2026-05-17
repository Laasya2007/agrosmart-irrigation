"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { MapPin, TrendingUp, Calendar, Star, AlertTriangle, Lightbulb, BarChart3, Leaf, DollarSign } from "lucide-react"
import {
  generateEnhancedCropRecommendations,
  getCropGrowthDetails,
  type EnhancedCropRecommendation,
  type CropScore,
} from "@/lib/enhanced-crop-engine"

export function EnhancedCropRecommendationSystem() {
  const [coordinates, setCoordinates] = useState({ lat: "27.3389", lon: "88.6065" })
  const [elevation, setElevation] = useState("1000")
  const [plotArea, setPlotArea] = useState("1000")
  const [soilType, setSoilType] = useState("loamy")
  const [recommendations, setRecommendations] = useState<EnhancedCropRecommendation | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<CropScore | null>(null)
  const [cropDetails, setCropDetails] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const generateRecommendations = () => {
    if (!coordinates.lat || !coordinates.lon) return

    setIsAnalyzing(true)

    const result = generateEnhancedCropRecommendations(
      Number.parseFloat(coordinates.lat),
      Number.parseFloat(coordinates.lon),
      Number.parseInt(elevation),
      Number.parseInt(plotArea),
      soilType,
    )

    setRecommendations(result)
    if (result.cropScores.length > 0) {
      setSelectedCrop(result.cropScores[0])
    }
    setIsAnalyzing(false)
  }

  useEffect(() => {
    if (selectedCrop) {
      const details = getCropGrowthDetails(selectedCrop.crop)
      setCropDetails(details)
    }
  }, [selectedCrop])

  const getSuitabilityColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "bg-green-600 text-white"
      case "good":
        return "bg-blue-600 text-white"
      case "moderate":
        return "bg-yellow-600 text-white"
      case "poor":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getYieldColor = (potential: string) => {
    switch (potential) {
      case "high":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 65) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Enhanced Crop Recommendation System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={coordinates.lat}
                onChange={(e) => setCoordinates((prev) => ({ ...prev, lat: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lon">Longitude</Label>
              <Input
                id="lon"
                type="number"
                step="any"
                value={coordinates.lon}
                onChange={(e) => setCoordinates((prev) => ({ ...prev, lon: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elevation">Elevation (m)</Label>
              <Input id="elevation" type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Plot Area (m²)</Label>
              <Input id="area" type="number" value={plotArea} onChange={(e) => setPlotArea(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soil">Soil Type</Label>
              <select
                id="soil"
                className="w-full p-2 border rounded-md"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
              >
                <option value="loamy">Loamy</option>
                <option value="clay">Clay</option>
                <option value="sandy">Sandy</option>
                <option value="well-drained">Well-drained</option>
                <option value="rich-loam">Rich Loam</option>
              </select>
            </div>
          </div>

          <Button
            onClick={generateRecommendations}
            disabled={isAnalyzing || !coordinates.lat || !coordinates.lon}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : "Generate Enhanced Recommendations"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {recommendations && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Location</span>
                </div>
                <div className="text-lg font-bold">{recommendations.location.zone}</div>
                <Badge className="bg-blue-600 text-white capitalize mt-1">{recommendations.location.slope} Slope</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Sustainability</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{recommendations.sustainabilityScore}%</div>
                <Progress value={recommendations.sustainabilityScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-sm">Market Demand</span>
                </div>
                <Badge
                  className={`${
                    recommendations.marketInsights.demandLevel === "high"
                      ? "bg-green-600"
                      : recommendations.marketInsights.demandLevel === "medium"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                  } text-white capitalize`}
                >
                  {recommendations.marketInsights.demandLevel}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  {recommendations.marketInsights.marketAccess} access
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">Season</span>
                </div>
                <div className="text-lg font-bold">{recommendations.seasonalPlanning.currentSeason}</div>
                <div className="text-sm text-muted-foreground">
                  Next: {recommendations.seasonalPlanning.nextPlantingWindow}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Crop Analysis & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="crops" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="crops">Crop Scores</TabsTrigger>
                  <TabsTrigger value="details">Crop Details</TabsTrigger>
                  <TabsTrigger value="planning">Seasonal Planning</TabsTrigger>
                  <TabsTrigger value="environment">Environment</TabsTrigger>
                </TabsList>

                <TabsContent value="crops" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.cropScores.slice(0, 9).map((cropScore) => (
                      <Card
                        key={cropScore.crop}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedCrop?.crop === cropScore.crop ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => setSelectedCrop(cropScore)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{cropScore.crop}</h4>
                            <div className={`text-lg font-bold ${getScoreColor(cropScore.score)}`}>
                              {cropScore.score}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Badge className={getSuitabilityColor(cropScore.suitabilityLevel)}>
                              {cropScore.suitabilityLevel}
                            </Badge>

                            <div className="flex items-center gap-2">
                              <TrendingUp className={`h-4 w-4 ${getYieldColor(cropScore.yieldPotential)}`} />
                              <span className={`text-sm capitalize ${getYieldColor(cropScore.yieldPotential)}`}>
                                {cropScore.yieldPotential} yield
                              </span>
                            </div>

                            <Progress value={cropScore.score} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  {selectedCrop && cropDetails ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{selectedCrop.crop}</h3>
                        <Badge className={getSuitabilityColor(selectedCrop.suitabilityLevel)}>
                          Score: {selectedCrop.score}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              Advantages
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {selectedCrop.reasons.map((reason, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-sm">{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              Risk Factors
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {selectedCrop.riskFactors.length > 0 ? (
                              <ul className="space-y-2">
                                {selectedCrop.riskFactors.map((risk, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No significant risk factors identified
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-500" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedCrop.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Growth Stages */}
                      {cropDetails.growth_stages && cropDetails.growth_stages.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Growth Stages</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {cropDetails.growth_stages.map((stage: any, index: number) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{stage.stage}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {stage.duration_days} days •{" "}
                                      {stage.water_requirement_mm || stage.water_requirement_mm_per_day}mm water
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <div className="text-sm">
                                <strong>Total Duration:</strong> {cropDetails.total_days} days
                                <br />
                                <strong>Irrigation:</strong> {cropDetails.water_schedule}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Select a crop from the Crop Scores tab to view detailed information
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="planning" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Seasonal Planning</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <span className="font-medium">Current Season:</span>
                          <div className="text-lg font-bold text-blue-600">
                            {recommendations.seasonalPlanning.currentSeason}
                          </div>
                        </div>

                        <div>
                          <span className="font-medium">Next Planting Window:</span>
                          <div className="text-lg font-bold text-green-600">
                            {recommendations.seasonalPlanning.nextPlantingWindow}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Crop Rotation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {recommendations.seasonalPlanning.cropRotationSuggestions.map((suggestion, index) => (
                            <div key={index} className="p-3 bg-muted rounded-lg">
                              <div className="text-sm font-medium">{suggestion}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="environment" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Temperature Match</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-red-600 mb-2">
                          {recommendations.environmental.temperature_match.toFixed(0)}%
                        </div>
                        <Progress value={recommendations.environmental.temperature_match} className="mb-2" />
                        <div className="text-sm text-muted-foreground">Climate compatibility score</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Precipitation Match</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {recommendations.environmental.precipitation_match.toFixed(0)}%
                        </div>
                        <Progress value={recommendations.environmental.precipitation_match} className="mb-2" />
                        <div className="text-sm text-muted-foreground">Rainfall adequacy score</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Elevation Suitability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {recommendations.environmental.elevation_suitability.toFixed(0)}%
                        </div>
                        <Progress value={recommendations.environmental.elevation_suitability} className="mb-2" />
                        <div className="text-sm text-muted-foreground">Altitude compatibility score</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
