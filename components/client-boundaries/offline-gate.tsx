'use client'

import { useOffline } from '@/hooks/use-offline'
import OfflineScreen from '@/components/offline/offline-screen'

/**
 * Offline Detection Gate
 * Wraps the entire app and shows offline screen when needed
 *
 * Usage in layout.tsx:
 *   <OfflineGate>
 *     {children}
 *   </OfflineGate>
 */
export function OfflineGate({ children }: { children: React.ReactNode }) {
  const isOffline = useOffline()

  if (isOffline) {
    return <OfflineScreen />
  }

  return <>{children}</>
}
