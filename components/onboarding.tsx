 'use client'
import { useState, useEffect } from 'react'
import PermissionPrompt from '@/components/onboarding/PermissionPrompt'
import { Pill, UploadCloud, Bell, ShieldCheck } from 'lucide-react'

// Fullscreen, calm, medical-style onboarding (RTL aware)
export function OnboardingView({
  active,
  completeOnboarding,
  skipOnboarding,
}: {
  active: boolean
  completeOnboarding: () => void
  skipOnboarding: () => void
}) {
  const [step, setStep] = useState(0)
  const [contentVisible, setContentVisible] = useState(true)

  useEffect(() => {
    setContentVisible(false)
    const t = setTimeout(() => setContentVisible(true), 20)
    return () => clearTimeout(t)
  }, [step])

  const steps = [
    {
      icon: <Pill className="w-24 h-24 text-emerald-600/80" />,
      title: 'إدارة الوصفات',
      sentence: 'إدارة الوصفات والعثور على الأدوية بسهولة.',
    },
    {
      icon: <UploadCloud className="w-24 h-24 text-emerald-600/80" />,
      title: 'كيف تبدأ',
      sentence: 'ارفع الوصفة أو ابحث عن الدواء للبدء.',
    },
    {
      icon: <Bell className="w-24 h-24 text-emerald-600/80" />,
      title: 'الإشعارات',
      sentence: 'تلقي تحديثات حول التوفر وحالة الوصفات.',
    },
    {
      icon: <ShieldCheck className="w-24 h-24 text-emerald-600/80" />,
      title: 'الموقع (اختياري)',
      sentence: 'استخدم الموقع لإظهار الصيدليات القريبة وتحسين النتائج.',
    },
    {
      icon: <ShieldCheck className="w-24 h-24 text-emerald-600/80" />,
      title: 'الخصوصية',
      sentence: 'نحمي بياناتك ونحافظ على سريتها التامة.',
    },
  ]

  const isLast = step === steps.length - 1

  const goNext = () => {
    try {
      if (step === 2 || step === 3) {
        localStorage.setItem('permissionsRequested', 'true')
      }
    } catch (e) {}
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const goPrev = () => setStep((s) => Math.max(s - 1, 0))

  const handleStart = () => completeOnboarding()

  return (
    <div
      dir="rtl"
      aria-hidden={!active}
      className={`fixed inset-0 z-50 p-6 sm:p-12 bg-gradient-to-b from-white to-emerald-50 dark:from-slate-900 dark:to-slate-900 overflow-auto ${active ? 'flex' : 'hidden'} items-center justify-center`}
    >
      <div className="w-full max-w-md mx-auto">
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-2 mb-2" aria-hidden>
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === step ? 'bg-emerald-600/90' : 'bg-slate-200/70'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-center mb-2">{steps[step].icon}</div>

            <div className={`w-full ${contentVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'} transition-all duration-200 ease-out`}>
              <h2 className="text-2xl font-medium">{steps[step].title}</h2>
              <p className="text-sm text-slate-500 mt-2">{steps[step].sentence}</p>

              {step === 2 && (
                <div className="w-full mt-4">
                  <PermissionPrompt permission="push" onComplete={() => {
                    try { localStorage.setItem('permissionsRequested', 'true') } catch (e) {}
                  }} />
                </div>
              )}

              {step === 3 && (
                <div className="w-full mt-4">
                  <PermissionPrompt permission="location" onComplete={() => {
                    try { localStorage.setItem('permissionsRequested', 'true') } catch (e) {}
                  }} />
                </div>
              )}

              <div className="w-full flex gap-3 mt-6">
                <button onClick={() => skipOnboarding()} className="flex-1 py-3 rounded-lg border border-slate-200 bg-transparent text-slate-700">تخطي</button>

                {!isLast ? (
                  <button onClick={goNext} className="flex-1 py-3 rounded-lg bg-emerald-600 text-white">التالي</button>
                ) : (
                  <button onClick={handleStart} className="flex-1 py-3 rounded-lg bg-emerald-600 text-white">ابدأ</button>
                )}
              </div>

              <div className="w-full flex justify-between mt-4 text-sm text-muted-foreground">
                <button onClick={goPrev} disabled={step === 0} className="opacity-80 disabled:opacity-40">السابق</button>
                <div />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingView
