# ✅ حل مشكلة رسائل التحقق

## المشكلة
رسائل التحقق من البريد الإلكتروني لا تصل للمستخدمين.

## الحلول

### الحل 1: تفعيل Auto-Confirm للتطوير (موصى به)

اذهب إلى **Supabase Dashboard**:

1. اختر مشروعك
2. **Authentication** → **Providers** → **Email**
3. قم بتعطيل "Confirm email" مؤقتاً للتطوير
4. أو فعّل "Enable email confirmation" لكن تأكد من SMTP مضبوط

### الحل 2: ضبط SMTP (للإنتاج)

في **Supabase Dashboard** → **Project Settings** → **Auth**:

1. Enable Custom SMTP
2. أضف بيانات SMTP الخاصة بك:
   - Host: smtp.gmail.com (أو مزود آخر)
   - Port: 587
   - User: your-email@gmail.com
   - Password: your-app-password
   - Sender email: noreply@yourdomain.com

### الحل 3: استخدام Mailtrap للتطوير

1. سجل في https://mailtrap.io (مجاني)
2. احصل على SMTP credentials
3. أضفهم في Supabase SMTP settings

---

## التطبيق الآن يدعم

✅ **Auto-Confirm**: إذا كان التحقق من البريد مطفياً، سيتم إنشاء الحساب مباشرة
✅ **Manual Confirm**: إذا كان مفعلاً، سترسل رسالة تحقق

جرب الآن!
