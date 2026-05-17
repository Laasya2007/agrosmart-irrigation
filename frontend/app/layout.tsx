import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { I18nProvider } from "@/lib/i18n/context"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "AgroSmart Irrigation System",
  description: "Smart irrigation management for modern farming",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <I18nProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Navigation />
            <main className="lg:ml-64">{children}</main>
          </Suspense>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
