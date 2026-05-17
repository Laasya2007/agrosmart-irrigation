import { type NextRequest, NextResponse } from "next/server"
import { mockBoxes } from "@/lib/mock-data"
import type { IrrigationBox } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let filteredBoxes = mockBoxes
    if (status) {
      filteredBoxes = mockBoxes.filter((box) => box.status === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredBoxes,
      total: filteredBoxes.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch boxes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newBox: IrrigationBox = {
      id: `box-${Date.now()}`,
      name: body.name,
      location: body.location,
      status: "offline",
      lastSeen: new Date(),
      firmwareVersion: "2.1.3",
      batteryLevel: 100,
      signalStrength: 0,
      createdAt: new Date(),
    }

    // In a real app, this would save to database
    mockBoxes.push(newBox)

    return NextResponse.json(
      {
        success: true,
        data: newBox,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create box" }, { status: 500 })
  }
}
