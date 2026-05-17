"use client"

import { useState } from "react"
import { BoxRegistrationForm } from "@/components/box-registration-form"
import { BoxSetupWizard } from "@/components/box-setup-wizard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [registeredBoxId, setRegisteredBoxId] = useState<string | null>(null)
  const [showSetup, setShowSetup] = useState(false)

  const handleRegistrationSuccess = (boxId: string) => {
    setRegisteredBoxId(boxId)
    setShowSetup(true)
  }

  const handleSetupComplete = () => {
    // Redirect to dashboard or show success message
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-center mb-2">Add New Irrigation Box</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Register and set up a new AgroSmart irrigation box to expand your automated farming system.
          </p>
        </div>

        {!showSetup ? (
          <BoxRegistrationForm onSuccess={handleRegistrationSuccess} />
        ) : (
          <BoxSetupWizard boxId={registeredBoxId!} onComplete={handleSetupComplete} />
        )}
      </div>
    </div>
  )
}
