# 📋 دوائي (DUAII) - Final Database Schema Guide

**Project**: Medical/Pharmacy App  
**Database**: Supabase (PostgreSQL)  
**Status**: Production-Ready ✅  
**Last Updated**: December 2024  

---

## 🎯 Overview

This document explains the **definitive, clean, single source of truth** database schema for the دوائي application.

**Key Facts**:
- ✅ All 10 core tables defined cleanly
- ✅ No duplicates, overlaps, or conflicts
- ✅ Row Level Security (RLS) on every table
- ✅ Proper foreign keys with cascading deletes
- ✅ Automatic timestamp management
- ✅ Storage buckets properly configured
- ✅ Production-ready PostgreSQL schema
- ✅ Zero deprecated table names or columns

**File**: `schema_final.sql` - Apply this ONCE after full database reset.

---

## 📊 Complete Table Reference

### 1. **`profiles`** (User Accounts)
Extends Supabase `auth.users` with app-specific fields.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, FK to auth.users |
| `full_name` | text | Required |
| `phone` | text | Optional |
| `role` | user_role enum | `user`, `pharmacy`, `admin` |
| `avatar_url` | text | Optional profile picture |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

**Usage**: Every authenticated user has a profile entry. Role determines access level.

**RLS Policies**:
- Users can view/edit only their own profile
- Admin can view all profiles

---

### 2. **`pharmacy_profiles`** (Pharmacy Details)
Extended information for pharmacy accounts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | FK to profiles (role='pharmacy') |
| `pharmacy_name` | text | Required, display name |
| `license_number` | text | Required, unique |
| `address` | text | Required, street address |
| `phone` | text | Optional, pharmacy phone |
| `latitude` | decimal | For map display, nullable |
| `longitude` | decimal | For map display, nullable |
| `working_hours` | jsonb | `{mon: {open: "09:00", close: "21:00"}, ...}` |
| `logo_url` | text | Optional, pharmacy logo |
| `is_verified` | boolean | Admin approval status |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

**Usage**: Pharmacies must have both a `profiles` entry AND a `pharmacy_profiles` entry.

**RLS Policies**:
- Anyone (public) can view pharmacy profiles
- Each pharmacy can only edit their own profile

**Indexes**:
- `is_verified` - Fast filtering of verified pharmacies
- `latitude, longitude` - Geospatial queries

---

### 3. **`prescriptions`** (User Prescriptions)
Prescription uploads from users, waiting for pharmacy responses.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `images_urls` | text[] | Array of storage URLs |
| `notes` | text | Optional user notes |
| `status` | prescription_status | pending → responded → accepted → completed |
| `user_latitude` | decimal | User's location when uploaded |
| `user_longitude` | decimal | User's location when uploaded |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

**Status Lifecycle**:
```
pending → (pharmacies respond)
responded → (user chooses or rejects)
accepted → (user accepted a response)
rejected → (user rejected all)
completed → (fulfilled)
```

**Usage**: Users upload prescription images here. Pharmacies see `pending` prescriptions. Responses link via `prescription_responses` table.

**RLS Policies**:
- Users can view/edit only their own prescriptions
- Pharmacies can view ALL pending prescriptions
- Admin can view all prescriptions

**Indexes**:
- `user_id` - Get user's prescriptions
- `status` - Find pending prescriptions
- `created_at DESC` - Most recent first

---

### 4. **`prescription_responses`** (Pharmacy Responses)
Pharmacy responses to user prescriptions with available medicines and pricing.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `prescription_id` | UUID | FK to prescriptions |
| `pharmacy_id` | UUID | FK to pharmacy_profiles |
| `available_medicines` | jsonb | `{medicine_name: {price: 50, available: true}, ...}` |
| `total_price` | decimal | Total cost |
| `notes` | text | Optional pharmacy notes |
| `estimated_ready_time` | text | e.g., "30 minutes" |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

**Usage**: When a pharmacy sees a pending prescription, they create a response offering available medicines and pricing.

**RLS Policies**:
- Users can view responses to their own prescriptions
- Pharmacies can view/edit only their own responses
- Admin can view all responses

