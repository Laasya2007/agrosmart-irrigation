"use client"

import { SystemHealthDashboard } from "@/components/system-health-dashboard"

export default function HealthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="container mx-auto p-4 space-y-6">
        <SystemHealthDashboard />
      </div>
    </div>
  )
}
