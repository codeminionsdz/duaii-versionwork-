/**
 * EXAMPLE 1: Rate Limiting in Server Actions (Authentication)
 * 
 * Add this to your existing login action in app/actions/auth.ts or similar
 */

"use server"

import { createClient } from "@/lib/supabase/server"
import { getClientIP, rateLimitAction, RATE_LIMIT_CONFIG } from "@/lib/rate-limit"

export async function loginAction(email: string, password: string) {
  // 🔒 Rate limit by IP (5 attempts per minute)
  const clientIP = getClientIP()
  try {
    await rateLimitAction(clientIP, RATE_LIMIT_CONFIG.auth)
  } catch (error: any) {
    if (error.code === "RATE_LIMIT_EXCEEDED") {
      // Return user-friendly error
      return {
        success: false,
        error: error.message, // Arabic error message
      }
    }
    throw error
  }

  // ✅ Rate limit passed, proceed with authentication
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * EXAMPLE 2: Rate Limiting in Server Actions (Search)
 * 
 * Add this to your existing search action like pharmacies-nearby.ts
 */

export async function searchPharmaciesAction(
  latitude: number,
  longitude: number,
  maxDistance: number = 50
) {
  // 🔒 Rate limit by IP (30 requests per minute for searches)
  const clientIP = getClientIP()
  try {
    await rateLimitAction(clientIP, RATE_LIMIT_CONFIG.search)
  } catch (error: any) {
    if (error.code === "RATE_LIMIT_EXCEEDED") {
      return {
        success: false,
        error: error.message,
      }
    }
    throw error
  }

  // ✅ Rate limit passed, proceed with search
  const supabase = await createClient()

  try {
    const { data: pharmacies, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "pharmacy")
      .eq("is_active", true)

    if (error) throw error

    // Filter by distance (your existing logic)
    const nearbyPharmacies = pharmacies.filter((p) => {
      // Distance calculation logic here
      return true
    })

    return {
      success: true,
      data: nearbyPharmacies,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * EXAMPLE 3: Rate Limiting in Server Actions (Prescription Upload)
 * 
 * Add this to your existing prescription action like prescriptions.ts
 */

export async function uploadPrescriptionAction(
  prescriptionData: any
) {
  // 🔒 Rate limit by IP (10 requests per minute for sensitive operations)
  const clientIP = getClientIP()
  try {
    await rateLimitAction(clientIP, RATE_LIMIT_CONFIG.prescription)
  } catch (error: any) {
    if (error.code === "RATE_LIMIT_EXCEEDED") {
      return {
        success: false,
        error: error.message,
      }
    }
    throw error
  }

  // ✅ Rate limit passed, proceed with upload
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .insert(prescriptionData)

    if (error) throw error

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}
