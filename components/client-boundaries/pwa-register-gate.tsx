'use client'

/**
 * PWARegisterGate - Client Boundary Wrapper
 * 
 * This component acts as an explicit client boundary for the PWA Registration.
 * It isolates all client-side hooks and state management from the Server Component (layout).
 * 
 * Usage in layout.tsx:
 * import { PWARegisterGate } from '@/components/client-boundaries/pwa-register-gate'
 * 
 * <PWARegisterGate />
 */

import { PWARegister } from '@/components/pwa-register'

export function PWARegisterGate() {
  return <PWARegister />
}
