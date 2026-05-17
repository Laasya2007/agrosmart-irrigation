"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Droplets, AlertTriangle, TrendingDown } from "lucide-react"
import type { WaterTank, WaterUsage } from "@/lib/types"

interface WaterTankMonitorProps {
  tanks: WaterTank[]
  usage: WaterUsage[]
}

export function WaterTankMonitor({ tanks, usage }: WaterTankMonitorProps) {
  const [selectedTank, setSelectedTank] = useState<WaterTank | null>(tanks[0] || null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "maintenance":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getLevelColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-500"
    if (percentage >= 30) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getTankUsage = (tankId: string) => {
    return usage.filter((u) => u.tankId === tankId).reduce((total, u) => total + u.amountUsed, 0)
  }

  return (
    <div className="space-y-6">
      {/* Tank Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tanks.map((tank) => (
          <Card
            key={tank.id}
            className={`cursor-pointer transition-all ${selectedTank?.id === tank.id ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setSelectedTank(tank)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{tank.name}</CardTitle>
                <Badge className={`${getStatusColor(tank.status)} text-white`}>{tank.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">{tank.levelPercentage}%</span>
                </div>

                <Progress value={tank.levelPercentage} className="h-2" />

                <div className="text-xs text-muted-foreground">
                  {tank.currentLevel.toLocaleString()}L / {tank.capacity.toLocaleString()}L
                </div>

                {tank.levelPercentage <= tank.alerts.criticalLevel && (
                  <div className="flex items-center gap-1 text-red-500 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    Critical Level
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Tank View */}
      {selectedTank && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              {selectedTank.name} - Detailed View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Water Level */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Water Level</h4>
                <div className="text-3xl font-bold">{selectedTank.levelPercentage}%</div>
                <Progress value={selectedTank.levelPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {selectedTank.currentLevel.toLocaleString()}L of {selectedTank.capacity.toLocaleString()}L
                </p>
              </div>

              {/* Daily Usage */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Today's Usage</h4>
                <div className="text-2xl font-bold text-blue-600">{getTankUsage(selectedTank.id)}L</div>
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <TrendingDown className="h-3 w-3" />
                  15% less than yesterday
                </div>
              </div>

              {/* Sensor Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Sensor Type</h4>
                <div className="text-lg font-medium capitalize">{selectedTank.sensorType}</div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {selectedTank.lastUpdated.toLocaleTimeString()}
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Location</h4>
                <div className="text-sm">Elevation: {selectedTank.location.elevation}m</div>
                <div className="text-xs text-muted-foreground">
                  {selectedTank.location.latitude.toFixed(4)}, {selectedTank.location.longitude.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Alert Thresholds */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-3">Alert Thresholds</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-red-500 font-medium">Critical: </span>
                  {selectedTank.alerts.criticalLevel}%
                </div>
                <div>
                  <span className="text-yellow-500 font-medium">Low: </span>
                  {selectedTank.alerts.lowLevel}%
                </div>
                <div>
                  <span className="text-blue-500 font-medium">High: </span>
                  {selectedTank.alerts.highLevel}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
