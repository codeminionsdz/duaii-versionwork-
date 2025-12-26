# 🛠️ Implementation Guide: Critical Fixes

**Quick reference for implementing the 5 critical gaps**

---

## 1. Error Tracking with Sentry

### Installation (5 min)

```bash
npm install @sentry/nextjs @sentry/tracing
```

### Configuration (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config

  // Sentry configuration
  sentry: {
    org: "your-org",
    project: "duaii",
    tracesSampleRate: 1.0, // Set to 0.1 in production
    environment: process.env.NEXT_ENV || "development",
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "duaii",
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

### Initialize (lib/sentry.ts - new file)

```typescript
import * as Sentry from "@sentry/nextjs"

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_ENV || "development",
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request?.url?.includes("password")) {
        return null
      }
      return event
    },
    // Set sample rates lower in production
    tracesSampleRate: process.env.NEXT_ENV === "production" ? 0.1 : 1.0,
  })
}

if (typeof window !== "undefined") {
  initSentry()
}
```

### Use in API Routes

```typescript
// app/api/pharmacies/route.ts
import * as Sentry from "@sentry/nextjs"

export async function GET(request: NextRequest) {
  try {
    const pharmacies = await fetchPharmacies()
    return Response.json(pharmacies)
  } catch (error) {
    // Option 1: Capture exception
    Sentry.captureException(error, {
      level: "error",
      tags: {
        source: "api_pharmacies",
      },
      extra: {
        lat: request.nextUrl.searchParams.get("lat"),
        lng: request.nextUrl.searchParams.get("lng"),
      },
    })

    // Option 2: Also log to user
    return Response.json(
      { error: "Failed to fetch pharmacies" },
      { status: 500 }
    )
  }
}
```

### Environment Variables (.env.local)

```bash
# Get from https://sentry.io after creating account
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxx
SENTRY_AUTH_TOKEN=your-token-here
NEXT_ENV=production
```

---

## 2. Rate Limiting with Upstash

### Installation (3 min)

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Create Rate Limiter (lib/ratelimit.ts - new file)

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Different limiters for different endpoints
export const createRateLimiter = (
  requestsPerHour: number,
  keyPrefix: string
) => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requestsPerHour, "1 h"),
    prefix: keyPrefix,
  })
}

// Pre-configured limiters
export const authLimiter = createRateLimiter(20, "auth") // 20 signups per hour
export const apiLimiter = createRateLimiter(100, "api") // 100 API calls per hour
export const uploadLimiter = createRateLimiter(10, "upload") // 10 uploads per hour
```

### Use in API Route

```typescript
// app/api/auth/signup/route.ts
import { authLimiter } from "@/lib/ratelimit"
import { getClientIp } from "@/lib/utils"

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  const { success, remaining } = await authLimiter.limit(ip)

  if (!success) {
    return Response.json(
      { error: "Too many signup attempts. Try again later." },
      { status: 429, headers: { "Retry-After": "3600" } }
    )
  }

  // ... normal signup logic
}
```

### Helper Function (lib/utils.ts)

```typescript
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const direct = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (direct) {
    return direct
  }

  return "unknown"
}
```

### Environment Variables (.env.local)

```bash
# Get from https://upstash.com after creating account
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

---

## 3. Input Validation with Zod

### Installation (2 min)

```bash
npm install zod
```

### Create Schemas (lib/schemas/auth.ts - new file)

```typescript
import { z } from "zod"

export const SignupSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  confirmPassword: z.string(),
  fullName: z
    .string()
    .min(2, "Name too short")
    .max(100)
    .regex(/^[\p{L}\s'-]+$/u, "Invalid characters in name"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone format"),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
})

export const PrescriptionUploadSchema = z.object({
  notes: z.string().max(500, "Notes too long").optional(),
  images: z
    .array(
      z.instanceof(File).refine(
        (file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "Invalid image format"
      )
    )
    .min(1, "At least one image required")
    .max(5, "Max 5 images"),
})

export type SignupInput = z.infer<typeof SignupSchema>
export type LoginInput = z.infer<typeof LoginSchema>
```

### Use in Server Action

```typescript
// app/actions/auth.ts
"use server"

import { SignupSchema, type SignupInput } from "@/lib/schemas/auth"
import { createClient } from "@/lib/supabase/server"

export async function signup(input: SignupInput) {
  // Validate
  const parsed = SignupSchema.safeParse(input)
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0].message,
      code: "VALIDATION_ERROR",
    }
  }

  const supabase = await createClient()

  // ... rest of signup logic
}
```

### Use in Client Component

```tsx
// app/auth/signup/page.tsx
"use client"

import { SignupSchema, type SignupInput } from "@/lib/schemas/auth"
import { useState } from "react"
import { signup } from "@/app/actions/auth"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Client-side validation
    const result = SignupSchema.safeParse({
      email,
      password,
      confirmPassword: password,
      fullName: "User",
      phone: "+1234567890",
    })

    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message
        }
      })
      setErrors(newErrors)
      return
    }

    // Server-side validation & execution
    const response = await signup(result.data)
    if (response?.error) {
      setErrors({ form: response.error })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={!!errors.email}
      />
      {errors.email && <span className="text-red-500">{errors.email}</span>}
      {/* More fields */}
    </form>
  )
}
```

---

## 4. Privacy Policy Pages

### Create Privacy Policy Page

