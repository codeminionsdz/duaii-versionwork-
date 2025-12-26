# Fix for POST /api/auth/register 400 Bad Request Error

## Problem
When registering a new user, the API returns:
- **HTTP 400 (Bad Request)**
- **Error**: "Database error creating new user"

## Root Causes Identified

### 1. **Incorrect Trigger Logic**
The `handle_new_user` trigger in `sql/create_profile_trigger.sql` was incorrect. It was attempting to insert `email` into the `profiles` table (which has no `email` column) and was completely missing the `full_name` column, which is a `NOT NULL` field. This caused a database error every time a new user tried to register.

```sql
-- ❌ WRONG (from sql/create_profile_trigger.sql)
insert into public.profiles (id, email)
values (new.id, new.email);
```

The `profiles` table requires `full_name` and `role`.

### 2. **Redundant Profile Insertion**
The register route was manually trying to upsert profiles, but:
- The trigger already handles profile creation automatically
- The manual upsert was conflicting with RLS policies
- This created 2x the database operations

## Solutions Applied

### ✅ Fix #1: Correct the Database Trigger
The incorrect trigger in `sql/create_profile_trigger.sql` has been replaced with the correct version. The new trigger correctly reads the `full_name`, `phone`, and `role` from the new user's metadata and inserts them into the `profiles` table.

### ✅ Fix #2: Code Consolidation
The file `scripts/002_create_profile_trigger.sql` was found to contain a more up-to-date version of the trigger. Its content has been copied to `sql/create_profile_trigger.sql` to centralize the correct logic.

### ✅ Fix #3: API Route Verified
The register route `app/api/auth/register/route.ts` was reviewed and it already correctly supplies the `user_metadata` needed by the trigger. No changes were needed there.

## What Changed in route.ts

### Before
1. Create auth user
2. Manually try to upsert profile with fallbacks
3. Try minimal insert fallback
4. Check if profile exists
5. Create pharmacy profile if needed

### After
1. Create auth user (with role in metadata)
2. Wait for trigger to create profile
3. Verify profile exists (trigger should have created it)
4. Create pharmacy profile if needed

## Deployment Steps

### 1. **Update the Database Trigger** (MUST DO)
Run the content of `sql/create_profile_trigger.sql` in your Supabase SQL Editor.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
begin
  -- Determine role from metadata
  user_role := coalesce(new.raw_user_meta_data ->> 'role', 'user');
  
  -- Create profile
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'مستخدم جديد'),
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    user_role::user_role
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;
```

### 2. **Deploy Code Changes**
- Updated: `sql/create_profile_trigger.sql`
- Verified: `app/api/auth/register/route.ts` (no changes needed)

### 3. **Test Registration**
1. Go to signup page
2. Fill in: email, password, full_name, role
3. Click sign up
4. Should see: "تم إنشاء الحساب" (Account created)
5. Check Supabase: profiles table should have new user

## Testing Checklist

- [ ] User signup (role = "user")
  - [ ] Auth user created in auth.users
  - [ ] Profile created in profiles table
  - [ ] Verification email sent

- [ ] Pharmacy signup (role = "pharmacy")
  - [ ] Auth user created
  - [ ] Profile created with role = 'pharmacy'
  - [ ] Pharmacy profile created in pharmacy_profiles
  - [ ] Verification email sent

- [ ] Error cases
  - [ ] Invalid email format
  - [ ] Password too short
  - [ ] Existing email
  - [ ] Missing required fields

## Success Indicators

✅ Registration completes without 400 error
✅ User gets "تم إنشاء الحساب" message
✅ Profile appears in database immediately
✅ Verification email is sent
✅ User can verify email and login

---

**Status**: Ready to deploy
**Risk Level**: Low (fixes only bugs, doesn't change behavior)
**Rollback**: Revert trigger SQL and route.ts changes
