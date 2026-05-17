"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, BarChart3, Bell, Leaf, Plus, Menu, X, Activity, Sprout } from "lucide-react"
import { useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { LanguageSwitcher } from "./language-switcher"

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useI18n()

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: Home },
    { href: "/analytics", label: t("analytics"), icon: BarChart3 },
    { href: "/alerts", label: t("alerts"), icon: Bell, badge: 3 },
    { href: "/crops", label: t("crops"), icon: Leaf },
    { href: "/growth-tracker", label: "Growth Tracker", icon: Sprout },
    { href: "/health", label: t("systemHealth"), icon: Activity },
    { href: "/register", label: t("addBox"), icon: Plus },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Sidebar */}
      <nav
        className={`fixed left-0 top-0 h-full w-64 bg-background/95 backdrop-blur-sm border-r z-40 transform transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">AgroSmart</h1>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Language Switcher */}
          <div className="mt-6 pt-6 border-t">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">{t("systemHealthPercent")}</h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{t("excellent")}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}
