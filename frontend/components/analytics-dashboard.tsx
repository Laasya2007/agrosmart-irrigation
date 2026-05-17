"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Droplets, Zap } from "lucide-react"

interface AnalyticsDashboardProps {
  className?: string
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">("7d")
  const [selectedMetric, setSelectedMetric] = useState<"moisture" | "temperature" | "water_usage">("moisture")

  // Mock data generation for analytics
  const generateMockData = (days: number) => {
    const data = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString().split("T")[0],
        moisture: Math.floor(Math.random() * 40) + 40, // 40-80%
        temperature: Math.floor(Math.random() * 15) + 18, // 18-33°C
        waterUsage: Math.floor(Math.random() * 50) + 20, // 20-70L
        efficiency: Math.floor(Math.random() * 20) + 75, // 75-95%
      })
    }
    return data
  }

  const getDaysFromRange = (range: string) => {
    switch (range) {
      case "24h":
        return 1
      case "7d":
        return 7
      case "30d":
        return 30
      case "90d":
        return 90
      default:
        return 7
    }
  }

  const chartData = generateMockData(getDaysFromRange(timeRange))

  const waterUsageByBox = [
    { name: "North Field", value: 245, color: "#3b82f6" },
    { name: "South Field", value: 189, color: "#10b981" },
    { name: "Greenhouse", value: 156, color: "#f59e0b" },
  ]

  const efficiencyData = [
    { box: "North Field", efficiency: 92, target: 90 },
    { box: "South Field", efficiency: 88, target: 90 },
    { box: "Greenhouse", efficiency: 95, target: 90 },
  ]

  const totalWaterUsed = chartData.reduce((sum, day) => sum + day.waterUsage, 0)
  const avgMoisture = Math.round(chartData.reduce((sum, day) => sum + day.moisture, 0) / chartData.length)
  const avgTemperature = Math.round(chartData.reduce((sum, day) => sum + day.temperature, 0) / chartData.length)
  const avgEfficiency = Math.round(chartData.reduce((sum, day) => sum + day.efficiency, 0) / chartData.length)

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <div className="h-4 w-4" />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor system performance and water usage patterns</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Water Used</p>
                <p className="text-2xl font-bold">{totalWaterUsed}L</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  {getTrendIcon(totalWaterUsed, totalWaterUsed * 1.1)}
                  <span>-8% vs last period</span>
                </div>
              </div>
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Moisture</p>
                <p className="text-2xl font-bold">{avgMoisture}%</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  {getTrendIcon(avgMoisture, avgMoisture - 2)}
                  <span>+3% vs last period</span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">💧</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold">{avgTemperature}°C</p>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  {getTrendIcon(avgTemperature, avgTemperature - 1)}
                  <span>+2°C vs last period</span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">🌡️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Efficiency</p>
                <p className="text-2xl font-bold">{avgEfficiency}%</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  {getTrendIcon(avgEfficiency, avgEfficiency - 3)}
                  <span>+5% vs last period</span>
                </div>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="usage">Water Usage</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Environmental Trends</CardTitle>
                  <CardDescription>Soil moisture and temperature over time</CardDescription>
                </div>
                <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moisture">Soil Moisture</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="water_usage">Water Usage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {selectedMetric === "moisture" && (
                      <Line
                        type="monotone"
                        dataKey="moisture"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6" }}
                      />
                    )}
                    {selectedMetric === "temperature" && (
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: "#f59e0b" }}
                      />
                    )}
                    {selectedMetric === "water_usage" && (
                      <Line
                        type="monotone"
                        dataKey="waterUsage"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981" }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Water Usage by Box</CardTitle>
                <CardDescription>Distribution of water consumption across irrigation boxes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={waterUsageByBox}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}L`}
                      >
                        {waterUsageByBox.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Water Usage</CardTitle>
                <CardDescription>Water consumption over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="waterUsage" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Efficiency</CardTitle>
              <CardDescription>Irrigation efficiency by box compared to targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="box" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="efficiency" fill="#3b82f6" name="Current Efficiency" />
                    <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {efficiencyData.map((box, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{box.box}</h4>
                    <Badge variant={box.efficiency >= box.target ? "default" : "secondary"}>
                      {box.efficiency >= box.target ? "On Target" : "Below Target"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Efficiency</span>
                      <span className="font-medium">{box.efficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          box.efficiency >= box.target ? "bg-green-600" : "bg-yellow-600"
                        }`}
                        style={{ width: `${box.efficiency}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {box.target}%</span>
                      <span>
                        {box.efficiency >= box.target ? "+" : ""}
                        {box.efficiency - box.target}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
