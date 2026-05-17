"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Leaf, Calendar, Droplets, Thermometer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { CropProfile } from "@/lib/types"

interface CropProfileFormProps {
  profile?: CropProfile
  onSave?: (profile: CropProfile) => void
  onCancel?: () => void
}

interface GrowthStage {
  stage: string
  duration: number
  waterRequirement: number
}

export function CropProfileForm({ profile, onSave, onCancel }: CropProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    variety: profile?.variety || "",
    plantingDate: profile?.plantingDate ? new Date(profile.plantingDate).toISOString().split("T")[0] : "",
    harvestDate: profile?.harvestDate ? new Date(profile.harvestDate).toISOString().split("T")[0] : "",
    optimalMoisture: {
      min: profile?.optimalMoisture.min || 60,
      max: profile?.optimalMoisture.max || 80,
    },
    optimalTemperature: {
      min: profile?.optimalTemperature.min || 18,
      max: profile?.optimalTemperature.max || 26,
    },
    growthStages: profile?.growthStages || [
      { stage: "Seedling", duration: 14, waterRequirement: 0.5 },
      { stage: "Vegetative", duration: 35, waterRequirement: 1.5 },
      { stage: "Flowering", duration: 21, waterRequirement: 2.0 },
      { stage: "Fruiting", duration: 35, waterRequirement: 2.5 },
    ],
    notes: "",
  })

  const { toast } = useToast()

  const cropTypes = [
    "Tomato",
    "Lettuce",
    "Cucumber",
    "Pepper",
    "Eggplant",
    "Spinach",
    "Carrot",
    "Radish",
    "Beans",
    "Peas",
    "Corn",
    "Potato",
    "Onion",
    "Garlic",
    "Cabbage",
    "Broccoli",
    "Cauliflower",
    "Other",
  ]

  const addGrowthStage = () => {
    setFormData((prev) => ({
      ...prev,
      growthStages: [...prev.growthStages, { stage: "", duration: 7, waterRequirement: 1.0 }],
    }))
  }

  const removeGrowthStage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      growthStages: prev.growthStages.filter((_, i) => i !== index),
    }))
  }

  const updateGrowthStage = (index: number, field: keyof GrowthStage, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      growthStages: prev.growthStages.map((stage, i) =>
        i === index ? { ...stage, [field]: field === "stage" ? value : Number(value) } : stage,
      ),
    }))
  }

  const generateEEPROMData = () => {
    // Generate hex string based on crop parameters
    const moistureHex = Math.floor((formData.optimalMoisture.min + formData.optimalMoisture.max) / 2)
      .toString(16)
      .padStart(2, "0")
    const tempHex = Math.floor((formData.optimalTemperature.min + formData.optimalTemperature.max) / 2)
      .toString(16)
      .padStart(2, "0")
    const stagesHex = formData.growthStages.length.toString(16).padStart(2, "0")
    const randomHex = Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")

    return `0x${moistureHex}${tempHex}${stagesHex}${randomHex}`.toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.variety) {
      toast({
        title: "Missing information",
        description: "Please fill in crop name and variety",
        variant: "destructive",
      })
      return
    }

    if (formData.growthStages.length === 0) {
      toast({
        title: "Missing growth stages",
        description: "Please add at least one growth stage",
        variant: "destructive",
      })
      return
    }

    const newProfile: CropProfile = {
      id: profile?.id || `crop-${Date.now()}`,
      name: formData.name,
      variety: formData.variety,
      plantingDate: new Date(formData.plantingDate),
      harvestDate: new Date(formData.harvestDate),
      optimalMoisture: formData.optimalMoisture,
      optimalTemperature: formData.optimalTemperature,
      growthStages: formData.growthStages,
      eepromData: generateEEPROMData(),
    }

    onSave?.(newProfile)
    toast({
      title: "Crop profile saved",
      description: `${formData.name} profile has been ${profile ? "updated" : "created"}`,
    })
  }

  const totalDuration = formData.growthStages.reduce((sum, stage) => sum + stage.duration, 0)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          {profile ? "Edit Crop Profile" : "Create New Crop Profile"}
        </CardTitle>
        <CardDescription>Define optimal growing conditions and irrigation requirements for your crops</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Crop Name *</Label>
              <Select
                value={formData.name}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety">Variety *</Label>
              <Input
                id="variety"
                placeholder="e.g., Cherry Tomato, Butterhead"
                value={formData.variety}
                onChange={(e) => setFormData((prev) => ({ ...prev, variety: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Planting Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plantingDate">Planting Date</Label>
              <Input
                id="plantingDate"
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, plantingDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvestDate">Expected Harvest Date</Label>
              <Input
                id="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, harvestDate: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          {/* Optimal Conditions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Optimal Growing Conditions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Moisture Range */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  Soil Moisture Range (%)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="moistureMin" className="text-sm">
                      Minimum
                    </Label>
                    <Input
                      id="moistureMin"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.optimalMoisture.min}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          optimalMoisture: { ...prev.optimalMoisture, min: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="moistureMax" className="text-sm">
                      Maximum
                    </Label>
                    <Input
                      id="moistureMax"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.optimalMoisture.max}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          optimalMoisture: { ...prev.optimalMoisture, max: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Temperature Range */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-600" />
                  Temperature Range (°C)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="tempMin" className="text-sm">
                      Minimum
                    </Label>
                    <Input
                      id="tempMin"
                      type="number"
                      value={formData.optimalTemperature.min}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          optimalTemperature: { ...prev.optimalTemperature, min: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tempMax" className="text-sm">
                      Maximum
                    </Label>
                    <Input
                      id="tempMax"
                      type="number"
                      value={formData.optimalTemperature.max}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          optimalTemperature: { ...prev.optimalTemperature, max: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Growth Stages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Growth Stages
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Total: {totalDuration} days</Badge>
                <Button type="button" variant="outline" size="sm" onClick={addGrowthStage}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Stage
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {formData.growthStages.map((stage, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Stage name"
                      value={stage.stage}
                      onChange={(e) => updateGrowthStage(index, "stage", e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Duration"
                        value={stage.duration}
                        onChange={(e) => updateGrowthStage(index, "duration", e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Water req."
                        value={stage.waterRequirement}
                        onChange={(e) => updateGrowthStage(index, "waterRequirement", e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">L/day</span>
                    </div>
                  </div>
                  {formData.growthStages.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGrowthStage(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{profile ? "Update Profile" : "Create Profile"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
