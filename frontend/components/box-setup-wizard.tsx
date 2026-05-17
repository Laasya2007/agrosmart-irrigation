"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Wifi, Settings, Download, MapPin } from "lucide-react"

interface SetupStep {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "failed"
  icon: React.ReactNode
}

interface BoxSetupWizardProps {
  boxId: string
  onComplete?: () => void
}

export function BoxSetupWizard({ boxId, onComplete }: BoxSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: "network",
      title: "Network Connection",
      description: "Connecting to WiFi network",
      status: "in-progress",
      icon: <Wifi className="h-4 w-4" />,
    },
    {
      id: "firmware",
      title: "Firmware Update",
      description: "Checking for latest firmware",
      status: "pending",
      icon: <Download className="h-4 w-4" />,
    },
    {
      id: "sensors",
      title: "Sensor Calibration",
      description: "Calibrating soil and environmental sensors",
      status: "pending",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: "location",
      title: "GPS Verification",
      description: "Verifying location coordinates",
      status: "pending",
      icon: <MapPin className="h-4 w-4" />,
    },
  ])

  const updateStepStatus = (stepId: string, status: SetupStep["status"]) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  const simulateSetup = async () => {
    // Simulate network connection
    await new Promise((resolve) => setTimeout(resolve, 2000))
    updateStepStatus("network", "completed")
    setCurrentStep(1)

    // Simulate firmware update
    updateStepStatus("firmware", "in-progress")
    await new Promise((resolve) => setTimeout(resolve, 3000))
    updateStepStatus("firmware", "completed")
    setCurrentStep(2)

    // Simulate sensor calibration
    updateStepStatus("sensors", "in-progress")
    await new Promise((resolve) => setTimeout(resolve, 2500))
    updateStepStatus("sensors", "completed")
    setCurrentStep(3)

    // Simulate GPS verification
    updateStepStatus("location", "in-progress")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    updateStepStatus("location", "completed")
    setCurrentStep(4)

    // Setup complete
    setTimeout(() => {
      onComplete?.()
    }, 1000)
  }

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const progress = (completedSteps / steps.length) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Box Setup in Progress</CardTitle>
        <CardDescription>Setting up irrigation box {boxId}. This process may take a few minutes.</CardDescription>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {completedSteps}/{steps.length} steps completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              step.status === "in-progress"
                ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                : step.status === "completed"
                  ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                  : step.status === "failed"
                    ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                    : "bg-muted border-border"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {step.status === "completed" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : step.status === "in-progress" ? (
                <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : step.status === "failed" ? (
                <Circle className="h-5 w-5 text-red-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {step.icon}
                <h3 className="font-medium">{step.title}</h3>
                <Badge
                  variant={
                    step.status === "completed"
                      ? "default"
                      : step.status === "in-progress"
                        ? "secondary"
                        : step.status === "failed"
                          ? "destructive"
                          : "outline"
                  }
                  className="ml-auto"
                >
                  {step.status === "in-progress"
                    ? "Running"
                    : step.status === "completed"
                      ? "Done"
                      : step.status === "failed"
                        ? "Failed"
                        : "Waiting"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}

        {completedSteps === 0 && (
          <div className="flex justify-center pt-4">
            <Button onClick={simulateSetup}>Start Setup Process</Button>
          </div>
        )}

        {completedSteps === steps.length && (
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 dark:text-green-200">Setup Complete!</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your irrigation box is now ready to use. You can start configuring irrigation schedules.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
