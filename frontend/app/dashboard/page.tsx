"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SensorCard } from "@/components/sensor-card"
import { IrrigationStatus } from "@/components/irrigation-status"
import { BoxStatusGrid } from "@/components/box-status-grid"
import { IntegratedWaterDashboard } from "@/components/integrated-water-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Plus, Bell, TrendingUp, Droplets, Thermometer, Sprout } from "lucide-react"
import type { IrrigationBox, SensorReading, Alert } from "@/lib/types"
import { mockBoxes, mockSensorReadings, mockAlerts } from "@/lib/mock-data"
import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"

export default function DashboardPage() {
  const { t } = useI18n()
  const [boxes, setBoxes] = useState<IrrigationBox[]>([])
  const [selectedBoxId, setSelectedBoxId] = useState<string>("")
  const [sensorData, setSensorData] = useState<SensorReading[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadDashboardData()
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // In a real app, these would be actual API calls
      setBoxes(mockBoxes)
      setSensorData(mockSensorReadings)
      setAlerts(mockAlerts)
      setLastUpdate(new Date())

      if (!selectedBoxId && mockBoxes.length > 0) {
        setSelectedBoxId(mockBoxes[0].id)
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedBox = boxes.find((box) => box.id === selectedBoxId)
  const selectedSensorReading = sensorData.find((reading) => reading.boxId === selectedBoxId)
  const unreadAlerts = alerts.filter((alert) => !alert.isRead)
  const onlineBoxes = boxes.filter((box) => box.status === "online")

  const handleRefresh = () => {
    setIsLoading(true)
    loadDashboardData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("dashboardTitle")}</h1>
            <p className="text-muted-foreground">{t("dashboardSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh")}
            </Button>
            <Button asChild>
              <Link href="/register">
                <Plus className="h-4 w-4 mr-2" />
                {t("addBox")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">{t("activeBoxes")}</p>
                  <p className="text-2xl font-bold">{onlineBoxes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">{t("alerts")}</p>
                  <p className="text-2xl font-bold">{unreadAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">{t("avgTemp")}</p>
                  <p className="text-2xl font-bold">
                    {sensorData.length > 0
                      ? Math.round(
                          sensorData.reduce((acc, reading) => acc + reading.ambientTemperature, 0) / sensorData.length,
                        )
                      : 0}
                    °C
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{t("systemHealthPercent")}</p>
                  <p className="text-2xl font-bold">
                    {Math.round((onlineBoxes.length / Math.max(boxes.length, 1)) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Growth Stage Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your crops' development and optimize irrigation timing
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/growth-tracker">
                  <Sprout className="h-4 w-4 mr-2" />
                  Track Growth
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="water-management" className="space-y-4">
          <TabsList>
            <TabsTrigger value="water-management">Water Management</TabsTrigger>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="monitoring">Real-Time Monitoring</TabsTrigger>
            <TabsTrigger value="boxes">All Boxes</TabsTrigger>
          </TabsList>

          {/* Integrated Water Management */}
          <TabsContent value="water-management">
            <IntegratedWaterDashboard />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            {/* Recent Alerts */}
            {unreadAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-red-600" />
                    {t("recentAlerts")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unreadAlerts.slice(0, 3).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {boxes.find((b) => b.id === alert.boxId)?.name} •{" "}
                            {new Date(alert.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="destructive">{alert.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Box Status Grid */}
            <BoxStatusGrid boxes={boxes} onBoxSelect={setSelectedBoxId} />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            {selectedBox && selectedSensorReading ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Monitoring: {selectedBox.name}</CardTitle>
                    <CardDescription>Real-time sensor data and irrigation control</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      {boxes.map((box) => (
                        <Button
                          key={box.id}
                          variant={selectedBoxId === box.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedBoxId(box.id)}
                        >
                          {box.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <SensorCard reading={selectedSensorReading} title={selectedBox.name} />

                <IrrigationStatus
                  boxId={selectedBox.id}
                  isActive={false}
                  nextScheduled={new Date(Date.now() + 2 * 60 * 60 * 1000)} // 2 hours from now
                />
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No boxes available for monitoring</p>
                  <Button asChild className="mt-4">
                    <Link href="/register">{t("addBox")}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="boxes">
            <BoxStatusGrid boxes={boxes} onBoxSelect={setSelectedBoxId} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          {t("lastUpdated")}: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
