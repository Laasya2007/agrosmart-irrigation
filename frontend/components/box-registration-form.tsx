"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, Wifi, Signal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BoxRegistrationFormProps {
  onSuccess?: (boxId: string) => void
}

export function BoxRegistrationForm({ onSuccess }: BoxRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    location: {
      latitude: "",
      longitude: "",
      address: "",
    },
    serialNumber: "",
    notes: "",
  })
  const { toast } = useToast()

  const handleLocationDetection = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location detection",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          },
        }))
        setIsLoading(false)
        toast({
          title: "Location detected",
          description: "GPS coordinates have been automatically filled",
        })
      },
      (error) => {
        setIsLoading(false)
        toast({
          title: "Location detection failed",
          description: "Please enter coordinates manually",
          variant: "destructive",
        })
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/boxes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          location: {
            latitude: Number.parseFloat(formData.location.latitude),
            longitude: Number.parseFloat(formData.location.longitude),
            address: formData.location.address,
          },
          serialNumber: formData.serialNumber,
          notes: formData.notes,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Box registered successfully",
          description: `${formData.name} has been added to your system`,
        })
        onSuccess?.(result.data.id)
        // Reset form
        setFormData({
          name: "",
          location: { latitude: "", longitude: "", address: "" },
          serialNumber: "",
          notes: "",
        })
        setStep(1)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.serialNumber)) {
      toast({
        title: "Missing information",
        description: "Please fill in box name and serial number",
        variant: "destructive",
      })
      return
    }
    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-green-600" />
          Register New Irrigation Box
        </CardTitle>
        <CardDescription>Add a new AgroSmart irrigation box to your farm management system</CardDescription>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((stepNumber) => (
            <Badge key={stepNumber} variant={step >= stepNumber ? "default" : "outline"} className="px-3 py-1">
              {stepNumber}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Box Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., North Field Box"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  placeholder="e.g., ASB-2024-001"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, serialNumber: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this box..."
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Location Information</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLocationDetection}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <MapPin className="h-4 w-4" />
                  Detect GPS
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="27.3389"
                    value={formData.location.latitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, latitude: e.target.value },
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="88.6065"
                    value={formData.location.longitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, longitude: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., Gangtok, Sikkim, India"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: { ...prev.location, address: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Review Registration Details</h3>
                <p className="text-muted-foreground">Please verify the information before registering the box</p>
              </div>

              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Box Name:</span>
                  <span>{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Serial Number:</span>
                  <span className="font-mono text-sm">{formData.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Location:</span>
                  <span className="text-right">
                    {formData.location.latitude}, {formData.location.longitude}
                    {formData.location.address && (
                      <div className="text-sm text-muted-foreground">{formData.location.address}</div>
                    )}
                  </span>
                </div>
                {formData.notes && (
                  <div className="flex justify-between">
                    <span className="font-medium">Notes:</span>
                    <span className="text-right max-w-xs">{formData.notes}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Signal className="h-4 w-4" />
                  Next Steps
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Power on your irrigation box</li>
                  <li>• Wait for the box to connect to your network</li>
                  <li>• The box will appear online within 2-3 minutes</li>
                  <li>• You can then configure irrigation schedules</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
            {step < 3 ? (
              <Button type="button" onClick={nextStep} className="ml-auto">
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="ml-auto">
                {isLoading ? "Registering..." : "Register Box"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
