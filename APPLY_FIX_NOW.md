# Quick Fix: Apply to Supabase Database

## 🚨 CRITICAL: Run This SQL in Supabase

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- ✅ FIX: Update the profile creation trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data ->> 'role', 'user');
  
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'مستخدم جديد'),
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    user_role
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;
```

That's it! The code changes are already applied.

## ✅ Verify the Fix

After running the SQL, test signup:

1. Go to your app signup page
2. Fill in: email, password, full_name
3. Click sign up
4. Should see: "تم إنشاء الحساب" (success message)
5. In Supabase, check: **profiles** table should have new user

## 📊 What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| Profile trigger | Tried to insert `state` column | Only inserts valid columns |
| Register route | Manual profile insertion | Relies on trigger (simpler) |
| User metadata | Missing `role` field | Includes `role` for trigger |
| Pharmacy creation | Complex fallback logic | Simple direct insert |

---

**Status**: ✅ Ready to deploy
**Time to fix**: ~1 minute (just run the SQL)
**Risk**: Very low (fixes only bugs)
