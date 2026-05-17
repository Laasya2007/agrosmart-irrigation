import { NextResponse } from "next/server"
import { mockWaterTanks } from "@/lib/mock-data"

export async function GET() {
  try {
    return NextResponse.json(mockWaterTanks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch water tanks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const tankData = await request.json()

    const newTank = {
      id: `tank-${Date.now()}`,
      ...tankData,
      lastUpdated: new Date(),
      status: "active" as const,
    }

    mockWaterTanks.push(newTank)

    return NextResponse.json(newTank, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create water tank" }, { status: 500 })
  }
}
