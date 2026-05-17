"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Wifi,
  Battery,
  Signal,
  HardDrive,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react"
import type { IrrigationBox } from "@/lib/types"
import { mockBoxes } from "@/lib/mock-data"

interface SystemHealthDashboardProps {
  className?: string
}

interface SystemHealth {
  overall: "excellent" | "good" | "warning" | "critical"
  uptime: number // percentage
  connectivity: number // percentage
  batteryHealth: number // percentage
  storageUsed: number // percentage
  avgResponseTime: number // milliseconds
  lastUpdate: Date
}

interface BoxHealth extends IrrigationBox {
  health: {
    connectivity: "excellent" | "good" | "poor" | "offline"
    battery: "excellent" | "good" | "low" | "critical"
    sensors: "operational" | "degraded" | "failed"
    storage: number // percentage used
    temperature: number // device temperature
    uptime: number // hours
    responseTime: number // milliseconds
    errorCount: number
    lastMaintenance: Date
  }
}

export function SystemHealthDashboard({ className }: SystemHealthDashboardProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: "good",
    uptime: 98.5,
    connectivity: 94.2,
    batteryHealth: 87.3,
    storageUsed: 23.4,
    avgResponseTime: 145,
    lastUpdate: new Date(),
  })

  const [boxesHealth, setBoxesHealth] = useState<BoxHealth[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Generate mock health data for boxes
    const healthData: BoxHealth[] = mockBoxes.map((box) => ({
      ...box,
      health: {
        connectivity: box.status === "online" ? "excellent" : box.status === "offline" ? "offline" : "poor",
        battery:
          box.batteryLevel > 70
            ? "excellent"
            : box.batteryLevel > 40
              ? "good"
              : box.batteryLevel > 20
                ? "low"
                : "critical",
        sensors: Math.random() > 0.1 ? "operational" : "degraded",
        storage: Math.floor(Math.random() * 40) + 10, // 10-50%
        temperature: Math.floor(Math.random() * 20) + 25, // 25-45°C
        uptime: Math.floor(Math.random() * 720) + 24, // 24-744 hours
        responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        errorCount: Math.floor(Math.random() * 5),
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      },
    }))
    setBoxesHealth(healthData)
  }, [])

  const getHealthColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-100 dark:bg-green-900"
      case "good":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900"
      case "warning":
      case "poor":
      case "low":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900"
      case "critical":
      case "failed":
      case "offline":
        return "text-red-600 bg-red-100 dark:bg-red-900"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900"
    }
  }

  const getOverallHealthIcon = (status: string) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSystemHealth((prev) => ({ ...prev, lastUpdate: new Date() }))
    setIsRefreshing(false)
  }

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  }

  const criticalIssues = boxesHealth.filter(
    (box) =>
      box.health.connectivity === "offline" || box.health.battery === "critical" || box.health.sensors === "failed",
  ).length

  const warningIssues = boxesHealth.filter(
    (box) => box.health.connectivity === "poor" || box.health.battery === "low" || box.health.sensors === "degraded",
  ).length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {getOverallHealthIcon(systemHealth.overall)}
            System Health Monitor
          </h2>
          <p className="text-muted-foreground">Monitor the health and performance of your irrigation system</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {systemHealth.lastUpdate.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold">{systemHealth.uptime}%</p>
                <Progress value={systemHealth.uptime} className="h-2 mt-2" />
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connectivity</p>
                <p className="text-2xl font-bold">{systemHealth.connectivity}%</p>
                <Progress value={systemHealth.connectivity} className="h-2 mt-2" />
              </div>
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Battery Health</p>
                <p className="text-2xl font-bold">{systemHealth.batteryHealth}%</p>
                <Progress value={systemHealth.batteryHealth} className="h-2 mt-2" />
              </div>
              <Battery className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{systemHealth.avgResponseTime}ms</p>
                <p className="text-xs text-muted-foreground mt-1">Average across all boxes</p>
              </div>
              <Signal className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Summary */}
      {(criticalIssues > 0 || warningIssues > 0) && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              System Issues Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticalIssues > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {criticalIssues} Critical Issue{criticalIssues > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">Requires immediate attention</p>
                  </div>
                </div>
              )}
              {warningIssues > 0 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      {warningIssues} Warning{warningIssues > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Monitor closely</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Health Monitoring */}
      <Tabs defaultValue="boxes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="boxes">Box Health ({boxesHealth.length})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="boxes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {boxesHealth.map((box) => (
              <Card key={box.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{box.name}</CardTitle>
                      <CardDescription>{box.location.address}</CardDescription>
                    </div>
                    <Badge className={getHealthColor(box.health.connectivity)} variant="secondary">
                      {box.health.connectivity}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Health Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Battery className="h-3 w-3" />
                          Battery
                        </span>
                        <span className={getHealthColor(box.health.battery).split(" ")[0]}>{box.batteryLevel}%</span>
                      </div>
                      <Progress value={box.batteryLevel} className="h-1" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          Storage
                        </span>
                        <span>{box.health.storage}%</span>
                      </div>
                      <Progress value={box.health.storage} className="h-1" />
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4 text-muted-foreground" />
                      <span>Signal: {box.signalStrength}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span>Temp: {box.health.temperature}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Uptime: {formatUptime(box.health.uptime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <span>Response: {box.health.responseTime}ms</span>
                    </div>
                  </div>

                  {/* Sensors Status */}
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Sensors</span>
                    <Badge className={getHealthColor(box.health.sensors)} variant="secondary">
                      {box.health.sensors}
                    </Badge>
                  </div>

                  {/* Error Count */}
                  {box.health.errorCount > 0 && (
                    <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded">
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">Recent Errors</span>
                      <Badge variant="destructive">{box.health.errorCount}</Badge>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Upcoming and overdue maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {boxesHealth.map((box) => {
                  const daysSinceLastMaintenance = Math.floor(
                    (Date.now() - box.health.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24),
                  )
                  const isOverdue = daysSinceLastMaintenance > 30

                  return (
                    <div key={box.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{box.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Last maintenance: {daysSinceLastMaintenance} days ago
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isOverdue ? "destructive" : "outline"}>
                          {isOverdue ? "Overdue" : "On Schedule"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Schedule
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network Usage</span>
                    <span>12%</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Log Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded">
                    <span className="text-sm">Connection timeouts</span>
                    <Badge variant="destructive">3</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                    <span className="text-sm">Sensor calibration warnings</span>
                    <Badge className="bg-yellow-100 text-yellow-800">2</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    <span className="text-sm">Firmware update available</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