**Indexes**:
- `prescription_id` - Get all responses for a prescription
- `pharmacy_id` - Get responses from a pharmacy

---

### 5. **`user_medicines`** (Medicine Cabinet)
User's personal medicine history and current medications.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `medicine_name` | text | Required |
| `dosage` | text | e.g., "500mg" |
| `frequency` | text | e.g., "Twice daily" |
| `start_date` | date | Optional |
| `end_date` | date | Optional |
| `notes` | text | Optional |
| `reminder_enabled` | boolean | Default false |
| `reminder_times` | jsonb | `["08:00", "20:00"]` |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

**Usage**: Users maintain a personal medicine cabinet showing medicines they take or have taken.

**RLS Policies**:
- Users can view/insert/edit/delete only their own medicines

---

### 6. **`notifications`** (In-App Notifications)
System notifications for all users (prescription responses, subscription approvals, etc.).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `title` | text | Notification title |
| `message` | text | Notification body |
| `type` | text | e.g., 'prescription_response', 'subscription_approved' |
| `read` | boolean | Default false |
| `data` | jsonb | Optional metadata |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

**Usage**: Created by system/admin to notify users of important events.

**RLS Policies**:
- Users can view/mark-read only their own notifications
- Admin can insert notifications

**Indexes**:
- `user_id` - Get user's notifications
- `read` - Filter unread notifications
- `created_at DESC` - Most recent first

---

### 7. **`subscriptions`** (Pharmacy Subscriptions)
Pharmacy subscription management for feature access.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `pharmacy_id` | UUID | FK to pharmacy_profiles |
| `plan_type` | subscription_plan | `monthly` or `yearly` |
| `status` | subscription_status | pending → active → expired/rejected |
| `receipt_url` | text | Storage URL or base64 receipt |
| `start_date` | timestamp | When subscription starts |
| `end_date` | timestamp | When subscription ends |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

**Status Lifecycle**:
```
pending (awaiting admin approval)
→ active (approved, valid subscription)
→ expired (end_date passed) or rejected (admin denied)
```

**Usage**: Pharmacies request subscriptions. Admins approve. Status determines if pharmacy can be visible on maps/searches.

**RLS Policies**:
- Pharmacies can view their own subscriptions
- Admin can view/approve all subscriptions

**Indexes**:
- `pharmacy_id` - Get pharmacy's subscriptions
- `status` - Filter by status
- `end_date` - Find expired subscriptions

---

### 8. **`pharmacy_favorites`** (User Favorites)
Users can mark favorite pharmacies for quick access.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `pharmacy_id` | UUID | FK to pharmacy_profiles |
| `created_at` | timestamp | Auto-set |

**Constraint**: Unique(user_id, pharmacy_id) - User can favorite each pharmacy only once.

**Usage**: Users can favorite pharmacies they prefer.

**RLS Policies**:
- Users can view/insert/delete only their own favorites

---

### 9. **`analytics_events`** (PWA Analytics)
Track user interactions, page views, and feature usage.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `event_type` | varchar(50) | e.g., 'page_view', 'prescription_upload' |
| `user_id` | UUID | FK to profiles, nullable |
| `user_role` | varchar(20) | Role at time of event |
| `page_path` | varchar(255) | URL path |
| `metadata` | jsonb | Event-specific data |
| `timestamp` | timestamp | When event occurred |
| `created_at` | timestamp | Auto-set |

**Usage**: Automatic analytics logging for app behavior analysis.

**RLS Policies**:
- Admin can view all analytics
- Users can insert their own analytics events

**Indexes**:
- `timestamp DESC` - Most recent first
- `user_id` - Filter by user
- `event_type` - Filter by event type

---

### 10. **`push_notification_tokens`** (Push Subscriptions)
Store Web Push API subscription endpoints for sending push notifications.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles, UNIQUE |
| `endpoint` | text | Push service endpoint |
| `auth_key` | text | Authentication key |
| `p256dh_key` | text | Public key for encryption |
| `is_active` | boolean | Default true |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

