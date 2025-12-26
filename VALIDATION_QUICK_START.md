# Zod Validation - Quick Integration Guide

## 🎯 5-Minute Setup

### Step 1: Verify Zod
```bash
npm ls zod  # Should show: zod@4.1.13 ✅
```

### Step 2: Choose Your First Endpoint
Typically login (authentication) - safest place to start

### Step 3: Add This Code

**For Server Actions:**
```typescript
"use server"

import { loginSchema, getFirstErrorMessage } from "@/lib/validation"

export async function yourLoginAction(formData: unknown) {
  // 🔒 Validate input
  const result = loginSchema.safeParse(formData)
  
  // ❌ Return error if invalid
  if (!result.success) {
    return {
      success: false,
      error: getFirstErrorMessage(result.error.issues)
    }
  }
  
  // ✅ Use validated data
  const { email, password } = result.data
  
  // Your existing auth code...
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  // ... rest of your code
}
```

**For API Routes:**
```typescript
import { loginSchema, getFirstErrorMessage } from "@/lib/validation"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // 🔒 Validate
  const result = loginSchema.safeParse(body)
  
  // ❌ Return 400 if invalid
  if (!result.success) {
    return NextResponse.json(
      { error: getFirstErrorMessage(result.error.issues) },
      { status: 400 }
    )
  }
  
  // ✅ Use validated data
  const { email, password } = result.data
  
  // Your existing code...
}
```

### Step 4: Test
```bash
# Invalid email - should fail validation
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"pass"}'

# Response: 400 Bad Request
# { "error": "صيغة البريد الإلكتروني غير صحيحة" }

# Valid data - should work
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response: 200 OK or 401 (auth failed) - NOT 400
```

---

## 📊 Available Schemas at a Glance

```typescript
// Authentication
import { loginSchema } from "@/lib/validation"              // email, password
import { registerSchema } from "@/lib/validation"           // email, password, role, etc.

// Search
import { medicineSearchSchema } from "@/lib/validation"     // query, limit
import { pharmacySearchSchema } from "@/lib/validation"     // latitude, longitude, etc.

// Prescription
import { prescriptionSubmissionSchema } from "@/lib/validation" // medicine names, notes, etc.

// Helpers
import { getFirstErrorMessage } from "@/lib/validation"     // Extract 1st error for display
import { formatValidationError } from "@/lib/validation"    // Get all errors with fields
```

---

## 🚀 Implementation Roadmap

### Phase 1: Authentication (10 minutes)
- [ ] Add `loginSchema` to your login endpoint
- [ ] Add `registerSchema` to your register endpoint
- [ ] Test with invalid inputs
- [ ] Test with valid inputs

### Phase 2: Search (5 minutes)
- [ ] Add `medicineSearchSchema` to medicine search
- [ ] Add `pharmacySearchSchema` to pharmacy search
- [ ] Test edge cases

### Phase 3: Prescription (5 minutes)
- [ ] Add `prescriptionSubmissionSchema` to prescription submit
- [ ] Test file validation
- [ ] Test optional fields

---

## 📋 Validation Pattern (Copy-Paste Template)

**Server Action:**
```typescript
"use server"

import { YOUR_SCHEMA, getFirstErrorMessage } from "@/lib/validation"

export async function yourAction(input: unknown) {
  // ✅ THIS IS THE PATTERN:
  const result = YOUR_SCHEMA.safeParse(input)
  if (!result.success) {
    return { success: false, error: getFirstErrorMessage(result.error.issues) }
  }
  const validData = result.data
  // Your logic here...
}
```

**API Route:**
```typescript
import { YOUR_SCHEMA, getFirstErrorMessage } from "@/lib/validation"

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // ✅ THIS IS THE PATTERN:
  const result = YOUR_SCHEMA.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: getFirstErrorMessage(result.error.issues) },
      { status: 400 }
    )
  }
  const validData = result.data
  // Your logic here...
}
```

---

## ✅ Before & After Comparison

### BEFORE (No Validation)
```typescript
export async function loginAction(email: string, password: string) {
  // ⚠️ What if email is invalid?
  // ⚠️ What if password is too short?
  // ⚠️ No type checking on inputs
  
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
}
```

### AFTER (With Validation)
```typescript
export async function loginAction(input: unknown) {
  // ✅ Validate input format
  const result = loginSchema.safeParse(input)
  if (!result.success) {
    return { error: getFirstErrorMessage(result.error.issues) }
  }
  
  // ✅ Input is guaranteed valid here
  const { email, password } = result.data
  
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
}
```

---

## 🎯 Schemas by Endpoint

