"use client"

import { OnboardingView } from '../onboarding'
import { useOnboarding } from '@/hooks/use-onboarding'
import { useFlow } from '@/hooks/use-flow'
import { useRouter } from 'next/navigation'

type OnboardingProps = {
  onComplete?: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { isFirstVisit, isLoading, completeOnboarding, skipOnboarding } = useOnboarding()
  const { flow } = useFlow()
  const router = useRouter()

  const active = flow === 'onboarding'

  const handleComplete = () => {
    completeOnboarding()
    // Notify parent (OnboardingGate) that onboarding is complete
    // This triggers immediate state update and login page render
    onComplete?.()
    try {
      router.replace('/auth/login')
    } catch (e) {
      // fallback: leave flow as-is; FlowProvider won't overwrite active user-driven flows
      console.error('Navigation to login failed', e)
    }
  }

  const handleSkip = () => {
    skipOnboarding()
    // Notify parent (OnboardingGate) that onboarding is skipped
    onComplete?.()
    try {
      router.replace('/auth/login')
    } catch (e) {
      console.error('Navigation to login failed', e)
    }
  }

  return (
    <OnboardingView
      active={active}
      completeOnboarding={handleComplete}
      skipOnboarding={handleSkip}
    />
  )
}

export default Onboarding
