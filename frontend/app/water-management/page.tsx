import { IntegratedWaterDashboard } from "@/components/integrated-water-dashboard"

export default function WaterManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-800">Water Management System</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive water management with tank monitoring, slope analysis, and smart irrigation planning
        </p>
      </div>

      <IntegratedWaterDashboard />
    </div>
  )
}
