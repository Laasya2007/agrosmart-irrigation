"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Square, Zap } from "lucide-react"
import { mqttService } from "@/lib/mqtt-client"
import { useToast } from "@/hooks/use-toast"

interface MQTTPumpControlProps {
  boxId: string
  className?: string
}

export function MQTTPumpControl({ boxId, className }: MQTTPumpControlProps) {
  const [pumpStatus, setPumpStatus] = useState<"ON" | "OFF">("OFF")
  const [duration, setDuration] = useState(15)
  const [isConnected, setIsConnected] = useState(false)
  const [lastCommand, setLastCommand] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const checkConnection = setInterval(() => {
      setIsConnected(mqttService.getConnectionStatus())
    }, 1000)

    const handlePumpStatus = ({ topic, data }: { topic: string; data: any }) => {
      console.log("[v0] Received pump status:", data)
      if (data.status) {
        setPumpStatus(data.status)
      }
    }

    mqttService.subscribe(`AgroSmart/status/${boxId}`, handlePumpStatus)

    return () => {
      clearInterval(checkConnection)
      mqttService.unsubscribe(`AgroSmart/status/${boxId}`)
    }
  }, [boxId])

  const handlePumpControl = async (command: "ON" | "OFF") => {
    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "MQTT broker is not connected",
        variant: "destructive",
      })
      return
    }

    try {
      const success = mqttService.publishPumpCommand(boxId, command, command === "ON" ? duration : 0)

      if (success) {
        setPumpStatus(command)
        setLastCommand(`${command} ${command === "ON" ? `(${duration}min)` : ""}`)

        toast({
          title: "Command Sent",
          description: `Pump ${command} command sent via MQTT`,
        })

        console.log("[v0] Pump command sent:", { command, duration, boxId })
      } else {
        throw new Error("Failed to publish MQTT command")
      }
    } catch (error) {
      console.error("[v0] Error sending pump command:", error)
      toast({
        title: "Command Failed",
        description: "Failed to send pump control command",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          MQTT Pump Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">MQTT Status:</span>
          <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
        </div>

        {/* Current Pump Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pump Status:</span>
          <Badge variant={pumpStatus === "ON" ? "default" : "secondary"} className="flex items-center gap-1">
            {pumpStatus === "ON" ? <Play className="h-3 w-3" /> : <Square className="h-3 w-3" />}
            {pumpStatus}
          </Badge>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (minutes):</label>
          <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => handlePumpControl("ON")}
            disabled={!isConnected || pumpStatus === "ON"}
            className="flex-1"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Pump
          </Button>
          <Button
            onClick={() => handlePumpControl("OFF")}
            disabled={!isConnected || pumpStatus === "OFF"}
            variant="destructive"
            className="flex-1"
            size="sm"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Pump
          </Button>
        </div>

        {/* MQTT Topic Info */}
        <div className="space-y-2 pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            <div className="font-medium mb-1">MQTT Topics:</div>
            <div className="font-mono bg-muted p-1 rounded mb-1">Publish: AgroSmart/command/{boxId}</div>
            <div className="font-mono bg-muted p-1 rounded">Subscribe: AgroSmart/status/{boxId}</div>
          </div>

          {lastCommand && <div className="text-xs text-muted-foreground">Last command: {lastCommand}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
