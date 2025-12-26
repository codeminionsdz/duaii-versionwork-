"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from 'next/navigation'

export function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    const isAuthenticated = localStorage.getItem("admin_authenticated")
    const adminSession = localStorage.getItem("admin_session")
    const loginTime = localStorage.getItem("admin_login_time")

    // If not authenticated and not on login page, redirect to login
    if ((!isAuthenticated || adminSession !== "active") && pathname !== '/admin/login') {
      router.push("/admin/login")
      return
    }

    // If authenticated and on login page, redirect to admin dashboard
    if (isAuthenticated && adminSession === "active" && pathname === '/admin/login') {
      router.push("/admin")
      return
    }

    // Check if session expired (24 hours)
    if (loginTime && isAuthenticated) {
      const elapsed = Date.now() - Number.parseInt(loginTime)
      const hours = elapsed / (1000 * 60 * 60)

      if (hours > 24) {
        localStorage.removeItem("admin_authenticated")
        localStorage.removeItem("admin_session")
        localStorage.removeItem("admin_login_time")
        if (pathname !== '/admin/login') {
          router.push("/admin/login")
        }
        return
      }
    }
  }, [router, pathname, isClient])

  return <>{children}</>
}
