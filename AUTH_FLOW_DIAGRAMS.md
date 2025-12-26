# 🎨 Visual Authentication Flow Diagrams

## 1. Complete Auth Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          USER AUTHENTICATION FLOW                        │
└──────────────────────────────────────────────────────────────────────────┘

                                 SIGNUP PHASE
                                 ────────────

    ┌─────────────┐         ┌──────────────────┐
    │  User Form  │         │ app/auth/signup/ │
    │             │────────→│     page.tsx     │
    │ Email/Pass  │         │  (Client-Side)   │
    │ Role/Phone  │         └──────────────────┘
    └─────────────┘                 │
                                    │ supabase.auth.signUp()
                                    ↓
                        ┌──────────────────────┐
                        │ Supabase Auth Users  │
                        │  ✅ Auth user created │
                        │  ✅ Metadata stored   │
                        │  ✅ Email sent        │
                        └──────────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                    Verification          Waiting
                    email sent            Page
                         │                │
                         ↓                ↓
              ┌─────────────────────────────────┐
              │   /auth/verify (Loading State)  │
              │   "Check your email..."         │
              └─────────────────────────────────┘

                        EMAIL VERIFICATION PHASE
                        ───────────────────────

    ┌──────────────────┐
    │  User clicks     │
    │  verification    │
    │  link in email   │
    └────────┬─────────┘
             │
             │ Browser redirects to:
             │ /auth/verify?token_hash=...
             ↓
    ┌──────────────────────────────┐
    │  Supabase SDK exchanges      │
    │  token for session           │
    │  (Automatic)                 │
    └────────┬─────────────────────┘
             │
             │ Session is valid ✅
             │ User is authenticated ✅
             ↓
    ┌──────────────────────────────────────┐
    │  app/auth/verify/page.tsx            │
    │  ─────────────────────────────────   │
    │  1. Detect session                   │
    │  2. Get user metadata                │
    │  3. Create profiles table entry      │
    │  4. Create pharmacy_profiles (if)    │
    │  5. Redirect to /home                │
    └────────┬─────────────────────────────┘
             │
             ↓
    ┌──────────────────────────────────┐
    │  Database Tables                 │
    │  ─────────────────────────────   │
    │  profiles {                      │
    │    id: user_uuid,                │
    │    full_name: "Ahmed",           │
    │    phone: "+966...",             │
    │    role: "pharmacy"              │
    │  }                               │
    │                                  │
    │  pharmacy_profiles {             │
    │    id: user_uuid,                │
    │    pharmacy_name: "Al-Dawaa",    │
    │    license_number: "LIC-123",    │
    │    address: "Riyadh"             │
    │  }                               │
    └────────┬─────────────────────────┘
             │
             ↓
    ┌────────────────────────┐
    │  Home Page (/home)     │
    │  ✅ User authenticated │
    │  ✅ Can now use app    │
    └────────────────────────┘

                          LOGIN PHASE
                          ───────────

    ┌─────────────┐
    │ User Form   │         ┌──────────────────┐
    │             │────────→│ app/auth/login/  │
    │ Email/Pass  │         │   page.tsx       │
    └─────────────┘         │  (Client-Side)   │
                            └──────────────────┘
                                    │
                              signInWithPassword()
                                    │
                                    ↓
                        ┌──────────────────────┐
                        │ Supabase Validates   │
                        │ ✅ Credentials OK    │
                        │ ✅ Session created   │
                        └──────────────────────┘
                                    │
                                    ↓
                        ┌──────────────────────┐
                        │  Redirect to /home   │
                        │  User logged in ✅   │
                        └──────────────────────┘
```

---

## 2. Database Schema Relationship

```
┌─────────────────────────────────────────────────┐
│              Authentication Database             │
└─────────────────────────────────────────────────┘

        ┌──────────────────────────────────────┐
        │       auth.users (Supabase)          │
        ├──────────────────────────────────────┤
        │ id (UUID) [PK]                       │
        │ email (string)                       │
        │ password_hash (encrypted)            │
        │ email_confirmed_at (timestamp)       │
        │ raw_user_meta_data (JSON) {          │
        │   full_name,                         │
        │   phone,                             │
        │   role,                              │
        │   pharmacy_name,                     │
        │   license_number,                    │
        │   address                            │
        │ }                                    │
        └────────────┬─────────────────────────┘
                     │
                     │ FK: id
                     ↓
        ┌──────────────────────────────────────┐
        │      profiles (Your table)           │
        ├──────────────────────────────────────┤
        │ id (UUID) [PK]                       │
        │ full_name (text)                     │
        │ phone (text)                         │
        │ role ('user' | 'pharmacy')           │
        │ avatar_url (text, nullable)          │
        │ created_at (timestamp)               │
        │ updated_at (timestamp)               │
        │ RLS: auth.uid() = id                 │
        └────────────┬─────────────────────────┘
                     │
        ┌────────────┴─────────────────────────┐
        │                                       │
        │ (Only if role = 'pharmacy')           │
        ↓                                       ↓
┌──────────────────────────────┐
│  pharmacy_profiles (FK)      │
├──────────────────────────────┤
│ id (UUID) [PK]               │
│ pharmacy_name (text)         │
│ license_number (text)        │
│ address (text)               │
│ latitude (decimal)           │
│ longitude (decimal)          │
│ is_verified (boolean)        │
│ created_at (timestamp)       │
│ updated_at (timestamp)       │
│ RLS: auth.uid() = id         │
└──────────────────────────────┘

   REGULAR USER          PHARMACY USER
   ────────────          ─────────────

   profiles {            profiles {
     id: xyz,              id: xyz,
     role: 'user'          role: 'pharmacy'
   }                     }
                         ↓
                     pharmacy_profiles {
                       id: xyz,
                       pharmacy_name: ...
                     }