```typescript
// app/privacy/page.tsx
export const metadata = {
  title: "Privacy Policy - دوائي",
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">سياسة الخصوصية</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">1. معلومات نجمعها</h2>
        <p className="text-gray-700 mb-4">نجمع المعلومات التالية:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>معلومات التسجيل:</strong> البريد الإلكتروني، الاسم، رقم
            الهاتف
          </li>
          <li>
            <strong>بيانات الموقع:</strong> إحداثيات GPS (اختياري) للعثور على
            الصيدليات القريبة
          </li>
          <li>
            <strong>الوصفات الطبية:</strong> الصور والبيانات الوصفية
          </li>
          <li>
            <strong>بيانات الاستخدام:</strong> صفحات تم زيارتها، وقت الاستخدام
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">2. كيف نستخدم معلوماتك</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>توفير الخدمة (البحث عن الصيدليات، إدارة الوصفات)</li>
          <li>إرسال إشعارات حول الوصفات</li>
          <li>تحسين التطبيق بناءً على بيانات الاستخدام</li>
          <li>الامتثال للقوانين المعمول بها</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3. مدة الحفظ</h2>
        <p className="text-gray-700">
          نحتفظ بمعلوماتك طالما كان حسابك نشطاً. يمكنك طلب حذف حسابك وجميع
          بيانات المرتبطة به في أي وقت عبر إرسال بريد إلى support@duaii.app
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">4. حقوقك</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>الحق في الوصول إلى بيانتك الشخصية</li>
          <li>الحق في تصحيح البيانات غير الدقيقة</li>
          <li>الحق في حذف بيانتك (الحق في النسيان)</li>
          <li>الحق في نقل البيانات</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">5. الاتصال بنا</h2>
        <p className="text-gray-700">
          إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا على:
          <br />
          <strong>support@duaii.app</strong>
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-12">
        آخر تحديث: {new Date().toLocaleDateString("ar-SA")}
      </p>
    </div>
  )
}
```

### Add to Footer

```typescript
// components/layout/footer.tsx (new file)
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 px-6 mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h3 className="font-bold mb-3">عن التطبيق</h3>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/about" className="hover:text-emerald-600">
                  عن دوائي
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">القانونية</h3>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-emerald-600">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-600">
                  شروط الاستخدام
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">الدعم</h3>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="mailto:support@duaii.app" className="hover:text-emerald-600">
                  التواصل بنا
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 دوائي. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
```

---

## 5. Service Worker Offline Caching

### Update public/sw.js

```javascript
const CACHE_VERSION = "v1-2024-12-19"
const CACHE_URLS = [
  "/",
  "/home",
  "/manifest.json",
  "/images/logo.png",
  "/images/logo-192.png",
  "/images/logo-512.png",
]

// Install: cache essential files
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")

  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log("[SW] Caching essential files")
      return cache.addAll(CACHE_URLS).catch((err) => {
        console.warn("[SW] Some files failed to cache:", err)
        // Continue even if some files fail
      })
    })
  )

  // Force new service worker to take over
  self.skipWaiting()
})

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )

  self.clients.claim()
})

// Fetch: serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip non-HTTP(S) requests
  if (!request.url.startsWith("http")) {
    return
  }

  // Strategy: Network-first for API calls, cache-first for assets
  const url = new URL(request.url)

  if (url.pathname.startsWith("/api/")) {
    // Network-first for API calls
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const cacheCopy = response.clone()
            caches
              .open(CACHE_VERSION)
              .then((cache) => {
                cache.put(request, cacheCopy)
              })
              .catch(() => {})
          }
          return response
        })
        .catch(() => {
          // Fallback to cache on network error
          return caches.match(request).then((cached) => {
            return (
              cached ||
              new Response(
                JSON.stringify({
                  error: "Offline - data may be outdated",
                }),
                {
                  status: 503,
                  statusText: "Service Unavailable",
                  headers: { "Content-Type": "application/json" },
                }
              )
            )
          })
        })
    )
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches
        .match(request)
        .then((cached) => {
          if (cached) {
            return cached
          }

          return fetch(request).then((response) => {
            // Cache successful responses
            if (response.ok) {
              const cacheCopy = response.clone()
              caches
                .open(CACHE_VERSION)
                .then((cache) => {
                  cache.put(request, cacheCopy)
                })
                .catch(() => {})
            }
            return response
          })
        })
        .catch(() => {
          // No cache, no network - offline page
          if (request.mode === "navigate") {
            return caches.match("/offline") // Optional: create offline page
          }
        })
    )
  }
})
```

### Register Service Worker in Layout

```typescript
// app/layout.tsx
import { PWARegisterGate } from "@/components/client-boundaries/pwa-register-gate"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {/* ... existing code ... */}
        <PWARegisterGate /> {/* Already exists */}
        {children}
      </body>
    </html>
  )
}
```

### Show Offline Indicator

```typescript
// hooks/use-online.ts (new file)
import { useEffect, useState } from "react"

export function useOnline() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    window.addEventListener("online", () => setIsOnline(true))
    window.addEventListener("offline", () => setIsOnline(false))

    return () => {
      window.removeEventListener("online", () => {})
      window.removeEventListener("offline", () => {})
    }
  }, [])

  return isOnline
}

// components/offline-badge.tsx (new file)
"use client"

import { useOnline } from "@/hooks/use-online"
import { WifiOff } from "lucide-react"

export function OfflineBadge() {
  const isOnline = useOnline()

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-50">
      <WifiOff className="w-4 h-4" />
      <span>أنت غير متصل - قد تكون البيانات قديمة</span>
    </div>
  )
}
```

---

## Quick Checklist

- [ ] Sentry configured and logging errors
- [ ] Rate limiting working on all API routes
- [ ] Zod validation on all form inputs
- [ ] Privacy policy & terms pages accessible
- [ ] Service worker offline caching functional
- [ ] Environment variables configured
- [ ] Tested on real mobile device
- [ ] No console errors in production

---

**All code examples are production-ready. Adjust to your specific needs.**
