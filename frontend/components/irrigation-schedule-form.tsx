"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, Clock, Droplets, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { IrrigationSchedule, CropProfile, IrrigationBox } from "@/lib/types"

interface IrrigationScheduleFormProps {
  schedule?: IrrigationSchedule
  boxes: IrrigationBox[]
  cropProfiles: CropProfile[]
  onSave?: (schedule: IrrigationSchedule) => void
  onCancel?: () => void
}

interface TimeSlot {
  startTime: string
  duration: number
  days: number[]
}

export function IrrigationScheduleForm({
  schedule,
  boxes,
  cropProfiles,
  onSave,
  onCancel,
}: IrrigationScheduleFormProps) {
  const [formData, setFormData] = useState({
    boxId: schedule?.boxId || "",
    cropProfileId: schedule?.cropProfileId || "",
    isActive: schedule?.isActive ?? true,
    scheduleType: schedule?.scheduleType || ("hybrid" as "time-based" | "sensor-based" | "hybrid"),
    timeSlots: schedule?.timeSlots || [
      { startTime: "06:00", duration: 15, days: [1, 2, 3, 4, 5, 6, 0] }, // Daily at 6 AM
    ],
    sensorThresholds: schedule?.sensorThresholds || {
      moistureMin: 40,
      moistureMax: 80,
      temperatureMax: 35,
    },
  })

  const { toast } = useToast()

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: "06:00", duration: 15, days: [1, 2, 3, 4, 5] }],
    }))
  }

  const removeTimeSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }))
  }

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    }))
  }

  const toggleDay = (slotIndex: number, dayIndex: number) => {
    const slot = formData.timeSlots[slotIndex]
    const days = slot.days.includes(dayIndex) ? slot.days.filter((d) => d !== dayIndex) : [...slot.days, dayIndex]
    updateTimeSlot(slotIndex, "days", days)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.boxId || !formData.cropProfileId) {
      toast({
        title: "Missing information",
        description: "Please select both irrigation box and crop profile",
        variant: "destructive",
      })
      return
    }

    if (formData.scheduleType !== "sensor-based" && formData.timeSlots.length === 0) {
      toast({
        title: "Missing time slots",
        description: "Please add at least one time slot for scheduled irrigation",
        variant: "destructive",
      })
      return
    }

    const newSchedule: IrrigationSchedule = {
      id: schedule?.id || `schedule-${Date.now()}`,
      boxId: formData.boxId,
      cropProfileId: formData.cropProfileId,
      isActive: formData.isActive,
      scheduleType: formData.scheduleType,
      timeSlots: formData.timeSlots,
      sensorThresholds: formData.sensorThresholds,
      createdAt: schedule?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    onSave?.(newSchedule)
    toast({
      title: "Schedule saved",
      description: `Irrigation schedule has been ${schedule ? "updated" : "created"}`,
    })
  }

  const selectedBox = boxes.find((box) => box.id === formData.boxId)
  const selectedCrop = cropProfiles.find((crop) => crop.id === formData.cropProfileId)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          {schedule ? "Edit Irrigation Schedule" : "Create Irrigation Schedule"}
        </CardTitle>
        <CardDescription>Configure automated irrigation based on time schedules and sensor readings</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="boxId">Irrigation Box *</Label>
              <Select
                value={formData.boxId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, boxId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select irrigation box" />
                </SelectTrigger>
                <SelectContent>
                  {boxes.map((box) => (
                    <SelectItem key={box.id} value={box.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            box.status === "online"
                              ? "bg-green-500"
                              : box.status === "offline"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        />
                        {box.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cropProfileId">Crop Profile *</Label>
              <Select
                value={formData.cropProfileId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, cropProfileId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop profile" />
                </SelectTrigger>
                <SelectContent>
                  {cropProfiles.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.name} - {crop.variety}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Schedule Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: "time-based", label: "Time-Based", desc: "Fixed schedule based on time" },
                { value: "sensor-based", label: "Sensor-Based", desc: "Triggered by soil conditions" },
                { value: "hybrid", label: "Hybrid", desc: "Combines both approaches" },
              ].map((type) => (
                <Card
                  key={type.value}
                  className={`cursor-pointer transition-all ${
                    formData.scheduleType === type.value ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, scheduleType: type.value as any }))}
                >
                  <CardContent className="p-4 text-center">
                    <h4 className="font-medium">{type.label}</h4>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="schedule" className="space-y-4">
            <TabsList>
              <TabsTrigger value="schedule">Time Schedule</TabsTrigger>
              <TabsTrigger value="sensors">Sensor Thresholds</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4">
              {formData.scheduleType !== "sensor-based" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Time Slots
                    </h3>
                    <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Time Slot
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.timeSlots.map((slot, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Time Slot {index + 1}</h4>
                              {formData.timeSlots.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTimeSlot(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Duration (minutes)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="120"
                                  value={slot.duration}
                                  onChange={(e) => updateTimeSlot(index, "duration", Number(e.target.value))}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Days of Week</Label>
                              <div className="flex gap-2">
                                {dayNames.map((day, dayIndex) => (
                                  <Button
                                    key={dayIndex}
                                    type="button"
                                    variant={slot.days.includes(dayIndex) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleDay(index, dayIndex)}
                                    className="w-12"
                                  >
                                    {day}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sensors" className="space-y-4">
              {formData.scheduleType !== "time-based" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Sensor Thresholds
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moistureMin">Minimum Moisture (%)</Label>
                      <Input
                        id="moistureMin"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.sensorThresholds.moistureMin}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sensorThresholds: { ...prev.sensorThresholds, moistureMin: Number(e.target.value) },
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Irrigation starts when moisture drops below this level
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="moistureMax">Maximum Moisture (%)</Label>
                      <Input
                        id="moistureMax"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.sensorThresholds.moistureMax}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sensorThresholds: { ...prev.sensorThresholds, moistureMax: Number(e.target.value) },
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">Irrigation stops when moisture reaches this level</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="temperatureMax">Max Temperature (°C)</Label>
                      <Input
                        id="temperatureMax"
                        type="number"
                        value={formData.sensorThresholds.temperatureMax}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sensorThresholds: { ...prev.sensorThresholds, temperatureMax: Number(e.target.value) },
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">Skip irrigation if temperature exceeds this value</p>
                    </div>
                  </div>

                  {selectedCrop && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Crop Profile Recommendations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Optimal Moisture:</span> {selectedCrop.optimalMoisture.min}% -{" "}
                          {selectedCrop.optimalMoisture.max}%
                        </div>
                        <div>
                          <span className="font-medium">Optimal Temperature:</span>{" "}
                          {selectedCrop.optimalTemperature.min}°C - {selectedCrop.optimalTemperature.max}°C
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label htmlFor="isActive" className="text-base font-medium">
                Schedule Active
              </Label>
              <p className="text-sm text-muted-foreground">Enable or disable this irrigation schedule</p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{schedule ? "Update Schedule" : "Create Schedule"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
