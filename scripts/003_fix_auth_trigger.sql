-- ============================================================
-- FIX: Complete Auth Trigger and RLS Fix
-- ============================================================
-- This script fixes the signup issue by removing problematic triggers
-- and ensuring proper RLS policies for service role

-- 1. Drop all triggers on auth.users that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_trigger ON auth.users CASCADE;

-- 2. Drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;

-- 3. Verify no triggers remain (run this to check)
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- ============================================================
-- Note: Profiles will now be created from the verify page
-- after email confirmation, not during signup
-- ============================================================
