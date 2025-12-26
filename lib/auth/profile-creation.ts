/**
 * Profile creation utilities for post-verification flow
 * 
 * This module handles creating user profiles ONLY after email verification
 * is complete and a valid session exists. Never create profiles during signup.
 */

import { SupabaseClient } from "@supabase/supabase-js"

export interface CreateProfileData {
  full_name: string
  phone: string | null
  role: "user" | "pharmacy"
}

export interface CreatePharmacyProfileData {
  pharmacy_name: string
  license_number: string
  address: string
  latitude?: number | null
  longitude?: number | null
}

/**
 * Create common user profile after email verification
 * 
 * ✅ Only call this AFTER user has verified their email
 * ✅ User must have valid session with auth.uid()
 * ❌ Never call during signup
 * 
 * Note: The trigger handle_new_user() might also create this,
 * but we include explicit creation here for safety.
 */
export async function createUserProfile(
  supabase: SupabaseClient,
  userId: string,
  data: CreateProfileData
) {
  // Upsert to avoid duplicate key errors and ensure id uniqueness
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: data.full_name || "مستخدم جديد",
        phone: data.phone || null,
        role: data.role || "user",
      },
      { onConflict: "id", ignoreDuplicates: true }
    )

  if (error) {
    console.error("❌ Profile creation failed:", error)
    throw error
  }

  return { success: true, skipped: false }
}

/**
 * Create pharmacy profile after user profile is created
 * 
 * ✅ Only call this AFTER createUserProfile succeeds
 * ✅ User must have valid session
 * ❌ Never call during signup
 */
export async function createPharmacyProfile(
  supabase: SupabaseClient,
  userId: string,
  data: CreatePharmacyProfileData
) {
  // Upsert to avoid duplicate key errors
  const { error } = await supabase
    .from("pharmacy_profiles")
    .upsert(
      {
        id: userId,
        pharmacy_name: data.pharmacy_name || "صيدليتي",
        license_number: data.license_number || `LICENSE_${userId.slice(0, 8)}`,
        address: data.address || "",
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        is_verified: false,
      },
      { onConflict: "id", ignoreDuplicates: true }
    )

  if (error) {
    console.error("❌ Pharmacy profile creation failed:", error)
    throw error
  }

  return { success: true, skipped: false }
}

/**
 * Complete signup flow after email verification
 * 
 * This creates both profile and pharmacy_profile if needed.
 * Call this in the verify page after session is established.
 * 
 * Why this is safe:
 * - Only called AFTER email verification via Supabase auth
 * - User has valid session (can't be bypassed)
 * - Profiles table has RLS: can only insert own profile
 * - pharmacy_profiles table has RLS: can only insert own profile
 */
export async function completeSignupAfterVerification(
  supabase: SupabaseClient,
  userId: string,
  metadata: {
    full_name?: string
    phone?: string | null
    role?: "user" | "pharmacy"
    pharmacy_name?: string
    license_number?: string
    address?: string
  }
) {
  try {
    // 1. Create base profile
    await createUserProfile(supabase, userId, {
      full_name: metadata.full_name || "مستخدم جديد",
      phone: metadata.phone || null,
      role: (metadata.role as "user" | "pharmacy") || "user",
    })

    // 2. If pharmacy, create pharmacy profile
    if (metadata.role === "pharmacy") {
      await createPharmacyProfile(supabase, userId, {
        pharmacy_name: metadata.pharmacy_name || metadata.full_name || "صيدليتي",
        license_number: metadata.license_number || "",
        address: metadata.address || "",
        latitude: null,
        longitude: null,
      })
    }

    return { success: true, role: metadata.role }
  } catch (error) {
    console.error("❌ Signup completion failed:", error)
    throw error
  }
}
