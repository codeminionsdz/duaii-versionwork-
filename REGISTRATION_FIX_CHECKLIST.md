## ✅ REGISTRATION FIX VERIFICATION CHECKLIST

### 1. **Environment Configuration**
- [ ] `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` (not `_URL_`)
- [ ] `.env.local` contains `SUPABASE_SERVICE_ROLE_KEY` (NOT prefixed with `NEXT_PUBLIC_`)
- [ ] Both values match your Supabase project settings (Project Settings → API)
- [ ] `.env.local` is listed in `.gitignore` (never commit these keys)
- [ ] Verify keys are loaded by restarting dev server

### 2. **Server Restart**
```bash
# Stop the dev server (Ctrl+C in terminal)
# Then restart:
npm run dev
```
- [ ] Dev server starts without "Missing Supabase environment variables" error
- [ ] No TypeScript compilation errors in terminal

### 3. **API Route Test**
Use curl OR DevTools → Network tab in browser:

```bash
# Copy exact email/password and run:
curl -sS -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test.unique.email@example.com",
    "password":"password123",
    "full_name":"Test User",
    "phone":"0123456789",
    "role":"user"
  }' | jq .
```

- [ ] Response status: **201** (success) or informative error with details
- [ ] If **400**: Check `details` field for auth error (usually email exists)
- [ ] If **500**: Check `details` field for DB error — paste here for analysis
- [ ] If **422**: Validation error — check required fields

### 4. **Successful Registration Indicators**
✅ Response JSON has:
```json
{
  "ok": true,
  "message": "Account created successfully",
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "role": "user"
}
```

✅ Terminal logs show:
```
📝 Creating auth user for test@example.com...
✅ Auth user created: <uuid>
📊 Inserting profile for user <uuid>...
✅ Profile created successfully
✅✅ Registration complete for test@example.com
```

### 5. **Database Verification** (Optional)
In Supabase Console:
- Go to "SQL Editor" → Run:
  ```sql
  SELECT id, full_name, phone, role FROM profiles 
  WHERE email = '<test-email>' LIMIT 1;
  ```
- [ ] Row exists with correct data

- Go to "Authentication" → Users
- [ ] New user appears in the list
- [ ] User has correct email

### 6. **Pharmacy Registration Test** (If applicable)
```bash
curl -sS -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"pharmacy.test@example.com",
    "password":"password123",
    "full_name":"Pharmacy Manager",
    "phone":"0123456789",
    "role":"pharmacy",
    "pharmacy":{
      "pharmacy_name":"Test Pharmacy",
      "license_number":"LIC123456",
      "address":"123 Main St",
      "latitude":40.7128,
      "longitude":-74.0060
    }
  }' | jq .
```

- [ ] Response: **201** with `ok: true`
- [ ] Terminal shows all 3 profile creation steps completed
- [ ] Supabase has entry in `pharmacy_profiles` table

### 7. **Error Handling Test**
Try registering with same email twice:
- [ ] First attempt: **201** success
- [ ] Second attempt: **400** with message about email already existing
- [ ] Auth user NOT duplicated in Supabase

### 8. **Production Safety Check**
- [ ] Env vars do NOT appear in browser console (check DevTools)
- [ ] Debug fields removed when NODE_ENV=production (for real deploy)
- [ ] Error messages safe for users (no internal DB details in production)

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Server misconfiguration" | Env vars missing/undefined | Restart: `npm run dev` after updating `.env.local` |
| "Invalid API key" | SERVICE_ROLE_KEY wrong or ANON_KEY used | Copy correct key from Supabase Project Settings → API |
| "Database error saving new user" | profiles table constraint issue | Check DB columns match insert fields (id, full_name, phone, role, latitude, longitude) |
| "Email already exists" | User already registered | Normal; try different email for testing |
| 422 Validation Error | Missing required fields | Include all: email, password (8+), full_name, phone |

---

## What Changed in the Code

1. **Switched from `.upsert()` to `.insert()`** — Prevents duplicate key conflicts
2. **Changed insert to DELETE NOT SELECT** — pharmacy_profiles insert no longer tries to `.select().single()`
3. **Better error messages** — Separate handling for auth vs DB errors
4. **Enhanced logging** — Console logs each step (helps identify failures)
5. **Cleaner rollback** — Immediate deletion on profile insert failure
6. **Production-safe** — Debug fields only in development

---

**If registration still fails after these checks, share the error message from step 3 and I'll provide targeted fix.**
