import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { FlowProvider } from '@/hooks/use-flow'
import { PWARegisterGate } from "@/components/client-boundaries/pwa-register-gate"
import { PermissionsRequestGate } from "@/components/client-boundaries/permissions-request-gate"
import { OnboardingGate } from "@/components/client-boundaries/onboarding-gate"
import { WelcomeScreenGate } from "@/components/client-boundaries/welcome-screen-gate"
import { OfflineGate } from "@/components/client-boundaries/offline-gate"
import Footer from '@/components/layout/footer'
// Initialize server-side Sentry (minimal)
import '@/lib/sentry.server'
import ClientInit from '@/components/sentry/ClientInit'
import "./globals.css"

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "دوائي - تطبيق الصيدليات",
  description: "اربط مع أقرب صيدلية واحصل على أدويتك بسهولة",
  generator: "دوائي",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "دوائي",
  },
  formatDetection: {
    telephone: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${cairo.className} font-sans antialiased cute-bg`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientInit />
          <OfflineGate>
            <FlowProvider>
              <WelcomeScreenGate />
              <PermissionsRequestGate />
              <PWARegisterGate />
              <OnboardingGate>
                {children}
                <Footer />
                <Toaster />
              </OnboardingGate>
            </FlowProvider>
          </OfflineGate>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
