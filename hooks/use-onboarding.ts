import { useEffect, useState } from 'react';

const ONBOARDING_KEY = 'onboarding_completed';

export function useOnboarding() {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تأخير صغير لتجنب hydration issues
    const timer = setTimeout(() => {
      try {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        setIsFirstVisit(!completed);
      } catch (error) {
        console.error('خطأ في فحص onboarding:', error);
        setIsFirstVisit(false);
      }
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setIsFirstVisit(false);
    } catch (error) {
      console.error('خطأ في تخزين حالة onboarding:', error);
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  return {
    isFirstVisit,
    isLoading,
    completeOnboarding,
    skipOnboarding,
  };
}
