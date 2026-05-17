"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Droplets, Thermometer, Sprout } from "lucide-react"
import sikkimData from "@/lib/database/sikkim-data.json"

interface GrowthStage {
  stage: string
  duration_days: number
  temperature_range_C: { min: number; max: number }
  water_requirement_mm_per_day: number
  moisture_optimum_percent: number
  soil_type: string[]
}

interface CropData {
  name: string
  description: string
  growth_stages: GrowthStage[]
  total_growth_days: number
  recommended_irrigation_frequency_days: number
  notes: string
}

interface GrowthStageTrackerProps {
  cropId: string
  plantingDate: string
  boxId: string
}

export function GrowthStageTracker({ cropId, plantingDate, boxId }: GrowthStageTrackerProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [daysInCurrentStage, setDaysInCurrentStage] = useState(0)
  const [totalDaysElapsed, setTotalDaysElapsed] = useState(0)

  const cropData = sikkimData.crops[cropId as keyof typeof sikkimData.crops] as CropData

  useEffect(() => {
    if (!plantingDate || !cropData) return

    const planted = new Date(plantingDate)
    const today = new Date()
    const elapsed = Math.floor((today.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24))

    setTotalDaysElapsed(elapsed)

    // Calculate current stage
    let dayCount = 0
    let stageIndex = 0

    for (let i = 0; i < cropData.growth_stages.length; i++) {
      const stageDuration = cropData.growth_stages[i].duration_days
      if (elapsed <= dayCount + stageDuration) {
        stageIndex = i
        setDaysInCurrentStage(elapsed - dayCount)
        break
      }
      dayCount += stageDuration
      stageIndex = i + 1
    }

    setCurrentStage(Math.min(stageIndex, cropData.growth_stages.length - 1))
  }, [plantingDate, cropData])

  if (!cropData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Crop data not available for {cropId}</p>
        </CardContent>
      </Card>
    )
  }

  const currentStageData = cropData.growth_stages[currentStage]
  const stageProgress = currentStageData ? (daysInCurrentStage / currentStageData.duration_days) * 100 : 0
  const overallProgress = (totalDaysElapsed / cropData.total_growth_days) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" />
            {cropData.name} Growth Tracker
          </CardTitle>
          <CardDescription>{cropData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Days Since Planting</p>
              <p className="text-2xl font-bold text-green-600">{totalDaysElapsed}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Overall Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={Math.min(overallProgress, 100)} className="flex-1" />
                <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Stage: {currentStageData?.stage}</span>
            <Badge variant={currentStage === cropData.growth_stages.length - 1 ? "default" : "secondary"}>
              Stage {currentStage + 1} of {cropData.growth_stages.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Progress value={Math.min(stageProgress, 100)} className="flex-1" />
            <span className="text-sm font-medium">
              {daysInCurrentStage}/{currentStageData?.duration_days} days
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Water Need</p>
                <p className="text-sm text-muted-foreground">{currentStageData?.water_requirement_mm_per_day}mm/day</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Temperature</p>
                <p className="text-sm text-muted-foreground">
                  {currentStageData?.temperature_range_C.min}°C - {currentStageData?.temperature_range_C.max}°C
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-amber-500 rounded-full" />
              <div>
                <p className="text-sm font-medium">Soil Moisture</p>
                <p className="text-sm text-muted-foreground">{currentStageData?.moisture_optimum_percent}% optimal</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Suitable Soil Types</p>
            <div className="flex flex-wrap gap-2">
              {currentStageData?.soil_type.map((soil, index) => (
                <Badge key={index} variant="outline">
                  {soil}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Growth Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cropData.growth_stages.map((stage, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  index === currentStage
                    ? "bg-green-50 border-green-200"
                    : index < currentStage
                      ? "bg-gray-50 border-gray-200"
                      : "border-gray-100"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === currentStage
                      ? "bg-green-500 text-white"
                      : index < currentStage
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{stage.stage}</p>
                  <p className="text-sm text-muted-foreground">
                    {stage.duration_days} days • {stage.water_requirement_mm_per_day}mm water/day
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{stage.moisture_optimum_percent}%</p>
                  <p className="text-xs text-muted-foreground">moisture</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {cropData.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Growing Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{cropData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
