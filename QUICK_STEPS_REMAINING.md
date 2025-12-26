# 🚀 خطوات سريعة - ما تبقى للرفع إلى المتاجر

## ⏱️ الوقت المقدر: 1-2 ساعة

---

## ✅ تم إنجازه

- [x] تحديث الإصدار إلى 1.5.0
- [x] Privacy Policy منشورة: https://duaiinow.vercel.app/privacy-policy
- [x] Sentry للتتبع مُثبّت
- [x] Rate Limiting مُضاف
- [x] Service Worker محسّن
- [x] الكود مرفوع على GitHub

---

## 📋 الخطوات المتبقية (افعلها بالترتيب)

### 1️⃣ تثبيت JDK (10 دقائق)

```powershell
# حمّل JDK 17 من:
https://www.oracle.com/java/technologies/downloads/

# اختر: Windows x64 Installer
# ثبّت بالإعدادات الافتراضية
# أعد تشغيل PowerShell بعد التثبيت

# تأكد من التثبيت:
java -version
```

---

### 2️⃣ إنشاء Keystore (5 دقائق)

```powershell
cd c:\Users\codem\OneDrive\project\duaii\android

keytool -genkey -v `
  -keystore duaii-release-key.keystore `
  -alias duaii `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000

# سيطلب منك معلومات:
# كلمة المرور: [أدخل كلمة قوية واحفظها!]
# الاسم الكامل: Duaii Team
# اسم المؤسسة: Duaii
# المدينة: Algiers
# الولاية: Algiers
# البلد: DZ
```

**⚠️ مهم جداً:** احفظ كلمة المرور في مكان آمن!

---

### 3️⃣ تفعيل التوقيع (2 دقيقة)

افتح: `android\app\build.gradle`

```groovy
// ابحث عن هذا القسم وفعّله:
signingConfigs {
    release {
        storeFile file('duaii-release-key.keystore')
        storePassword 'YOUR_PASSWORD_HERE'  // ضع كلمة المرور
        keyAlias 'duaii'
        keyPassword 'YOUR_PASSWORD_HERE'    // ضع كلمة المرور
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release  // فعّل هذا السطر
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

---

### 4️⃣ Firebase - تحميل google-services.json (5 دقائق)

```
1. اذهب إلى: https://console.firebase.google.com/
2. سجل دخول
3. اختر المشروع أو أنشئ واحد جديد
4. اضغط: ⚙️ Project Settings
5. اذهب لـ: Your apps → Android
6. إذا لم يوجد تطبيق Android:
   - اضغط: + Add app → Android
   - Package name: com.duaiii.app
   - اضغط: Register app
7. اضغط: Download google-services.json
8. احفظه في: android\app\google-services.json
9. في Firebase Console، فعّل: Cloud Messaging
```

---

### 5️⃣ Sentry - إعداد DSN (5 دقائق)

```
1. اذهب إلى: https://sentry.io
2. أنشئ حساب مجاني (Free tier: 5K errors/month)
3. اضغط: Create Project
4. اختر: Next.js
5. اسم المشروع: duaii-app
6. انسخ DSN من الصفحة
7. أنشئ ملف .env.local في المشروع:
```

```env
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
```

---

### 6️⃣ بناء التطبيق (10 دقائق)

```powershell
cd c:\Users\codem\OneDrive\project\duaii

# 1. بناء Next.js
npm run build

# 2. مزامنة Capacitor
npx cap sync android

# 3. فتح Android Studio
npx cap open android

# في Android Studio:
# 4. Build → Generate Signed Bundle / APK
# 5. اختر: Android App Bundle (.aab)
# 6. Next → اختر keystore الذي أنشأته
# 7. أدخل كلمة المرور
# 8. Next → اختر: release
# 9. Finish
# 10. انتظر البناء (3-5 دقائق)
```

**ملف AAB سيكون في:**
`android\app\release\app-release.aab`

---

### 7️⃣ التقاط Screenshots (10 دقائق)

```powershell
# شغّل التطبيق على emulator أو جهاز:
npm run dev

# التقط 4-8 صور من:
✓ الصفحة الرئيسية
✓ خريطة الصيدليات
✓ رفع وصفة طبية
✓ الإشعارات
✓ الملف الشخصي
✓ صفحة صيدلية

# الدقة المطلوبة:
Phone: 1080 x 1920 px (أو أعلى)
```

---

### 8️⃣ رفع إلى Google Play Console (30 دقيقة)

```
1. اذهب إلى: https://play.google.com/console/
2. أنشئ حساب Developer ($25 مرة واحدة)
3. اضغط: Create app
4. املأ التفاصيل:
   - الاسم: دوائي
   - اللغة: العربية
   - النوع: تطبيق
   - مجاني

5. App content:
   - Privacy Policy: https://duaiinow.vercel.app/privacy-policy
   - املأ استبيان Content rating
   - Data safety form (البيانات التي تجمعها)

6. Store presence:
   - وصف قصير (80 حرف)
   - وصف طويل (4000 حرف)
   - Screenshots (4-8 صور)
   - أيقونة: 512 x 512 px
   - Feature graphic: 1024 x 500 px

7. Production release:
   - Create new release
   - ارفع ملف .aab
   - اكتب Release notes
   - Review

8. Submit for review
```

---

## 📝 قائمة التحقق النهائية

قبل الرفع، تأكد:

- [ ] JDK مثبت
- [ ] Keystore منشأ ومحفوظ بأمان
- [ ] google-services.json موجود في android/app/
- [ ] Sentry DSN مُعد في .env.local
- [ ] AAB مبني بنجاح
- [ ] Screenshots ملتقطة (4-8 صور)
- [ ] أيقونة 512x512 جاهزة
- [ ] وصف التطبيق مكتوب
- [ ] Privacy Policy URL: https://duaiinow.vercel.app/privacy-policy
- [ ] حساب Google Play Developer جاهز ($25)

---

## 🎯 بعد الرفع

**مدة المراجعة:** 1-7 أيام عادةً

**ستتلقى إشعار عبر البريد:**
- ✅ تم القبول → التطبيق منشور!
- ❌ رُفض → اقرأ السبب وصحح المشكلة

---

## 💡 نصائح

1. **احفظ keystore في مكان آمن** - ستحتاجه لكل تحديث!
2. **اختبر AAB** قبل الرفع على جهاز حقيقي
3. **اكتب Release Notes** بالعربية (مهم للمستخدمين)
4. **راقب Sentry** بعد النشر لتتبع الأخطاء
5. **جهّز خطة تحديث** شهرية

---

## 🆘 إذا واجهت مشاكل

| المشكلة | الحل |
|---------|------|
| JDK لا يعمل | تأكد من PATH في Environment Variables |
| keystore error | تأكد من كلمة المرور صحيحة |
| Build failed | راجع Logcat في Android Studio |
| Google Play رفض | اقرأ سبب الرفض في Console |
| Sentry لا يعمل | تأكد من DSN صحيح في .env.local |

---

## 📞 روابط مفيدة

- **Firebase Console:** https://console.firebase.google.com/
- **Sentry:** https://sentry.io
- **Google Play Console:** https://play.google.com/console/
- **Android Keystore Docs:** https://developer.android.com/studio/publish/app-signing

---

**🎉 حظاً موفقاً في الإطلاق!**

التطبيق جاهز تقنياً، فقط أكمل هذه الخطوات وسيكون على المتاجر قريباً! 🚀
