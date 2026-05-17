"use client"

import { AlertCenter } from "@/components/alert-center"

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="container mx-auto p-4 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">System Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage alerts from your irrigation system to ensure optimal performance
          </p>
        </div>

        <AlertCenter />
      </div>
    </div>
  )
}
