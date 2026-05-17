"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, CheckCircle, Clock } from "lucide-react"
import type { Alert, IrrigationBox } from "@/lib/types"
import { mockAlerts, mockBoxes } from "@/lib/mock-data"

interface AlertCenterProps {
  className?: string
}

export function AlertCenter({ className }: AlertCenterProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [boxes, setBoxes] = useState<IrrigationBox[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "critical" | "high" | "medium" | "low">("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "severity">("newest")

  useEffect(() => {
    setAlerts(mockAlerts)
    setBoxes(mockBoxes)
  }, [])

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "low_moisture":
        return "💧"
      case "high_temperature":
        return "🌡️"
      case "low_battery":
        return "🔋"
      case "offline":
        return "📡"
      case "system_error":
        return "⚠️"
      default:
        return "🔔"
    }
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const filteredAlerts = alerts
    .filter((alert) => {
      if (filter === "all") return true
      if (filter === "unread") return !alert.isRead
      return alert.severity === filter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "severity":
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return severityOrder[b.severity] - severityOrder[a.severity]
        default:
          return 0
      }
    })

  const markAsRead = async (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)))
  }

  const markAllAsRead = async () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })))
  }

  const resolveAlert = async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, isRead: true, resolvedAt: new Date() } : alert)),
    )
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const unreadCount = alerts.filter((alert) => !alert.isRead).length
  const criticalCount = alerts.filter((alert) => alert.severity === "critical" && !alert.isRead).length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Alert Center</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
        </div>
        <CardDescription>Monitor system alerts and notifications from your irrigation boxes</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active ({alerts.filter((a) => !a.resolvedAt).length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({alerts.filter((a) => a.resolvedAt).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {filteredAlerts.filter((alert) => !alert.resolvedAt).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No active alerts at the moment</p>
              </div>
            ) : (
              filteredAlerts
                .filter((alert) => !alert.resolvedAt)
                .map((alert) => {
                  const box = boxes.find((b) => b.id === alert.boxId)
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border transition-all ${
                        !alert.isRead ? "bg-muted/50 border-l-4 border-l-primary" : "bg-background"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{alert.message}</h4>
                              <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                                {alert.severity}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{box?.name || "Unknown Box"}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(alert.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.isRead && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                              Mark Read
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-3">
            {alerts.filter((alert) => alert.resolvedAt).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No resolved alerts</p>
              </div>
            ) : (
              alerts
                .filter((alert) => alert.resolvedAt)
                .map((alert) => {
                  const box = boxes.find((b) => b.id === alert.boxId)
                  return (
                    <div key={alert.id} className="p-4 rounded-lg border bg-green-50 dark:bg-green-950">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-800 dark:text-green-200">{alert.message}</h4>
                          <div className="flex items-center gap-4 text-sm text-green-700 dark:text-green-300">
                            <span>{box?.name || "Unknown Box"}</span>
                            <span>Resolved {formatTimeAgo(alert.resolvedAt!)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
