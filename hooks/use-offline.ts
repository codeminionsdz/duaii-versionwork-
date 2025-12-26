'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect offline/online status
 * Returns true when offline, false when online
 *
 * Usage:
 *   const isOffline = useOffline()
 *   if (isOffline) return <OfflineScreen />
 */
export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Set initial state
    setIsOffline(!navigator.onLine)

    // Handle online event
    const handleOnline = () => {
      console.log('🌐 Back online')
      setIsOffline(false)
    }

    // Handle offline event
    const handleOffline = () => {
      console.log('📴 Gone offline')
      setIsOffline(true)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  return isMounted ? isOffline : false
}