**Usage**: Store subscription details needed to send Web Push notifications.

**RLS Policies**:
- Users can view/insert/update/delete only their own tokens

---

## 🔐 Enum Types

### `user_role`
```sql
'user'      -- Regular patient
'pharmacy'  -- Pharmacy staff
'admin'     -- System administrator
```

### `prescription_status`
```sql
'pending'    -- Waiting for pharmacy response
'responded'  -- Pharmacy has responded
'accepted'   -- User accepted a response
'rejected'   -- User rejected all responses
'completed'  -- Fulfilled/closed
```

### `subscription_plan`
```sql
'monthly'   -- Monthly subscription
'yearly'    -- Yearly subscription
```

### `subscription_status`
```sql
'pending'    -- Awaiting admin approval
'active'     -- Approved and valid
'expired'    -- Period ended
'rejected'   -- Admin denied
```

---

## 📦 Storage Buckets

### Bucket: `prescriptions`
- **Purpose**: Store prescription images uploaded by users
- **Access**: Private (RLS protected)
- **RLS Policies**:
  - Users can upload to `prescriptions/{user_id}/...`
  - Users can download their own uploads
  - Admin can download any upload

### Bucket: `subscriptions`
- **Purpose**: Store pharmacy subscription receipts
- **Access**: Private (RLS protected)
- **RLS Policies**:
  - Pharmacies can upload to `subscriptions/{pharmacy_id}/...`
  - Pharmacies and admin can download receipts

---

## 🔗 Foreign Key Relationships

```
auth.users
    ↓
profiles (id)
    ├─→ pharmacy_profiles (id) [only if role='pharmacy']
    ├─→ prescriptions (user_id)
    ├─→ user_medicines (user_id)
    ├─→ notifications (user_id)
    ├─→ pharmacy_favorites (user_id)
    ├─→ analytics_events (user_id)
    └─→ push_notification_tokens (user_id)

pharmacy_profiles (id)
    ├─→ prescription_responses (pharmacy_id)
    └─→ subscriptions (pharmacy_id)

prescriptions (id)
    └─→ prescription_responses (prescription_id)
```

---

## 🎯 RLS (Row Level Security) Strategy

**Principle**: Users can only access their own data unless they're admin.

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| `profiles` | Own + Admin | Own | Own | - |
| `pharmacy_profiles` | Public | Own | Own | - |
| `prescriptions` | Own + Pharmacy* + Admin | Own | Own | - |
| `prescription_responses` | Related + Pharmacy + Admin | Pharmacy | Pharmacy | - |
| `user_medicines` | Own | Own | Own | Own |
| `notifications` | Own | Admin | Own | - |
| `subscriptions` | Own + Admin | Own | Admin | - |
| `pharmacy_favorites` | Own | Own | - | Own |
| `analytics_events` | Admin | Own | - | - |
| `push_notification_tokens` | Own | Own | Own | Own |

*Pharmacies can see all pending prescriptions to respond to them.

---

## ⏰ Automatic Timestamps

All tables with `updated_at` have an automatic trigger:

```sql
set_updated_at_timestamp()
```

Applied to:
- `profiles`
- `pharmacy_profiles`
- `prescriptions`
- `prescription_responses`
- `user_medicines`
- `notifications`
- `subscriptions`
- `push_notification_tokens`

Updates the `updated_at` column automatically on every record update.

---

## 📈 Indexes for Performance

Created indexes optimize common queries:

| Table | Indexes |
|-------|---------|
| `profiles` | `role`, `created_at DESC` |
| `pharmacy_profiles` | `is_verified`, `latitude, longitude` |
| `prescriptions` | `user_id`, `status`, `created_at DESC` |
| `prescription_responses` | `prescription_id`, `pharmacy_id`, `created_at DESC` |
| `user_medicines` | `user_id` |
| `notifications` | `user_id`, `read`, `created_at DESC` |
| `subscriptions` | `pharmacy_id`, `status`, `end_date`, `created_at DESC` |
| `pharmacy_favorites` | `user_id`, `pharmacy_id` |
| `analytics_events` | `timestamp DESC`, `user_id`, `event_type` |
| `push_notification_tokens` | `user_id`, `is_active` |

