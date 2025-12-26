import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'سياسة الخصوصية - دوائي',
}

export default function PrivacyPolicyPage() {
  const updated = new Date('2025-12-19').toLocaleDateString('ar-SA')

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-emerald-800 mb-2">سياسة الخصوصية</h1>
        <p className="text-sm text-slate-500 mb-6">آخر تحديث: {updated}</p>

        <section className="prose prose-invert text-slate-700 dark:text-slate-200 space-y-4 leading-relaxed">
          <p>مرحباً في دوائي. نحن نحترم خصوصيتك ونحرص على حماية معلوماتك الشخصية. هذا المستند يشرح ببساطة ما نجمعه، لماذا، وكيف نتعامل مع بياناتك على الويب، كـ PWA، وعلى أندرويد.</p>

          <h2>ما البيانات التي نجمعها</h2>
          <ul>
            <li>بيانات التسجيل: البريد الإلكتروني، الاسم (اختياري)، دور الحساب (مستخدم / صيدلية).</li>
            <li>بيانات الموقع: إحداثيات GPS (اختياري) تُستخدم فقط عند منح الإذن.</li>
            <li>الوصفات الطبية: صور الوصفات والبيانات الوصفية ذات الصلة.</li>
            <li>بيانات الإشعارات: اشتراكات الإعلام لإرسال تنبيهات حول الوصفات.</li>
            <li>بيانات استخدام التطبيق: صفحات زرتها وتفاعلات لتحسين الخدمة.</li>
          </ul>

          <h2>لماذا نحتاج هذه البيانات</h2>
          <p>نستخدم البريد الإلكتروني للمصادقة وإدارة الحساب، والموقع لإيجاد الصيدليات القريبة، والوصفات للطلب والمشاركة مع الصيدليات، والإشعارات لتنبيهك بتحديثات الوصفة.</p>

          <h2>أين تُخزن البيانات</h2>
          <p>نستخدم Supabase لتخزين المستخدمين والملفات والاشتراكات. المفاتيح السرية لا تُعرض على الواجهة الأمامية وتُحفظ في بيئة الخادم.</p>

          <h2>حقوقك</h2>
          <p>يمكنك طلب الوصول إلى بياناتك، تعديلها، أو طلب حذف حسابك وبياناتك عبر البريد support@duaii.app.</p>

          <h2>التواصل</h2>
          <p>أي استفسار أو طلبات حذف أو شكاوى الخصوصية: <strong>support@duaii.app</strong></p>
        </section>

        <div className="mt-8 text-sm text-slate-600">
          <Link href="/" className="text-emerald-600 hover:underline">العودة إلى الصفحة الرئيسية</Link>
        </div>
      </div>
    </main>
  )
}
