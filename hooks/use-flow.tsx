"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useWelcome } from './use-welcome'
import { useOnboarding } from './use-onboarding'

type FlowState = 'welcome' | 'onboarding' | 'login'

type FlowContextType = {
  flow: FlowState
  setFlow: (f: FlowState) => void
}

const FlowContext = createContext<FlowContextType | undefined>(undefined)

export const FlowProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const { hasSeenWelcome, isLoading: welcomeLoading } = useWelcome()
  const { isFirstVisit, isLoading: onboardingLoading } = useOnboarding()

  const [flow, setFlow] = useState<FlowState>('welcome')

  // Initialize flow based on persisted state once loading finishes.
  // Only set the initial flow if the current flow is still the default ('welcome')
  // so we don't overwrite user-driven transitions (e.g. setFlow called by UI).
  useEffect(() => {
    if (welcomeLoading || onboardingLoading) return
    if (flow !== 'welcome') return
    if (!hasSeenWelcome) setFlow('welcome')
    else if (isFirstVisit) setFlow('onboarding')
    else setFlow('login')
  }, [welcomeLoading, onboardingLoading, hasSeenWelcome, isFirstVisit, flow])

  return <FlowContext.Provider value={{ flow, setFlow }}>{children}</FlowContext.Provider>
}

export function useFlow() {
  const ctx = useContext(FlowContext)
  if (!ctx) throw new Error('useFlow must be used within FlowProvider')
  return ctx
}

export default useFlow