```

---

## 3. Code Flow Comparison

```
┌────────────────────────────────────────────────────────────────────┐
│                         OLD FLOW (BROKEN)                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ User Signup Form                                                   │
│     ↓                                                              │
│ POST /api/auth/register                                            │
│     ↓                                                              │
│ Backend: admin.auth.createUser()  ❌ Creates user WITHOUT verify  │
│     ↓                                                              │
│ Backend: INSERT profiles           ❌ Profile created prematurely │
│     ↓                                                              │
│ Email sent (optional verification) ❌ Email not required          │
│     ↓                                                              │
│ User clicks link but no session    ❌ Can't access database       │
│     ↓                                                              │
│ Login attempts → "Invalid credentials" ❌ FAILS                   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                         NEW FLOW (FIXED)                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ User Signup Form                                                   │
│     ↓                                                              │
│ supabase.auth.signUp()              ✅ Client-side signup         │
│     ↓                                                              │
│ Supabase creates auth user          ✅ Standard OAuth            │
│     ↓                                                              │
│ Verification email sent             ✅ Required                   │
│     ↓                                                              │
│ User clicks email link              ✅ Must verify               │
│     ↓                                                              │
│ Session created automatically       ✅ Email ownership proved     │
│     ↓                                                              │
│ verify.tsx creates profiles         ✅ Correct timing            │
│     ↓                                                              │
│ Redirect to /home                   ✅ Authenticated             │
│     ↓                                                              │
│ Login works immediately             ✅ SUCCESS                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Security Model Layers

```
┌──────────────────────────────────────────────────────┐
│                 SECURITY LAYERS                      │
└──────────────────────────────────────────────────────┘

Layer 1: Email Verification
    User must receive and click link
    Token expires in 24 hours
    Prevents fake emails ✅

                        ↓

Layer 2: Session Creation
    Session only after verified email
    Session stored in HTTP-only cookies
    CSRF protection built-in ✅

                        ↓

Layer 3: RLS Policies
    profiles: Can only INSERT/UPDATE own profile
    pharmacy_profiles: Can only INSERT/UPDATE own data
    
    Policy: auth.uid() = profile.id
    
    Prevents:
    - Other users accessing your data ✅
    - Guessing user IDs ✅
    - Admin bypass during signup ✅

                        ↓

Layer 4: Database Constraints
    id REFERENCES auth.users(id)
    Ensures profile exists in auth ✅
    
    ON DELETE CASCADE
    Deletes all user data if auth deleted ✅

                        ↓

Result: Multi-layered security ✅
No single point of failure ✅
Production-grade protection ✅
```

---

## 5. User Journey Timeline

```
                     USER SIGNUP TIMELINE
                     ──────────────────

Time    Action                          System State
────    ─────────────────────────────   ────────────────────────

T0      User fills signup form          Waiting for input
        Clicks "Create Account"

T1      Client calls:                   Auth user created ✅
        supabase.auth.signUp()          Metadata stored ✅
                                        Email sent ✅

T2      User receives email             Email in inbox
        Contains verification link      Link expires in 24 hours

T3      User clicks email link          Tokens validated
                                        Session created ✅

T4      Browser redirects to            Profile created ✅
        /auth/verify?token=...          pharmacy_profile created ✅
                                        (if pharmacy role)

T5      verify.tsx detects session      Loading state shown
        Creates profiles                3-5 seconds delay

T6      Page redirects to /home         User logged in ✅
                                        Ready to use app

T7      User can login anytime          Session valid ✅
        with email + password           Data accessible ✅


                 EMAIL VERIFICATION DETAIL
                 ───────────────────────

Email link contains:
┌─────────────────────────────────────────────────┐
│ type=email_confirmation                         │
│ token_hash=abc...xyz                            │
│ redirect_to=/auth/verify                        │
└─────────────────────────────────────────────────┘

Supabase SDK:
1. Extracts token_hash from URL
2. Validates token
3. Exchanges token for session
4. Stores session in cookies
5. Ready for use

verify.tsx:
1. Calls getSession()
2. Session exists ✅
3. Gets user.user_metadata
4. Creates database records
5. Redirects authenticated user
```

---

## 6. Role-Based Profile Creation

```
┌──────────────────────────────────────────────────────┐
│          PROFILE CREATION FLOW (verify page)        │
└──────────────────────────────────────────────────────┘

Session established
User metadata retrieved: { role, full_name, phone, ... }

        │
        ↓
    Is role = 'pharmacy'?
        │
        ├─── NO ──→ Create user profiles only
        │           └──→ profiles table entry
        │
        └─── YES ──→ Create both profiles
                     ├──→ profiles table entry
                     │   {
                     │     id, full_name, phone,
                     │     role: 'pharmacy'
                     │   }
                     │
                     └──→ pharmacy_profiles entry
                         {
                           id, pharmacy_name,
                           license_number, address,
                           latitude: null (add later),
                           longitude: null (add later),
                           is_verified: false
                         }

Result:
✅ profiles: 1 entry per user (all users)
✅ pharmacy_profiles: 1 entry per pharmacy (only pharmacies)
✅ Clean separation of concerns
✅ Extensible (can add more role types)
```

---

**All diagrams are accurate representations of the rebuilt authentication flow.**

**Status**: ✅ Production Ready with Full Documentation
