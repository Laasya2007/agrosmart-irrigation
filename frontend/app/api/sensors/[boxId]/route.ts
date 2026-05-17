import { type NextRequest, NextResponse } from "next/server"
import { mockSensorReadings } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { boxId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let readings = mockSensorReadings.filter((reading) => reading.boxId === params.boxId)

    // Filter by date range if provided
    if (from) {
      const fromDate = new Date(from)
      readings = readings.filter((reading) => reading.timestamp >= fromDate)
    }

    if (to) {
      const toDate = new Date(to)
      readings = readings.filter((reading) => reading.timestamp <= toDate)
    }

    // Sort by timestamp descending and limit
    readings = readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)

    return NextResponse.json({
      success: true,
      data: readings,
      total: readings.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch sensor data" }, { status: 500 })
  }
}
