"use client"

import { RealTimeSensorDisplay } from "@/components/real-time-sensor-display"
import { MQTTPumpControl } from "@/components/mqtt-pump-control"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Wifi } from "lucide-react"

export default function MQTTControlPage() {
  const [selectedBoxId, setSelectedBoxId] = useState("box-001")

  // Mock box data - in real app, fetch from API
  const availableBoxes = [
    { id: "box-001", name: "Field A - North" },
    { id: "box-002", name: "Field B - South" },
    { id: "box-003", name: "Greenhouse 1" },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Wifi className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">MQTT Real-Time Control</h1>
          <p className="text-muted-foreground">Live sensor monitoring and pump control via MQTT</p>
        </div>
      </div>

      {/* Box Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Irrigation Box</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBoxId} onValueChange={setSelectedBoxId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableBoxes.map((box) => (
                <SelectItem key={box.id} value={box.id}>
                  {box.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Real-time Sensor Display */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Live Sensor Data</h2>
        <RealTimeSensorDisplay boxId={selectedBoxId} />
      </div>

      {/* MQTT Pump Control */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pump Control</h2>
        <MQTTPumpControl boxId={selectedBoxId} />
      </div>

      {/* MQTT Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>MQTT Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Broker URL:</strong> <code className="bg-muted px-2 py-1 rounded">ws://localhost:8083/mqtt</code>
            </div>
            <div>
              <strong>Subscribe Topics:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>
                  <code className="bg-muted px-2 py-1 rounded">AgroSmart/moisture/{"{boxId}"}</code> - Real-time
                  moisture data
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">AgroSmart/sensors/{"{boxId}"}/*</code> - All sensor data
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">AgroSmart/status/{"{boxId}"}</code> - Pump status updates
                </li>
              </ul>
            </div>
            <div>
              <strong>Publish Topics:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>
                  <code className="bg-muted px-2 py-1 rounded">AgroSmart/command/{"{boxId}"}</code> - Pump control
                  commands
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
