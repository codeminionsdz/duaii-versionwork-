# Next.js Server/Client Component Boundaries - Architecture

## Overview

This document explains the strict Server/Client Component boundary architecture implemented in the application to comply with Next.js App Router requirements.

## Problem Solved

**Error:** `"Unsupported Server Component type: undefined"`

**Root Cause:** Client Components (using React hooks like `useState`, `useEffect`, `localStorage`) were being imported directly into Server Components (like `layout.tsx`), violating Next.js Server/Client Component boundaries.

## Architecture

### Server Component (layout.tsx)
- **Type:** Server Component (no `"use client"` directive)
- **Role:** Handles metadata, static layout structure, and server-side data fetching
- **Responsibility:** Import and render ONLY Client Boundary Wrappers (not direct client components)

### Client Boundary Wrappers
**Location:** `components/client-boundaries/`

These are explicit client boundaries marked with `"use client"` that wrap client-side components:

1. **OnboardingGate** (`onboarding-gate.tsx`)
   - Wraps: `Onboarding` component
   - Purpose: Client-side onboarding flow with hooks
   - Uses: `useOnboarding()`, `useWelcome()`, `localStorage`

2. **WelcomeScreenGate** (`welcome-screen-gate.tsx`)
   - Wraps: `WelcomeScreen` component
   - Purpose: Initial welcome screen with animations
   - Uses: `useWelcome()`, `useRouter()`, `localStorage`

3. **PermissionsRequestGate** (`permissions-request-gate.tsx`)
   - Wraps: `PermissionsRequest` component
   - Purpose: Handle location and notification permissions
   - Uses: `useState()`, `localStorage`, Capacitor APIs

4. **PWARegisterGate** (`pwa-register-gate.tsx`)
   - Wraps: `PWARegister` component
   - Purpose: PWA service worker registration
   - Uses: `usePWARegistration()` hook

### Client Components (Actual Implementation)
**Location:** `components/`

Each client component has `"use client"` directive at the top:

- `components/onboarding.tsx` - `OnboardingView` component
- `components/onboarding/index.tsx` - `Onboarding` wrapper
- `components/welcome-screen.tsx` - `WelcomeScreen` component
- `components/permissions-request.tsx` - `PermissionsRequest` component
- `components/pwa-register.tsx` - `PWARegister` component

## Component Tree

```
RootLayout (Server Component)
├── ThemeProvider
├── WelcomeScreenGate (Client Boundary)
│   └── WelcomeScreen (Client Component with hooks)
├── PermissionsRequestGate (Client Boundary)
│   └── PermissionsRequest (Client Component with hooks)
├── OnboardingGate (Client Boundary)
│   └── Onboarding (Client Component wrapper)
│       └── OnboardingView (Client Component with hooks)
├── PWARegisterGate (Client Boundary)
│   └── PWARegister (Client Component with hooks)
├── {children} (Page Component)
└── Toaster (Client Component UI)
```

## Usage Pattern

### In Server Component (layout.tsx)

```tsx
// ✅ CORRECT: Import and use Client Boundary Wrappers
import { OnboardingGate } from '@/components/client-boundaries/onboarding-gate'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <OnboardingGate />  {/* Explicit client boundary */}
        {children}
      </body>
    </html>
  )
}
```

### In Client Component (onboarding-gate.tsx)

```tsx
// ✅ CORRECT: "use client" directive at the top
'use client'

import { Onboarding } from '@/components/onboarding'

export function OnboardingGate() {
  return <Onboarding />  {/* Can now use hooks */}
}
```

### What NOT to Do

```tsx
// ❌ WRONG: Direct import of client component into server component
import { WelcomeScreen } from '@/components/welcome-screen'

export default function RootLayout({ children }) {
  return <WelcomeScreen />  // Error: undefined component
}
```

## Benefits of This Architecture

1. **Explicit Boundaries:** Clear separation between server and client zones
2. **Type Safety:** TypeScript can validate component boundaries
3. **Performance:** Server-only rendering where possible, client-side only when needed
4. **Maintainability:** Easy to understand which components use hooks and state
5. **Standards Compliance:** Follows official Next.js best practices
6. **Hydration Safety:** Prevents hydration mismatches by explicit boundary declaration

## Files Modified

- `app/layout.tsx` - Updated to use Client Boundary Wrappers
- `components/client-boundaries/onboarding-gate.tsx` - Created
- `components/client-boundaries/welcome-screen-gate.tsx` - Created
- `components/client-boundaries/permissions-request-gate.tsx` - Created
- `components/client-boundaries/pwa-register-gate.tsx` - Created

## Verification Checklist

- [x] All client components have `"use client"` directive
- [x] All Client Boundary Wrappers have `"use client"` directive
- [x] Layout imports ONLY Client Boundary Wrappers, not direct client components
- [x] No hooks (useState, useEffect, localStorage) in Server Components
- [x] Clear component tree hierarchy maintained
- [x] No circular dependencies

## Related Documentation

- [Next.js Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-and-client-components)
- [Client Component best practices](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
