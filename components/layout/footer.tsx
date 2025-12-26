"use client"

import Link from "next/link"
import React from "react"

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-100 dark:border-slate-800 bg-transparent">
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} دوائي</div>

        <nav className="flex items-center gap-4">
          <Link href="/privacy-policy" className="text-sm text-emerald-600 hover:underline">
            سياسة الخصوصية
          </Link>
          <Link href="/terms-of-service" className="text-sm text-emerald-600 hover:underline">
            شروط الاستخدام
          </Link>
          <Link href="/auth/login" className="text-sm text-slate-500 hover:text-slate-700">
            تسجيل الدخول
          </Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
