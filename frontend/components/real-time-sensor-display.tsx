"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Droplets, Thermometer, Wifi, WifiOff } from "lucide-react"
import { mqttService } from "@/lib/mqtt-client"

interface RealTimeSensorDisplayProps {
  boxId: string
  className?: string
}

interface LiveSensorData {
  moisture: number
  temperature: number
  timestamp: string
  connected: boolean
}

export function RealTimeSensorDisplay({ boxId, className }: RealTimeSensorDisplayProps) {
  const [sensorData, setSensorData] = useState<LiveSensorData>({
    moisture: 0,
    temperature: 0,
    timestamp: "",
    connected: false,
  })
  const [mqttConnected, setMqttConnected] = useState(false)

  useEffect(() => {
    const handleMoistureData = ({ topic, data }: { topic: string; data: any }) => {
      console.log("[v0] Received moisture data:", data)
      setSensorData((prev) => ({
        ...prev,
        moisture: data.moisture || data.value || 0,
        timestamp: data.timestamp || new Date().toISOString(),
        connected: true,
      }))
    }

    const handleSensorData = ({ topic, data }: { topic: string; data: any }) => {
      console.log("[v0] Received sensor data:", data)
      setSensorData((prev) => ({
        ...prev,
        temperature: data.temperature || prev.temperature,
        moisture: data.moisture || prev.moisture,
        timestamp: data.timestamp || new Date().toISOString(),
        connected: true,
      }))
    }

    // Subscribe to MQTT topics
    mqttService.subscribeMoisture(boxId, handleMoistureData)
    mqttService.subscribeSensorData(boxId, handleSensorData)

    // Check MQTT connection status
    const checkConnection = setInterval(() => {
      setMqttConnected(mqttService.getConnectionStatus())
    }, 1000)

    return () => {
      clearInterval(checkConnection)
      mqttService.unsubscribe(`AgroSmart/moisture/${boxId}`)
      mqttService.unsubscribe(`AgroSmart/sensors/${boxId}/+`)
    }
  }, [boxId])

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "No data"
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(timestamp))
  }

  const getMoistureStatus = (moisture: number) => {
    if (moisture < 30) return { label: "Low", variant: "destructive" as const }
    if (moisture > 80) return { label: "High", variant: "secondary" as const }
    return { label: "Optimal", variant: "default" as const }
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {mqttConnected ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge variant={mqttConnected ? "default" : "destructive"}>
              {mqttConnected ? "Connected" : "Disconnected"}
            </Badge>
            <p className="text-xs text-muted-foreground">MQTT Broker: {mqttConnected ? "Online" : "Offline"}</p>
            <p className="text-xs text-muted-foreground">Sensor: {sensorData.connected ? "Active" : "No Data"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Moisture */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-600" />
            Live Soil Moisture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{sensorData.moisture}%</span>
              <Badge variant={getMoistureStatus(sensorData.moisture).variant}>
                {getMoistureStatus(sensorData.moisture).label}
              </Badge>
            </div>
            <Progress value={sensorData.moisture} className="h-2" />
            <p className="text-xs text-muted-foreground">Last update: {formatTimestamp(sensorData.timestamp)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Temperature */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-600" />
            Live Temperature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{sensorData.temperature}°C</span>
              <Badge variant={sensorData.temperature < 15 || sensorData.temperature > 35 ? "destructive" : "default"}>
                {sensorData.temperature < 15 || sensorData.temperature > 35 ? "Alert" : "Normal"}
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: 15°C</span>
              <span>Max: 35°C</span>
            </div>
            <p className="text-xs text-muted-foreground">Last update: {formatTimestamp(sensorData.timestamp)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Stream Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">MQTT Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-xs">
            <div className="font-mono bg-muted p-1 rounded">AgroSmart/moisture/{boxId}</div>
            <div className="font-mono bg-muted p-1 rounded">AgroSmart/sensors/{boxId}/*</div>
            <p className="text-muted-foreground pt-1">Subscribed to real-time sensor data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
