import { type NextRequest, NextResponse } from "next/server"
import { mockAlerts } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const severity = searchParams.get("severity")

    let alerts = [...mockAlerts]

    if (unreadOnly) {
      alerts = alerts.filter((alert) => !alert.isRead)
    }

    if (severity) {
      alerts = alerts.filter((alert) => alert.severity === severity)
    }

    // Sort by creation date descending
    alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json({
      success: true,
      data: alerts,
      total: alerts.length,
      unreadCount: mockAlerts.filter((alert) => !alert.isRead).length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, isRead } = body

    const alert = mockAlerts.find((a) => a.id === alertId)
    if (!alert) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 })
    }

    alert.isRead = isRead
    if (isRead && !alert.resolvedAt) {
      alert.resolvedAt = new Date()
    }

    return NextResponse.json({
      success: true,
      data: alert,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 })
  }
}
