import React from 'react'
import { Wifi, RotateCw } from 'lucide-react'

/**
 * Offline Fallback Screen - Medical Grade UX
 * Calm, trustworthy, Arabic-first design
 * Shows when app detects no internet connection
 */
export default function OfflineScreen() {
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleRetry = () => {
    setIsRetrying(true)
    // Check connection after 1 second
    setTimeout(() => {
      if (navigator.onLine) {
        // Connection restored - reload the page
        window.location.reload()
      } else {
        setIsRetrying(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Subtle background elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-slate-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-slate-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Icon Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* WiFi Icon - Animated */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-lg">
              <Wifi className="w-12 h-12 text-slate-500 opacity-60" />
            </div>
            {/* X indicator - overlay */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-red-100 border-4 border-white flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-red-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Title & Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">لا يوجد اتصال</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            لا يوجد اتصال بالإنترنت. يرجى التحقق من شبكتك والمحاولة مجدداً.
          </p>
        </div>

        {/* Status Info */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-100 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">الحالة</p>
              <p className="text-sm text-slate-600 mt-1">
                البرنامج يحاول الاتصال بالإنترنت. عندما تتصل، سيعود كل شيء للعمل تلقائياً.
              </p>
            </div>
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            isRetrying
              ? 'bg-slate-200 text-slate-500 cursor-wait'
              : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-lg'
          }`}
        >
          <RotateCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'جاري المحاولة...' : 'حاول مجدداً'}
        </button>

        {/* Help Text */}
        <p className="text-center text-xs text-slate-500 mt-6">
          إذا استمرت المشكلة، تحقق من:
          <br />
          • تشغيل WiFi أو البيانات
          <br />
          • عدم تفعيل وضع الطيران
          <br />
          • إعادة تشغيل الجهاز
        </p>
      </div>
    </div>
  )
}
