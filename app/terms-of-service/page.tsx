import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'شروط الاستخدام - دوائي',
}

export default function TermsOfServicePage() {
  const updated = new Date('2025-12-19').toLocaleDateString('ar-SA')

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-emerald-800 mb-2">شروط الاستخدام</h1>
        <p className="text-sm text-slate-500 mb-6">آخر تحديث: {updated}</p>

        <section className="prose prose-invert text-slate-700 dark:text-slate-200 space-y-4 leading-relaxed">
          <p>مرحباً بك في دوائي. باستخدامك للتطبيق، فإنك توافق على هذه الشروط البسيطة التي تنظم استخدامك للخدمة.</p>

          <h2>من يستخدم هذا التطبيق</h2>
          <p>المستخدمون (المرضى) والصيدليات المسجلة التي تتلقى الطلبات وتتواصل مع المستخدمين.</p>

          <h2>استخدام الخدمات والقيود</h2>
          <p>يمكنك رفع صور الوصفات ومشاركة المعلومات مع الصيدليات. لا ترفع محتوى مزيف أو غير قانوني. لا تستخدم التطبيق للإزعاج أو المضايقة.</p>

          <h2>المحتوى والملكية</h2>
          <p>تظل أنت مالك أي محتوى ترفعه، لكن تمنح دوائي ترخيصاً محدوداً لاستخدامه لتقديم الخدمة. ملكية التطبيق والكود والعلامات التجارية تعود لدوائي أو المرخّصين.</p>

          <h2>إيقاف الحساب وإنهاء الخدمة</h2>
          <p>نحتفظ بالحق في تعليق أو إيقاف حساب ينتهك هذه الشروط. يمكنك طلب حذف حسابك في أي وقت.</p>

          <h2>الاتصال والدعم</h2>
          <p>لأي استفسار أو طلب حذف بيانات: <strong>support@duaii.app</strong></p>
        </section>

        <div className="mt-8 text-sm text-slate-600">
          <Link href="/" className="text-emerald-600 hover:underline">العودة إلى الصفحة الرئيسية</Link>
        </div>
      </div>
    </main>
  )
}
