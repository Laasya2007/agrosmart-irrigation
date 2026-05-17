"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Leaf, BarChart3, Shield, Smartphone, Zap } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {t("smartIrrigation")}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">AgroSmart</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Smart drops for smart crops - where technology nurtures every field
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard">{t("viewDashboard")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">{t("registerBox")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t("keyFeatures")}</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t("featuresDescription")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <Droplets className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>{t("realTimeMonitoring")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t("monitoringDescription")}</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <Leaf className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>{t("cropManagement")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t("cropDescription")}</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>{t("analytics")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t("analyticsDescription")}</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>{t("alerts")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t("alertsDescription")}</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>{t("mobileReady")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t("mobileDescription")}</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>{t("automation")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t("automationDescription")}</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 dark:bg-green-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t("getStarted")}</h2>
          <Button asChild size="lg" variant="secondary" className="mt-4">
            <Link href="/register">{t("startNow")}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
