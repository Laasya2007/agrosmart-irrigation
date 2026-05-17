"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sprout, Calendar, Droplets } from "lucide-react"
import sikkimData from "@/lib/database/sikkim-data.json"

interface CropGrowthSummaryProps {
  cropId: string
  plantingDate: string
  boxId: string
}

export function CropGrowthSummary({ cropId, plantingDate, boxId }: CropGrowthSummaryProps) {
  const cropData = sikkimData.crops[cropId as keyof typeof sikkimData.crops]

  if (!cropData || !plantingDate) {
    return null
  }

  const planted = new Date(plantingDate)
  const today = new Date()
  const daysElapsed = Math.floor((today.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate current stage
  let dayCount = 0
  let currentStage = 0

  for (let i = 0; i < cropData.growth_stages.length; i++) {
    const stageDuration = cropData.growth_stages[i].duration_days
    if (daysElapsed <= dayCount + stageDuration) {
      currentStage = i
      break
    }
    dayCount += stageDuration
    currentStage = i + 1
  }

  currentStage = Math.min(currentStage, cropData.growth_stages.length - 1)
  const currentStageData = cropData.growth_stages[currentStage]
  const overallProgress = (daysElapsed / (cropData.total_growth_days || 100)) * 100

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sprout className="h-5 w-5 text-green-600" />
          {cropData.name || cropId} Growth
        </CardTitle>
        <CardDescription>Box {boxId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Day {daysElapsed}</span>
          </div>
          <Badge variant="secondary">{currentStageData?.stage || "Unknown"}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(Math.min(overallProgress, 100))}%</span>
          </div>
          <Progress value={Math.min(overallProgress, 100)} className="h-2" />
        </div>

        {currentStageData && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-500" />
              <span>{currentStageData.water_requirement_mm_per_day}mm/day</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <span>{currentStageData.moisture_optimum_percent}% moisture</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
