"use client"

import mqtt, { type MqttClient } from "mqtt"

export class MQTTService {
  private client: MqttClient | null = null
  private subscribers: Map<string, (data: any) => void> = new Map()
  private isConnected = false

  constructor(private brokerUrl = "ws://localhost:8083/mqtt") {
    this.connect()
  }

  private connect() {
    try {
      this.client = mqtt.connect(this.brokerUrl, {
        clientId: `agrosmart_${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      })

      this.client.on("connect", () => {
        console.log("[v0] MQTT connected to broker")
        this.isConnected = true
      })

      this.client.on("error", (error) => {
        console.error("[v0] MQTT connection error:", error)
        this.isConnected = false
      })

      this.client.on("message", (topic, message) => {
        try {
          const data = JSON.parse(message.toString())
          console.log("[v0] MQTT message received:", { topic, data })

          // Notify subscribers
          this.subscribers.forEach((callback, subscribedTopic) => {
            if (topic.includes(subscribedTopic) || subscribedTopic === topic) {
              callback({ topic, data })
            }
          })
        } catch (error) {
          console.error("[v0] Error parsing MQTT message:", error)
        }
      })

      this.client.on("close", () => {
        console.log("[v0] MQTT connection closed")
        this.isConnected = false
      })
    } catch (error) {
      console.error("[v0] Failed to create MQTT client:", error)
    }
  }

  // Subscribe to moisture data: "AgroSmart/moisture"
  subscribeMoisture(boxId: string, callback: (data: any) => void) {
    const topic = `AgroSmart/moisture/${boxId}`
    return this.subscribe(topic, callback)
  }

  // Subscribe to all sensor data for a box
  subscribeSensorData(boxId: string, callback: (data: any) => void) {
    const topic = `AgroSmart/sensors/${boxId}/+`
    return this.subscribe(topic, callback)
  }

  // Generic subscribe method
  subscribe(topic: string, callback: (data: any) => void) {
    if (!this.client || !this.isConnected) {
      console.warn("[v0] MQTT client not connected, queuing subscription")
      // Queue subscription for when connected
      setTimeout(() => this.subscribe(topic, callback), 1000)
      return
    }

    this.client.subscribe(topic, (error) => {
      if (error) {
        console.error("[v0] MQTT subscription error:", error)
      } else {
        console.log("[v0] MQTT subscribed to:", topic)
        this.subscribers.set(topic, callback)
      }
    })
  }

  // Publish pump control command: "AgroSmart/command"
  publishPumpCommand(boxId: string, command: "ON" | "OFF", duration?: number) {
    const topic = `AgroSmart/command/${boxId}`
    const payload = {
      action: command,
      duration: duration || 0,
      timestamp: new Date().toISOString(),
    }

    return this.publish(topic, payload)
  }

  // Generic publish method
  publish(topic: string, data: any) {
    if (!this.client || !this.isConnected) {
      console.error("[v0] MQTT client not connected, cannot publish")
      return false
    }

    try {
      this.client.publish(topic, JSON.stringify(data), { qos: 1 }, (error) => {
        if (error) {
          console.error("[v0] MQTT publish error:", error)
        } else {
          console.log("[v0] MQTT published to:", topic, data)
        }
      })
      return true
    } catch (error) {
      console.error("[v0] Error publishing MQTT message:", error)
      return false
    }
  }

  unsubscribe(topic: string) {
    if (this.client) {
      this.client.unsubscribe(topic)
      this.subscribers.delete(topic)
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end()
      this.subscribers.clear()
      this.isConnected = false
    }
  }

  getConnectionStatus() {
    return this.isConnected
  }
}

// Singleton instance
export const mqttService = new MQTTService()
