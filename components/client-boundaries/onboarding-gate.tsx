'use client'

/**
 * OnboardingGate - Client Boundary Wrapper
 * 
 * This component acts as an explicit client boundary for the Onboarding system.
 * It isolates all client-side hooks and state management from the Server Component (layout).
 * 
 * Usage in layout.tsx:
 * import { OnboardingGate } from '@/components/client-boundaries/onboarding-gate'
 * 
 * <OnboardingGate />
 */

import { useEffect, useState } from 'react'
import Onboarding from '@/components/onboarding/index'

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState<boolean>(true) // Default true to prevent hydration mismatch

  useEffect(() => {
    // Read persisted onboarding flag from localStorage on the client
    try {
      const v = localStorage.getItem('onboarding_completed')
      setCompleted(v === 'true')
    } catch (e) {
      // If access fails, assume completed to avoid blocking navigation
      setCompleted(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleOnboardingComplete = () => {
    // Update state immediately when onboarding completes
    // This triggers immediate re-render to show login page without refresh
    setCompleted(true)
  }

  // While loading, render children to avoid hydration mismatch
  if (loading) return <>{children}</>

  // If onboarding already completed, render children
  if (completed) return <>{children}</>

  // Otherwise, show the onboarding flow with callback
  return <Onboarding onComplete={handleOnboardingComplete} />
}

export default OnboardingGate
