"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Droplets, AlertTriangle, TrendingUp, TrendingDown, Mountain, Calendar } from "lucide-react"
import { WaterTankMonitor } from "./water-tank-monitor"
import { CropRecommendationSystem } from "./crop-recommendation-system"
import { PlotSlopeVisualizer } from "./plot-slope-visualizer"
import { mockWaterTanks, mockWaterUsage, mockPlotSubzones } from "@/lib/mock-data"
import type { WaterTank, WaterUsage, PlotSubzone } from "@/lib/types"

export function IntegratedWaterDashboard() {
  const [tanks, setTanks] = useState<WaterTank[]>([])
  const [usage, setUsage] = useState<WaterUsage[]>([])
  const [subzones, setSubzones] = useState<PlotSubzone[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    setTanks(mockWaterTanks)
    setUsage(mockWaterUsage)
    setSubzones(mockPlotSubzones)
  }, [])

  // Calculate water management metrics
  const totalCapacity = tanks.reduce((sum, tank) => sum + tank.capacity, 0)
  const totalCurrentWater = tanks.reduce((sum, tank) => sum + tank.currentLevel, 0)
  const overallWaterLevel = Math.round((totalCurrentWater / totalCapacity) * 100)

  const totalDailyRequirement = subzones.reduce((sum, zone) => sum + zone.waterRequirement, 0)
  const todayUsage = usage.reduce((sum, u) => sum + u.amountUsed, 0)

  const criticalTanks = tanks.filter((tank) => tank.levelPercentage <= tank.alerts.criticalLevel)
  const lowTanks = tanks.filter(
    (tank) => tank.levelPercentage <= tank.alerts.lowLevel && tank.levelPercentage > tank.alerts.criticalLevel,
  )

  // Smart irrigation recommendations
  const getIrrigationRecommendations = () => {
    const recommendations = []

    if (criticalTanks.length > 0) {
      recommendations.push({
        type: "critical",
        message: `${criticalTanks.length} tank(s) at critical level. Prioritize high-priority subzones only.`,
        action: "Activate emergency water conservation mode",
      })
    }

    if (overallWaterLevel < 30) {
      recommendations.push({
        type: "warning",
        message: "Overall water level low. Consider rainwater harvesting or external water source.",
        action: "Check weather forecast for upcoming rainfall",
      })
    }

    if (todayUsage > totalDailyRequirement * 1.2) {
      recommendations.push({
        type: "info",
        message: "Water usage 20% above planned requirement. Review irrigation efficiency.",
        action: "Optimize irrigation schedules",
      })
    }

    return recommendations
  }

  const recommendations = getIrrigationRecommendations()

  return (
    <div className="space-y-6">
      {/* Water Management Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Water</p>
                <p className="text-2xl font-bold">{overallWaterLevel}%</p>
                <Progress value={overallWaterLevel} className="h-2 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Today's Usage</p>
                <p className="text-2xl font-bold">{todayUsage}L</p>
                <p className="text-xs text-muted-foreground">of {totalDailyRequirement}L planned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Critical Tanks</p>
                <p className="text-2xl font-bold">{criticalTanks.length}</p>
                <p className="text-xs text-muted-foreground">{lowTanks.length} low level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mountain className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Subzones</p>
                <p className="text-2xl font-bold">{subzones.length}</p>
                <p className="text-xs text-muted-foreground">
                  {subzones.filter((sz) => sz.irrigationPriority <= 2).length} high priority
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Smart Water Management Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Alert
                  key={index}
                  className={
                    rec.type === "critical"
                      ? "border-red-500 bg-red-50"
                      : rec.type === "warning"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-blue-500 bg-blue-50"
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{rec.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rec.action}</p>
                      </div>
                      <Badge
                        variant={
                          rec.type === "critical" ? "destructive" : rec.type === "warning" ? "secondary" : "default"
                        }
                      >
                        {rec.type}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrated Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tanks">Water Tanks</TabsTrigger>
          <TabsTrigger value="plots">Plot Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Crop Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Water Distribution by Subzone */}
          <Card>
            <CardHeader>
              <CardTitle>Water Distribution Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subzones
                  .sort((a, b) => a.irrigationPriority - b.irrigationPriority)
                  .map((subzone) => {
                    const percentage = (subzone.waterRequirement / totalDailyRequirement) * 100
                    const availableWater = (overallWaterLevel / 100) * totalCapacity
                    const canIrrigate = availableWater >= subzone.waterRequirement

                    return (
                      <div key={subzone.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{subzone.name}</h4>
                            <Badge
                              variant={
                                subzone.irrigationPriority <= 2
                                  ? "destructive"
                                  : subzone.irrigationPriority <= 3
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              Priority {subzone.irrigationPriority}
                            </Badge>
                            <Badge
                              className={`${
                                subzone.slope === "high"
                                  ? "bg-red-500"
                                  : subzone.slope === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              } text-white capitalize`}
                            >
                              {subzone.slope}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{subzone.waterRequirement}L needed</span>
                            <span>{percentage.toFixed(1)}% of total</span>
                            <span>{subzone.area.toLocaleString()}m²</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <Badge variant={canIrrigate ? "default" : "destructive"}>
                            {canIrrigate ? "Ready" : "Insufficient"}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Droplets className="h-4 w-4" />
                  Start Irrigation
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <AlertTriangle className="h-4 w-4" />
                  Emergency Mode
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  Schedule Update
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <TrendingUp className="h-4 w-4" />
                  Optimize Usage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tanks">
          <WaterTankMonitor tanks={tanks} usage={usage} />
        </TabsContent>

        <TabsContent value="plots">
          <PlotSlopeVisualizer />
        </TabsContent>

        <TabsContent value="recommendations">
          <CropRecommendationSystem />
        </TabsContent>
      </Tabs>
    </div>
  )
}
