'use client'

/**
 * WelcomeScreenGate - Client Boundary Wrapper
 * 
 * This component acts as an explicit client boundary for the Welcome Screen.
 * It isolates all client-side hooks and state management from the Server Component (layout).
 * 
 * Usage in layout.tsx:
 * import { WelcomeScreenGate } from '@/components/client-boundaries/welcome-screen-gate'
 * 
 * <WelcomeScreenGate />
 */

import { WelcomeScreen } from '@/components/welcome-screen'

export function WelcomeScreenGate() {
  return <WelcomeScreen />
}
