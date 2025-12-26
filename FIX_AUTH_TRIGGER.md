# FIX: Disable the Auth Trigger

**المشكلة**: Trigger في Supabase ينشئ profiles تلقائياً عند إنشاء user، وقد يكون فاشلاً.

**الحل**: عطّل الـ trigger وخلّ verify page يتولى إنشاء profiles بعد التحقق.

## الخطوات:

### 1. اذهب إلى Supabase Dashboard
- اضغط على Settings → Webhooks & Triggers
- أو SQL Editor

### 2. شغّل هذا SQL:

```sql
-- عطّل الـ trigger الذي ينشئ profiles تلقائياً
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
```

### 3. ارجع للتطبيق وحاول التسجيل مرة أخرى

بعد التسجيل:
- ستصل رسالة تفعيل للبريد
- انقر على الرابط
- سيتم إنشاء profile تلقائياً من صفحة verify
- ستعاد توجيه لـ /home

---

## لو لسه في مشكلة:

تحقق من السجلات في Supabase:
1. اذهب SQL Editor
2. شغّل:
```sql
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';
```

هذا يظهر جميع triggers على جدول users في auth schema.
