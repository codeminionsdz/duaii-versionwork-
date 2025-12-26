"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWelcome } from '@/hooks/use-welcome'
import { useFlow } from '@/hooks/use-flow'
import Image from 'next/image'

/**
 * Welcome Screen - The very first screen users see
 * Clean, modern, consumer-app style with logo and CTA
 */
export function WelcomeScreen() {
  const { hasSeenWelcome, isLoading, completeWelcome } = useWelcome()
  const { setFlow } = useFlow()
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)

  useEffect(() => {
    // small mount delay to trigger the logo entrance animation on first render
    const t = setTimeout(() => setLogoVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Safety: don't render if already seen welcome
  if (isLoading || hasSeenWelcome) return null

  const handleStart = () => {
    setIsAnimating(true)
    // Small delay for animation smoothness
    setTimeout(() => {
      completeWelcome()
      try { setFlow('onboarding') } catch (e) {}
    }, 300)
  }

    const handleLoginClick = () => {
      // Mark welcome seen but DO NOT navigate to login here.
      // Login must not appear before onboarding is completed.
      setIsAnimating(true)
      setTimeout(() => {
        completeWelcome()
        try { setFlow('onboarding') } catch (e) {}
      }, 300)
    }
  return (
    <div
      suppressHydrationWarning
      dir="rtl"
      className={`fixed inset-0 z-50 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center px-6 transition-opacity duration-300 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-8 max-w-md w-full">
        {/* Logo */}
        <div
          className={`w-32 h-32 relative flex items-center justify-center transform transition-all duration-[350ms] ease-out ${
            logoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
          }`}
        >
          <Image
            src="/images/logo.png"
            alt="دوائي Logo"
            width={128}
            height={128}
            priority
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Headline */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            دوائي
          </h1>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
            تطبيقك الموثوق للصيدليات
          </p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-700 dark:active:bg-emerald-600 text-white font-semibold transform transition-colors transition-transform duration-150 active:scale-[0.98]"
        >
          ابدأ الآن
        </button>
        {/* Trust micro-copy */}
        <div className="w-full text-center mt-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">🔒 بياناتك محفوظة بأمان</p>
        </div>
        {/* Secondary small link - Login */}
        <div className="w-full text-center mt-3">
          <button
            onClick={handleLoginClick}
            className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
          >
            لديك حساب؟ <span className="font-semibold">تسجيل الدخول</span>
          </button>
        </div>
      </div>
    </div>
  )
}