---

## ✅ What's Clean About This Schema

1. **No Duplicates**: Each table defined once
2. **No Overlaps**: Clear separation of concerns
3. **No Conflicts**: RLS policies don't conflict
4. **No Deprecated Names**: Uses correct modern names:
   - ✅ `pharmacy_profiles` (not `pharmacies`)
   - ✅ `user_medicines` (not `medicines`)
   - ✅ `prescriptions.images_urls` (not `image_url`)
5. **No Destructive Ops**: No DROP statements
6. **No Test Data**: Production schema only
7. **Minimal & Correct RLS**: Only necessary policies
8. **Production-Ready**: Follows PostgreSQL best practices

---

## 🚀 Deployment Instructions

### 1. **Reset Database** (if needed)
```bash
# In Supabase Dashboard:
# 1. Go to Project Settings → Database
# 2. Click "Reset database"
# 3. Confirm
# ⚠️ WARNING: This deletes all data!
```

### 2. **Apply Schema**
```bash
# Option A: Using Supabase Dashboard
# 1. Go to SQL Editor
# 2. Paste entire contents of `schema_final.sql`
# 3. Click "Run"

# Option B: Using Supabase CLI
supabase db push --file schema_final.sql
```

### 3. **Verify**
```bash
# Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

# Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

# Check indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public';
```

---

## 🎓 Common Queries

### Get all verified pharmacies with active subscriptions
```sql
SELECT 
  pp.id, pp.pharmacy_name, pp.latitude, pp.longitude,
  s.status, s.end_date
FROM pharmacy_profiles pp
LEFT JOIN subscriptions s ON pp.id = s.pharmacy_id
WHERE pp.is_verified = true 
  AND s.status = 'active'
  AND s.end_date > NOW()
ORDER BY pp.created_at DESC;
```

### Get user's pending prescriptions
```sql
SELECT *
FROM prescriptions
WHERE user_id = auth.uid()
  AND status = 'pending'
ORDER BY created_at DESC;
```

### Get responses to a prescription
```sql
SELECT pr.id, pr.pharmacy_id, pp.pharmacy_name, 
       pr.available_medicines, pr.total_price
FROM prescription_responses pr
JOIN pharmacy_profiles pp ON pr.pharmacy_id = pp.id
WHERE pr.prescription_id = $1
ORDER BY pr.created_at DESC;
```

### Get admin analytics
```sql
SELECT event_type, COUNT(*) as count, 
       COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY event_type
ORDER BY count DESC;
```

---

## 🔄 Migration from Old Schema

If you have existing data from conflicting scripts, here's the mapping:

| Old Table | New Table | Notes |
|-----------|-----------|-------|
| `profiles` | `profiles` | ✅ Keep as-is |
| `pharmacy_profiles` | `pharmacy_profiles` | ✅ Keep as-is |
| `pharmacies` | `pharmacy_profiles` | ❌ Old name, use new |
| `medicines` | `user_medicines` | ❌ Old name, use new |
| `prescriptions` | `prescriptions` | ✅ Keep as-is |
| `prescription_responses` | `prescription_responses` | ✅ Keep as-is |
| `subscriptions` | `subscriptions` | ✅ Keep as-is |

To migrate:
```sql
-- If you had a 'pharmacies' table:
-- Copy data: INSERT INTO pharmacy_profiles SELECT * FROM pharmacies;
-- Delete old: DROP TABLE pharmacies;

-- If you had a 'medicines' table:
-- Copy data: INSERT INTO user_medicines SELECT * FROM medicines;
-- Delete old: DROP TABLE medicines;
```

---

## 📞 Support

**Schema Location**: `schema_final.sql`  
**This Guide**: `SCHEMA_FINAL_GUIDE.md`  
**Status**: ✅ Production-ready, tested, conflict-free  
**Last Updated**: December 2024  

---

**Created for دوائي (DUAII) - Medical/Pharmacy App**
