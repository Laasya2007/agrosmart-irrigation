"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GrowthStageTracker } from "@/components/growth-stage-tracker"
import { Sprout } from "lucide-react"
import sikkimData from "@/lib/database/sikkim-data.json"

export default function GrowthTrackerPage() {
  const [selectedCrop, setSelectedCrop] = useState("")
  const [plantingDate, setPlantingDate] = useState("")
  const [boxId, setBoxId] = useState("box-001")

  const cropOptions = Object.keys(sikkimData.crops).map((cropId) => ({
    id: cropId,
    name: sikkimData.crops[cropId as keyof typeof sikkimData.crops].name || cropId,
  }))

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Sprout className="h-6 w-6 text-green-600" />
        <h1 className="text-3xl font-bold">Growth Stage Tracker</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Track Your Crop Growth</CardTitle>
          <CardDescription>
            Monitor growth stages and get irrigation recommendations based on your crop's current development phase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crop-select">Select Crop</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a crop" />
                </SelectTrigger>
                <SelectContent>
                  {cropOptions.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planting-date">Planting Date</Label>
              <Input
                id="planting-date"
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="box-select">Irrigation Box</Label>
              <Select value={boxId} onValueChange={setBoxId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="box-001">Box 001 - North Field</SelectItem>
                  <SelectItem value="box-002">Box 002 - South Field</SelectItem>
                  <SelectItem value="box-003">Box 003 - East Field</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCrop && plantingDate && (
        <GrowthStageTracker cropId={selectedCrop} plantingDate={plantingDate} boxId={boxId} />
      )}
    </div>
  )
}
