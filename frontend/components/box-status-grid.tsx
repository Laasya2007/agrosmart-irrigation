"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Wifi, Battery, Signal, Settings, AlertTriangle } from "lucide-react"
import type { IrrigationBox } from "@/lib/types"
import Link from "next/link"

interface BoxStatusGridProps {
  boxes: IrrigationBox[]
  onBoxSelect?: (boxId: string) => void
}

export function BoxStatusGrid({ boxes, onBoxSelect }: BoxStatusGridProps) {
  const getStatusColor = (status: IrrigationBox["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "offline":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-600"
    if (level > 20) return "text-yellow-600"
    return "text-red-600"
  }

  const getSignalStrength = (strength: number) => {
    if (strength > 75) return { bars: 4, color: "text-green-600" }
    if (strength > 50) return { bars: 3, color: "text-yellow-600" }
    if (strength > 25) return { bars: 2, color: "text-orange-600" }
    return { bars: 1, color: "text-red-600" }
  }

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(lastSeen).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {boxes.map((box) => {
        const signal = getSignalStrength(box.signalStrength)
        const hasAlerts = box.status === "offline" || box.batteryLevel < 30

        return (
          <Card
            key={box.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              hasAlerts ? "border-red-200 dark:border-red-800" : ""
            }`}
            onClick={() => onBoxSelect?.(box.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{box.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {box.location.address || `${box.location.latitude}, ${box.location.longitude}`}
                  </div>
                </div>
                {hasAlerts && <AlertTriangle className="h-5 w-5 text-red-500" />}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(box.status)} variant="secondary">
                  <Wifi className="h-3 w-3 mr-1" />
                  {box.status.charAt(0).toUpperCase() + box.status.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatLastSeen(box.lastSeen)}</span>
              </div>

              {/* System Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Battery className={`h-4 w-4 ${getBatteryColor(box.batteryLevel)}`} />
                  <span>{box.batteryLevel}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Signal className={`h-4 w-4 ${signal.color}`} />
                  <span>{box.signalStrength}%</span>
                </div>
              </div>

              {/* Firmware Version */}
              <div className="text-xs text-muted-foreground">Firmware: v{box.firmwareVersion}</div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                  <Link href={`/dashboard/box/${box.id}`}>View Details</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/box/${box.id}/settings`}>
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Add New Box Card */}
      <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Wifi className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Add New Box</h3>
          <p className="text-sm text-muted-foreground mb-4">Register a new irrigation box to expand your system</p>
          <Button asChild>
            <Link href="/register">Add Box</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
