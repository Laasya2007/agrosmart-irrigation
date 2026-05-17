"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mountain, Droplets, TrendingUp, AlertTriangle, Shield, Target, BarChart3 } from "lucide-react"
import { generateSlopeAnalysis, generateElevationProfile, type SlopeAnalysisResult } from "@/lib/slope-analyzer"

export function AdvancedSlopeAnalyzer() {
  const [coordinates, setCoordinates] = useState({ lat: "27.3389", lon: "88.6065" })
  const [plotArea, setPlotArea] = useState("1000")
  const [baseElevation, setBaseElevation] = useState("1000")
  const [soilType, setSoilType] = useState("loamy")
  const [analysis, setAnalysis] = useState<SlopeAnalysisResult | null>(null)
  const [elevationProfile, setElevationProfile] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const performAnalysis = () => {
    if (!coordinates.lat || !coordinates.lon) return

    setIsAnalyzing(true)

    // Generate elevation profile
    const profile = generateElevationProfile(
      Number.parseFloat(coordinates.lat),
      Number.parseFloat(coordinates.lon),
      Number.parseInt(plotArea),
      Number.parseInt(baseElevation),
      50,
    )

    // Perform slope analysis
    const result = generateSlopeAnalysis(
      Number.parseFloat(coordinates.lat),
      Number.parseFloat(coordinates.lon),
      profile,
      Number.parseInt(plotArea),
      soilType,
    )

    setElevationProfile(profile)
    setAnalysis(result)
    setIsAnalyzing(false)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "moderate":
        return "bg-yellow-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Advanced Slope Analysis
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
              <Label htmlFor="area">Plot Area (m²)</Label>
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
                <option value="rocky">Rocky</option>
              </select>
            </div>
          </div>

          <Button
            onClick={performAnalysis}
            disabled={isAnalyzing || !coordinates.lat || !coordinates.lon}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : "Perform Slope Analysis"}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Terrain Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mountain className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-sm">Slope</span>
                </div>
                <div className="text-2xl font-bold">{analysis.terrain.slope_percentage.toFixed(1)}%</div>
                <Badge className={`${getQualityColor(analysis.terrain.slope_category)} text-white capitalize mt-1`}>
                  {analysis.terrain.slope_category}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Drainage</span>
                </div>
                <Badge className={`${getQualityColor(analysis.terrain.drainage_quality)} text-white capitalize`}>
                  {analysis.terrain.drainage_quality}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  Water Retention: {analysis.terrain.water_retention}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-sm">Erosion Risk</span>
                </div>
                <Badge className={`${getRiskColor(analysis.terrain.erosion_risk)} text-white capitalize`}>
                  {analysis.terrain.erosion_risk}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Access: {analysis.terrain.accessibility}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Yield Factor</span>
                </div>
                <div className="text-2xl font-bold">{(analysis.estimated_yield_factor * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">
                  {analysis.estimated_yield_factor > 1
                    ? "Above Average"
                    : analysis.estimated_yield_factor < 0.9
                      ? "Below Average"
                      : "Average"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="irrigation" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
                  <TabsTrigger value="crops">Crop Suitability</TabsTrigger>
                  <TabsTrigger value="conservation">Conservation</TabsTrigger>
                  <TabsTrigger value="profile">Elevation Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="irrigation" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        Recommended Irrigation System
                      </h4>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Method:</span>
                          <Badge className="bg-blue-600 text-white capitalize">
                            {analysis.irrigation_recommendations.method}
                          </Badge>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-medium">Frequency:</span>
                          <span className="capitalize">{analysis.irrigation_recommendations.frequency}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-medium">Duration:</span>
                          <span>{analysis.irrigation_recommendations.duration_minutes} minutes</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-medium">Water Pressure:</span>
                          <Badge variant="outline" className="capitalize">
                            {analysis.irrigation_recommendations.water_pressure}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h5 className="font-medium mb-2">System Benefits</h5>
                      <ul className="text-sm space-y-1">
                        {analysis.irrigation_recommendations.method === "drip" && (
                          <>
                            <li>• Water conservation on steep slopes</li>
                            <li>• Reduced erosion risk</li>
                            <li>• Precise water delivery</li>
                          </>
                        )}
                        {analysis.irrigation_recommendations.method === "sprinkler" && (
                          <>
                            <li>• Good coverage for moderate slopes</li>
                            <li>• Suitable for various crop types</li>
                            <li>• Moderate water efficiency</li>
                          </>
                        )}
                        {analysis.irrigation_recommendations.method === "flood" && (
                          <>
                            <li>• Cost-effective for flat terrain</li>
                            <li>• Suitable for water-intensive crops</li>
                            <li>• Simple maintenance</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="crops" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(analysis.crop_suitability).map(([level, crops]) => (
                      <div key={level} className="space-y-2">
                        <h4 className="font-medium capitalize flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getSuitabilityColor(level).split(" ")[0]}`}></div>
                          {level} Suitability
                        </h4>
                        <div className="space-y-1">
                          {crops.length > 0 ? (
                            crops.map((crop: string) => (
                              <Badge key={crop} className={getSuitabilityColor(level)}>
                                {crop}
                              </Badge>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">No crops in this category</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Yield Optimization Tips
                    </h5>
                    <ul className="text-sm space-y-1">
                      <li>• Focus on crops with excellent suitability for best returns</li>
                      <li>• Consider crop rotation to maintain soil health</li>
                      <li>• Implement recommended conservation measures</li>
                      <li>• Monitor soil moisture levels regularly</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="conservation" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      Recommended Conservation Measures
                    </h4>

                    {analysis.conservation_measures.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.conservation_measures.map((measure, index) => (
                          <div key={index} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{measure}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-sm">
                          <strong>Good news!</strong> Your terrain has low erosion risk and doesn't require special
                          conservation measures. Continue with regular farming practices and monitor soil health.
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <h5 className="font-medium mb-2">General Recommendations</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Regular soil testing to monitor nutrient levels</li>
                        <li>• Organic matter addition to improve soil structure</li>
                        <li>• Proper drainage maintenance</li>
                        <li>• Seasonal crop planning based on weather patterns</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="profile" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Elevation Profile Visualization</h4>

                    {/* Simple elevation chart */}
                    <div className="relative h-64 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 400 200">
                        <defs>
                          <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>

                        {/* Generate path from elevation data */}
                        <path
                          d={`M 0 ${
                            200 -
                            (
                              (elevationProfile[0]?.elevation - Math.min(...elevationProfile.map((p) => p.elevation))) /
                                (Math.max(...elevationProfile.map((p) => p.elevation)) -
                                  Math.min(...elevationProfile.map((p) => p.elevation)))
                            ) *
                              150
                          } 
                            ${elevationProfile
                              .map((point, index) => {
                                const x = (index / (elevationProfile.length - 1)) * 400
                                const y =
                                  200 -
                                  ((point.elevation - Math.min(...elevationProfile.map((p) => p.elevation))) /
                                    (Math.max(...elevationProfile.map((p) => p.elevation)) -
                                      Math.min(...elevationProfile.map((p) => p.elevation)))) *
                                    150
                                return `L ${x} ${y}`
                              })
                              .join(" ")} L 400 200 L 0 200 Z`}
                          fill="url(#elevationGradient)"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />

                        {/* Add elevation points */}
                        {elevationProfile.map((point, index) => {
                          const x = (index / (elevationProfile.length - 1)) * 400
                          const y =
                            200 -
                            ((point.elevation - Math.min(...elevationProfile.map((p) => p.elevation))) /
                              (Math.max(...elevationProfile.map((p) => p.elevation)) -
                                Math.min(...elevationProfile.map((p) => p.elevation)))) *
                              150
                          return (
                            <circle
                              key={index}
                              cx={x}
                              cy={y}
                              r="3"
                              fill="#3b82f6"
                              className="hover:r-5 transition-all cursor-pointer"
                            />
                          )
                        })}
                      </svg>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {Math.min(...elevationProfile.map((p) => p.elevation))}m
                        </div>
                        <div className="text-sm text-muted-foreground">Minimum</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {Math.round(
                            elevationProfile.reduce((sum, p) => sum + p.elevation, 0) / elevationProfile.length,
                          )}
                          m
                        </div>
                        <div className="text-sm text-muted-foreground">Average</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">
                          {Math.max(...elevationProfile.map((p) => p.elevation))}m
                        </div>
                        <div className="text-sm text-muted-foreground">Maximum</div>
                      </div>
                    </div>
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
