import { useEffect, useState } from 'react'

const WELCOME_KEY = 'welcome_seen'

/**
 * Hook to manage welcome screen state
 * Separate from onboarding - triggers before onboarding flow
 */
export function useWelcome() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true) // Default true to prevent flash
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has seen the welcome screen
    const timer = setTimeout(() => {
      try {
        const seen = localStorage.getItem(WELCOME_KEY)
        setHasSeenWelcome(!!seen)
      } catch (error) {
        console.error('Error checking welcome state:', error)
        setHasSeenWelcome(true) // Assume seen on error
      }
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const completeWelcome = () => {
    try {
      localStorage.setItem(WELCOME_KEY, 'true')
      setHasSeenWelcome(true)
    } catch (error) {
      console.error('Error saving welcome state:', error)
    }
  }

  return {
    hasSeenWelcome,
    isLoading,
    completeWelcome,
  }
}
