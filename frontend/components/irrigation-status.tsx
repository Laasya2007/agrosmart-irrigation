"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Droplets, Clock, Zap } from "lucide-react"
import { useState } from "react"

interface IrrigationStatusProps {
  boxId: string
  isActive: boolean
  currentDuration?: number
  scheduledDuration?: number
  waterFlow?: number
  nextScheduled?: Date
}

export function IrrigationStatus({
  boxId,
  isActive,
  currentDuration = 0,
  scheduledDuration = 30,
  waterFlow = 0,
  nextScheduled,
}: IrrigationStatusProps) {
  const [isManualMode, setIsManualMode] = useState(false)
  const [manualDuration, setManualDuration] = useState(15)

  const handleManualStart = async () => {
    try {
      const response = await fetch(`/api/irrigation/${boxId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: manualDuration, trigger: "manual" }),
      })
      // Handle response
    } catch (error) {
      console.error("Failed to start irrigation:", error)
    }
  }

  const handleStop = async () => {
    try {
      const response = await fetch(`/api/irrigation/${boxId}/stop`, {
        method: "POST",
      })
      // Handle response
    } catch (error) {
      console.error("Failed to stop irrigation:", error)
    }
  }

  const formatNextScheduled = (date?: Date) => {
    if (!date) return "Not scheduled"
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `In ${hours}h ${minutes}m`
    }
    return `In ${minutes}m`
  }

  const progressPercentage = scheduledDuration > 0 ? (currentDuration / scheduledDuration) * 100 : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            Irrigation Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current State:</span>
            <Badge variant={isActive ? "default" : "secondary"} className="flex items-center gap-1">
              {isActive ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {isActive ? "Running" : "Stopped"}
            </Badge>
          </div>

          {isActive && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {currentDuration}m / {scheduledDuration}m
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Water Flow:</span>
                <div className="flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="font-mono">{waterFlow} L/min</span>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Next Scheduled:</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatNextScheduled(nextScheduled)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Manual Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration:
            </label>
            <select
              id="duration"
              value={manualDuration}
              onChange={(e) => setManualDuration(Number(e.target.value))}
              className="flex-1 px-3 py-1 border rounded-md text-sm"
              disabled={isActive}
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>

          <div className="flex gap-2">
            {!isActive ? (
              <Button onClick={handleManualStart} className="flex-1" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Start Irrigation
              </Button>
            ) : (
              <Button onClick={handleStop} variant="destructive" className="flex-1" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop Irrigation
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            <strong>Note:</strong> Manual irrigation will override scheduled watering. Use responsibly to avoid
            overwatering.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