| Endpoint | Schema | Import |
|----------|--------|--------|
| Login | loginSchema | `import { loginSchema } from "@/lib/validation"` |
| Register | registerSchema | `import { registerSchema } from "@/lib/validation"` |
| Medicine Search | medicineSearchSchema | `import { medicineSearchSchema } from "@/lib/validation"` |
| Pharmacy Search | pharmacySearchSchema | `import { pharmacySearchSchema } from "@/lib/validation"` |
| Prescription Submit | prescriptionSubmissionSchema | `import { prescriptionSubmissionSchema } from "@/lib/validation"` |

---

## 🧪 Quick Test Commands

```bash
# Test invalid email
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bad","password":"pass123"}'

# Test short password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"short"}'

# Test valid login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Test medicine search with invalid limit
curl 'http://localhost:3000/api/medicines/search?query=aspirin&limit=999'

# Test valid search
curl 'http://localhost:3000/api/medicines/search?query=aspirin&limit=20'
```

---

## 💾 Files Reference

| File | Purpose | Size |
|------|---------|------|
| `lib/validation.ts` | Zod schemas + helpers | 270 lines |
| `lib/VALIDATION_EXAMPLES.ts` | Server Action examples | 250 lines |
| `lib/VALIDATION_API_EXAMPLES.ts` | API Route examples | 200 lines |
| `VALIDATION_GUIDE.md` | Complete documentation | This file |

---

## 🛡️ Error Messages

All error messages are in Arabic:

| Condition | Message |
|-----------|---------|
| Email format invalid | "صيغة البريد الإلكتروني غير صحيحة" |
| Email missing | "البريد الإلكتروني مطلوب" |
| Password too short | "كلمة المرور يجب أن تكون 6 أحرف على الأقل" |
| Passwords don't match | "كلمات المرور غير متطابقة" |
| Query too long | "نص البحث طويل جداً" |
| Latitude invalid | "خط العرض غير صحيح" |
| Role invalid | "نوع الحساب غير صحيح" |

---

## ⚡ Performance

- **Validation time**: <1ms
- **Memory**: Negligible
- **Dependencies**: Already installed (Zod ^4.1.13)

✅ **Zero performance impact**

---

## 🔧 Customization Examples

### Change Error Message
```typescript
export const loginSchema = z.object({
  email: z.string().email("Custom error message")
})
```

### Change Limit
```typescript
export const medicineSearchSchema = z.object({
  query: z.string().min(2).max(200)  // Changed from 100
})
```

### Add Required Field Validation
```typescript
export const prescriptionSubmissionSchema = z.object({
  medicineNames: z.string().min(1).max(500),
  date: z.date(),  // New required date field
})
```

---

## ❓ FAQ

**Q: Will this break my existing code?**
A: No. Validation is opt-in. Add it to endpoints one by one.

**Q: Can I use with Client Components?**
A: Yes. Use schema on client for UX, but always validate on server.

**Q: Do I need to update my API documentation?**
A: No breaking changes. Status codes stay the same (400 for bad input).

**Q: What if validation is too strict?**
A: Adjust `.min()`, `.max()` in `lib/validation.ts` schemas.

**Q: Can I reuse schemas?**
A: Yes! Import `registerSchema`, `loginSchema`, etc. everywhere.

**Q: What about image uploads?**
A: Validate file IDs after they're stored in Supabase.

---

## 🚨 Common Errors

### "Type 'unknown' is not assignable to type 'LoginInput'"
→ **Solution**: Validate first, then use `result.data`
```typescript
const result = loginSchema.safeParse(input)
const data: LoginInput = result.data  // ✅ Now it's typed
```

### "Property 'password' does not exist on type 'never'"
→ **Solution**: Check `if (!result.success)` before using `result.data`

### Error message not showing
→ **Solution**: Use `getFirstErrorMessage(result.error.issues)`

---

## ✨ Next Steps

1. **Read**: `lib/VALIDATION_EXAMPLES.ts` (see how it works)
2. **Choose**: First endpoint to validate (recommend: login)
3. **Copy**: 10 lines of validation code
4. **Test**: With invalid input
5. **Verify**: Error message displays
6. **Repeat**: For other endpoints

---

## 📞 Support

- **Full guide**: [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)
- **Server Action examples**: [lib/VALIDATION_EXAMPLES.ts](lib/VALIDATION_EXAMPLES.ts)
- **API Route examples**: [lib/VALIDATION_API_EXAMPLES.ts](lib/VALIDATION_API_EXAMPLES.ts)

---

## ✅ Checklist

- [ ] `npm ls zod` shows zod@4.1.13
- [ ] Reviewed `lib/validation.ts`
- [ ] Reviewed `lib/VALIDATION_EXAMPLES.ts`
- [ ] Added validation to login endpoint
- [ ] Tested with invalid input
- [ ] Tested with valid input
- [ ] Added to register endpoint
- [ ] Added to search endpoint(s)
- [ ] Added to prescription endpoint
- [ ] All error messages in Arabic

---

**Ready to go!** Pick your first endpoint and copy the pattern above. 🚀
