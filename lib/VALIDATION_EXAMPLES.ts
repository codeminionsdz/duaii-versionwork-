/**
 * VALIDATION EXAMPLES - Server Actions
 * Shows how to use Zod schemas in Server Actions with proper error handling
 *
 * Pattern:
 * 1. Import schema
 * 2. Validate with .safeParse()
 * 3. Return error if invalid
 * 4. Proceed with authenticated operation
 */

"use server"

import { createClient } from "@/lib/supabase/server"
import {
  loginSchema,
  registerSchema,
  medicineSearchSchema,
  prescriptionSubmissionSchema,
  getFirstErrorMessage,
  formatValidationError,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validation"

// ============================================================================
// EXAMPLE 1: Login Action with Validation
// ============================================================================

/**
 * Server Action for user login
 * - Validates email and password format
 * - Returns early if validation fails
 * - Proceeds with Supabase authentication if valid
 */
export async function loginAction(formData: unknown) {
  // 🔒 VALIDATION STEP 1: Parse and validate input
  const validationResult = loginSchema.safeParse(formData)

  // ❌ Return error if validation fails
  if (!validationResult.success) {
    return {
      success: false,
      error: getFirstErrorMessage(validationResult.error.issues),
    }
  }

  // ✅ Valid data - destructure for use
  const { email, password } = validationResult.data

  // Proceed with authentication
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: "بيانات تسجيل الدخول غير صحيحة",
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (err: any) {
    return {
      success: false,
      error: "خطأ في عملية تسجيل الدخول. حاول مجدداً.",
    }
  }
}

// ============================================================================
// EXAMPLE 2: Register Action with Validation
// ============================================================================

/**
 * Server Action for user registration
 * - Validates email format, password strength, password match
 * - Validates account role (user vs pharmacy)
 * - Returns early with Arabic error message if validation fails
 */
export async function registerAction(formData: unknown) {
  // 🔒 VALIDATION: Parse and validate input
  const validationResult = registerSchema.safeParse(formData)

  // ❌ Return error if validation fails (with all field errors)
  if (!validationResult.success) {
    const formatted = formatValidationError(validationResult)
    return {
      success: false,
      error: formatted.error,
      // Optional: Include all field-specific errors
      // issues: formatted.issues,
    }
  }

  // ✅ Valid data
  const {
    email,
    password,
    role,
    fullName,
    phone,
  } = validationResult.data

  const supabase = await createClient()

  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return {
        success: false,
        error: "البريد الإلكتروني مسجل بالفعل أو حدث خطأ. حاول مجدداً.",
      }
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone,
        role,
        is_active: true,
        created_at: new Date(),
      })

      if (profileError) {
        return {
          success: false,
          error: "خطأ في إنشاء الملف الشخصي. حاول مجدداً.",
        }
      }
    }

    return {
      success: true,
      user: authData.user,
      message: "تم التسجيل بنجاح. تحقق من بريدك الإلكتروني.",
    }
  } catch (err: any) {
    return {
      success: false,
      error: "خطأ في عملية التسجيل. حاول مجدداً.",
    }
  }
}

// ============================================================================
// EXAMPLE 3: Medicine Search with Validation
// ============================================================================

/**
 * Server Action for medicine search
 * - Validates search query (1-100 characters)
 * - Validates limit parameter (1-100 results)
 * - Returns early if validation fails
 */
export async function searchMedicinesAction(formData: unknown) {
  // 🔒 VALIDATION
  const validationResult = medicineSearchSchema.safeParse(formData)

  // ❌ Return error if validation fails
  if (!validationResult.success) {
    return {
      success: false,
      error: getFirstErrorMessage(validationResult.error.issues),
      results: [],
    }
  }

  // ✅ Valid data
  const { query, limit } = validationResult.data

  const supabase = await createClient()

  try {
    // Search medicines (example - adjust to your actual query)
    const { data: medicines, error } = await supabase
      .from("medicines")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      results: medicines || [],
      count: medicines?.length || 0,
    }
  } catch (err: any) {
    return {
      success: false,
      error: "خطأ في البحث. حاول مجدداً.",
      results: [],
    }
  }
}

// ============================================================================
// EXAMPLE 4: Prescription Submission with Validation
// ============================================================================

/**
 * Server Action for prescription submission
 * - Validates medicine names (required)
 * - Validates notes length (optional, max 1000 chars)
 * - Validates file IDs format (optional, max 5 files)
 * - Validates target pharmacy ID format (optional)
 * - Returns early if validation fails
 */
export async function submitPrescriptionAction(formData: unknown) {
  // 🔒 VALIDATION
  const validationResult = prescriptionSubmissionSchema.safeParse(formData)

  // ❌ Return error if validation fails
  if (!validationResult.success) {
    return {
      success: false,
      error: getFirstErrorMessage(validationResult.error.issues),
    }
  }

  // ✅ Valid data
  const {
    medicineNames,
    notes,
    prescriptionImageIds,
    targetPharmacyId,
    patientNotes,
  } = validationResult.data

  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "يجب تسجيل الدخول أولاً",
      }
    }

    // Create prescription record
    const { data: prescription, error: prescriptionError } = await supabase
      .from("prescriptions")
      .insert({
        user_id: user.id,
        medicine_names: medicineNames,
        notes,
        image_ids: prescriptionImageIds,
        status: "pending",
        created_at: new Date(),
      })
      .select()
      .single()

    if (prescriptionError) {
      return {
        success: false,
        error: "خطأ في حفظ الوصفة. حاول مجدداً.",
      }
    }

    // If target pharmacy specified, create request
    if (targetPharmacyId && prescription) {
      await supabase.from("prescription_requests").insert({
        prescription_id: prescription.id,
        pharmacy_id: targetPharmacyId,
        patient_notes: patientNotes,
        status: "pending",
      })
    }

    return {
      success: true,
      prescriptionId: prescription.id,
      message: "تم رفع الوصفة بنجاح",
    }
  } catch (err: any) {
    return {
      success: false,
      error: "خطأ في عملية رفع الوصفة. حاول مجدداً.",
    }
  }
}

// ============================================================================
// USAGE NOTES
// ============================================================================
/**
 * How to use these examples:
 *
 * 1. IMPORT IN YOUR ACTION FILE:
 *    import { loginSchema } from "@/lib/validation"
 *
 * 2. CALL FROM CLIENT (e.g., in a form submit handler):
 *    const result = await loginAction(formData)
 *    if (!result.success) {
 *      toast.error(result.error)
 *    }
 *
 * 3. VALIDATION PATTERN (same for all schemas):
 *    const validationResult = schema.safeParse(input)
 *    if (!validationResult.success) {
 *      return { error: getFirstErrorMessage(...) }
 *    }
 *    const validData = validationResult.data
 *    // Proceed with operation
 *
 * 4. ERROR HANDLING:
 *    - Returns { success: false, error: "Arabic message" }
 *    - Always provide a user-friendly message
 *    - Never expose technical details
 *
 * 5. BENEFITS:
 *    ✅ Type-safe: Result.data is fully typed
 *    ✅ Safe: No invalid data reaches your logic
 *    ✅ Consistent: All validations follow same pattern
 *    ✅ Localized: All errors in Arabic
 */
