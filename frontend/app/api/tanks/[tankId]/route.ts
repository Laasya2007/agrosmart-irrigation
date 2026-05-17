import { NextResponse } from "next/server"
import { mockWaterTanks } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: { tankId: string } }) {
  try {
    const tank = mockWaterTanks.find((t) => t.id === params.tankId)

    if (!tank) {
      return NextResponse.json({ error: "Water tank not found" }, { status: 404 })
    }

    return NextResponse.json(tank)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch water tank" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { tankId: string } }) {
  try {
    const updates = await request.json()
    const tankIndex = mockWaterTanks.findIndex((t) => t.id === params.tankId)

    if (tankIndex === -1) {
      return NextResponse.json({ error: "Water tank not found" }, { status: 404 })
    }

    mockWaterTanks[tankIndex] = {
      ...mockWaterTanks[tankIndex],
      ...updates,
      lastUpdated: new Date(),
    }

    return NextResponse.json(mockWaterTanks[tankIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update water tank" }, { status: 500 })
  }
}
