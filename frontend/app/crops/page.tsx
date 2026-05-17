"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CropProfileForm } from "@/components/crop-profile-form"
import { IrrigationScheduleForm } from "@/components/irrigation-schedule-form"
import { Plus, Leaf, Calendar, Droplets, Thermometer, Edit, Trash2, Copy } from "lucide-react"
import type { CropProfile, IrrigationSchedule, IrrigationBox } from "@/lib/types"
import { mockCropProfiles, mockBoxes } from "@/lib/mock-data"

export default function CropsPage() {
  const [cropProfiles, setCropProfiles] = useState<CropProfile[]>([])
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([])
  const [boxes, setBoxes] = useState<IrrigationBox[]>([])
  const [showCropForm, setShowCropForm] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingCrop, setEditingCrop] = useState<CropProfile | undefined>()
  const [editingSchedule, setEditingSchedule] = useState<IrrigationSchedule | undefined>()

  useEffect(() => {
    // Load data from localStorage or API
    setCropProfiles(mockCropProfiles)
    setBoxes(mockBoxes)
    // Load schedules from localStorage if available
    const savedSchedules = localStorage.getItem("irrigation_schedules")
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules))
    }
  }, [])

  const handleSaveCrop = (profile: CropProfile) => {
    if (editingCrop) {
      setCropProfiles((prev) => prev.map((p) => (p.id === profile.id ? profile : p)))
    } else {
      setCropProfiles((prev) => [...prev, profile])
    }
    setShowCropForm(false)
    setEditingCrop(undefined)
  }

  const handleSaveSchedule = (schedule: IrrigationSchedule) => {
    let updatedSchedules: IrrigationSchedule[]
    if (editingSchedule) {
      updatedSchedules = schedules.map((s) => (s.id === schedule.id ? schedule : s))
    } else {
      updatedSchedules = [...schedules, schedule]
    }
    setSchedules(updatedSchedules)
    localStorage.setItem("irrigation_schedules", JSON.stringify(updatedSchedules))
    setShowScheduleForm(false)
    setEditingSchedule(undefined)
  }

  const handleDeleteCrop = (cropId: string) => {
    setCropProfiles((prev) => prev.filter((p) => p.id !== cropId))
    // Also remove associated schedules
    const updatedSchedules = schedules.filter((s) => s.cropProfileId !== cropId)
    setSchedules(updatedSchedules)
    localStorage.setItem("irrigation_schedules", JSON.stringify(updatedSchedules))
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    const updatedSchedules = schedules.filter((s) => s.id !== scheduleId)
    setSchedules(updatedSchedules)
    localStorage.setItem("irrigation_schedules", JSON.stringify(updatedSchedules))
  }

  const handleDuplicateCrop = (crop: CropProfile) => {
    const duplicatedCrop: CropProfile = {
      ...crop,
      id: `crop-${Date.now()}`,
      name: `${crop.name} (Copy)`,
    }
    setCropProfiles((prev) => [...prev, duplicatedCrop])
  }

  const formatGrowthStages = (stages: CropProfile["growthStages"]) => {
    return stages.map((stage) => `${stage.stage} (${stage.duration}d)`).join(" → ")
  }

  const getScheduleStatus = (schedule: IrrigationSchedule) => {
    if (!schedule.isActive) return { label: "Inactive", color: "bg-gray-500" }
    const box = boxes.find((b) => b.id === schedule.boxId)
    if (!box || box.status !== "online") return { label: "Offline", color: "bg-red-500" }
    return { label: "Active", color: "bg-green-500" }
  }

  if (showCropForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4">
        <div className="container mx-auto py-8">
          <CropProfileForm
            profile={editingCrop}
            onSave={handleSaveCrop}
            onCancel={() => {
              setShowCropForm(false)
              setEditingCrop(undefined)
            }}
          />
        </div>
      </div>
    )
  }

  if (showScheduleForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4">
        <div className="container mx-auto py-8">
          <IrrigationScheduleForm
            schedule={editingSchedule}
            boxes={boxes}
            cropProfiles={cropProfiles}
            onSave={handleSaveSchedule}
            onCancel={() => {
              setShowScheduleForm(false)
              setEditingSchedule(undefined)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Crop Management</h1>
            <p className="text-muted-foreground">Manage crop profiles and irrigation schedules</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCropForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Crop Profile
            </Button>
            <Button variant="outline" onClick={() => setShowScheduleForm(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profiles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profiles">Crop Profiles ({cropProfiles.length})</TabsTrigger>
            <TabsTrigger value="schedules">Irrigation Schedules ({schedules.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-4">
            {cropProfiles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Crop Profiles</h3>
                  <p className="text-muted-foreground mb-4">Create your first crop profile to get started</p>
                  <Button onClick={() => setShowCropForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Crop Profile
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cropProfiles.map((crop) => (
                  <Card key={crop.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{crop.name}</CardTitle>
                          <CardDescription>{crop.variety}</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {crop.growthStages.length} stages
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-600" />
                          <span>
                            {crop.optimalMoisture.min}-{crop.optimalMoisture.max}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-600" />
                          <span>
                            {crop.optimalTemperature.min}-{crop.optimalTemperature.max}°C
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <strong>Growth Stages:</strong>
                        <div className="mt-1">{formatGrowthStages(crop.growthStages)}</div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <strong>EEPROM:</strong> <code className="bg-muted px-1 rounded">{crop.eepromData}</code>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCrop(crop)
                            setShowCropForm(true)
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDuplicateCrop(crop)}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCrop(crop.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            {schedules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Irrigation Schedules</h3>
                  <p className="text-muted-foreground mb-4">Create your first irrigation schedule</p>
                  <Button onClick={() => setShowScheduleForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => {
                  const box = boxes.find((b) => b.id === schedule.boxId)
                  const crop = cropProfiles.find((c) => c.id === schedule.cropProfileId)
                  const status = getScheduleStatus(schedule)

                  return (
                    <Card key={schedule.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${status.color}`} />
                              {box?.name || "Unknown Box"} → {crop?.name || "Unknown Crop"}
                            </CardTitle>
                            <CardDescription>
                              {crop?.variety} • {schedule.scheduleType} schedule
                            </CardDescription>
                          </div>
                          <Badge variant={schedule.isActive ? "default" : "secondary"}>{status.label}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {schedule.timeSlots.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Time Slots:</h4>
                            <div className="space-y-1">
                              {schedule.timeSlots.map((slot, index) => (
                                <div key={index} className="text-sm text-muted-foreground">
                                  {slot.startTime} for {slot.duration}min •{" "}
                                  {slot.days.map((d) => dayNames[d]).join(", ")}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Moisture Range:</span> {schedule.sensorThresholds.moistureMin}
                            % - {schedule.sensorThresholds.moistureMax}%
                          </div>
                          <div>
                            <span className="font-medium">Max Temperature:</span>{" "}
                            {schedule.sensorThresholds.temperatureMax}°C
                          </div>
                          <div>
                            <span className="font-medium">Last Updated:</span>{" "}
                            {new Date(schedule.updatedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingSchedule(schedule)
                              setShowScheduleForm(true)
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
