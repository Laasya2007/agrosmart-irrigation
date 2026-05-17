"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Droplets, Thermometer, Sun, Zap, Activity } from "lucide-react"
import type { SensorReading } from "@/lib/types"

interface SensorCardProps {
  reading: SensorReading
  title: string
  className?: string
}

export function SensorCard({ reading, title, className }: SensorCardProps) {
  const getSensorIcon = (type: string) => {
    switch (type) {
      case "moisture":
        return <Droplets className="h-4 w-4 text-blue-600" />
      case "temperature":
        return <Thermometer className="h-4 w-4 text-orange-600" />
      case "light":
        return <Sun className="h-4 w-4 text-yellow-600" />
      case "ph":
        return <Activity className="h-4 w-4 text-purple-600" />
      case "conductivity":
        return <Zap className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (value: number, min: number, max: number) => {
    if (value < min || value > max) return "text-red-600"
    if (value < min + (max - min) * 0.2 || value > max - (max - min) * 0.2) return "text-yellow-600"
    return "text-green-600"
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(timestamp))
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {/* Soil Moisture */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getSensorIcon("moisture")}
            Soil Moisture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{reading.soilMoisture}%</span>
              <Badge
                variant={
                  reading.soilMoisture < 40 ? "destructive" : reading.soilMoisture > 80 ? "secondary" : "default"
                }
              >
                {reading.soilMoisture < 40 ? "Low" : reading.soilMoisture > 80 ? "High" : "Optimal"}
              </Badge>
            </div>
            <Progress value={reading.soilMoisture} className="h-2" />
            <p className="text-xs text-muted-foreground">Last updated: {formatTimestamp(reading.timestamp)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Soil Temperature */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getSensorIcon("temperature")}
            Soil Temperature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{reading.soilTemperature}°C</span>
              <Badge variant={reading.soilTemperature < 15 || reading.soilTemperature > 30 ? "destructive" : "default"}>
                {reading.soilTemperature < 15 || reading.soilTemperature > 30 ? "Alert" : "Normal"}
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: 15°C</span>
              <span>Max: 30°C</span>
            </div>
            <p className="text-xs text-muted-foreground">Last updated: {formatTimestamp(reading.timestamp)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Ambient Temperature */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getSensorIcon("temperature")}
            Air Temperature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{reading.ambientTemperature}°C</span>
              <Badge variant="outline">{reading.humidity}% RH</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Humidity: {reading.humidity}%</p>
            <p className="text-xs text-muted-foreground">Last updated: {formatTimestamp(reading.timestamp)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Light Intensity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getSensorIcon("light")}
            Light Intensity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{(reading.lightIntensity / 1000).toFixed(1)}k</span>
              <Badge variant="outline">lux</Badge>
            </div>
            <Progress value={Math.min((reading.lightIntensity / 100000) * 100, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">Full value: {reading.lightIntensity.toLocaleString()} lux</p>
          </div>
        </CardContent>
      </Card>

      {/* pH Level */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getSensorIcon("ph")}
            pH Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{reading.phLevel}</span>
              <Badge variant={reading.phLevel < 6 || reading.phLevel > 8 ? "destructive" : "default"}>
                {reading.phLevel < 6 ? "Acidic" : reading.phLevel > 8 ? "Alkaline" : "Neutral"}
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Acidic (0-6)</span>
              <span>Alkaline (8-14)</span>
            </div>
            <p className="text-xs text-muted-foreground">Optimal range: 6.0 - 8.0</p>
          </div>
        </CardContent>
      </Card>

      {/* Electrical Conductivity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getSensorIcon("conductivity")}
            Conductivity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{reading.electricalConductivity}</span>
              <Badge variant="outline">mS/cm</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Nutrient availability indicator</p>
            <p className="text-xs text-muted-foreground">Last updated: {formatTimestamp(reading.timestamp)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
