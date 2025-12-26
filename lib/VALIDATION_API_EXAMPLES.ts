/**
 * VALIDATION EXAMPLES - API Routes
 * Shows how to use Zod schemas in Next.js API routes
 *
 * Pattern:
 * 1. Parse request body with JSON
 * 2. Validate with schema.safeParse()
 * 3. Return 400 Bad Request if invalid
 * 4. Proceed with operation if valid
 *
 * NOTE: These are examples. Create separate files in your app/api directory
 * for actual route handlers.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  loginSchema,
  medicineSearchSchema,
  prescriptionSubmissionSchema,
  getFirstErrorMessage,
} from "@/lib/validation"
import { createClient } from "@/lib/supabase/server"

// ============================================================================
// EXAMPLE 1: Login API Route with Validation
// ============================================================================
/**
 * EXAMPLE - NOT A REAL ROUTE
 * To use: Create app/api/auth/login/route.ts with this code
 *
 * POST /api/auth/login
 * Validates email and password, returns auth token
 */
export async function exampleLoginRoute(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // 🔒 VALIDATION
    const validationResult = loginSchema.safeParse(body)

    // ❌ Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: getFirstErrorMessage(validationResult.error.issues),
        },
        { status: 400 }
      )
    }

    // ✅ Valid data
    const { email, password } = validationResult.data

    const supabase = await createClient()

    // Authenticate user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: "بيانات تسجيل الدخول غير صحيحة" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: "خطأ في المعالجة. حاول مجدداً." },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXAMPLE 2: Medicine Search API Route with Validation
// ============================================================================
/**
 * EXAMPLE - NOT A REAL ROUTE
 * To use: Create app/api/medicines/search/route.ts with this code
 *
 * GET /api/medicines/search?query=aspirin&limit=20
 * Validates search parameters and returns matching medicines
 */
export async function exampleMedicineSearchRoute(request: NextRequest) {
  try {
    // Extract search params
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")
    const limit = searchParams.get("limit")

    // 🔒 VALIDATION - Prepare data for validation
    const validationData = {
      query: query || "",
      limit: limit ? parseInt(limit, 10) : 50,
    }

    const validationResult = medicineSearchSchema.safeParse(validationData)

    // ❌ Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: getFirstErrorMessage(validationResult.error.issues),
        },
        { status: 400 }
      )
    }

    // ✅ Valid data
    const { query: searchQuery, limit: resultLimit } = validationResult.data

    const supabase = await createClient()

    // Search medicines
    const { data: medicines, error } = await supabase
      .from("medicines")
      .select("*")
      .ilike("name", `%${searchQuery}%`)
      .limit(resultLimit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      results: medicines || [],
      count: medicines?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: "خطأ في البحث. حاول مجدداً." },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXAMPLE 3: Prescription Submission API Route with Validation
// ============================================================================
/**
 * EXAMPLE - NOT A REAL ROUTE
 * To use: Create app/api/prescriptions/submit/route.ts with this code
 *
 * POST /api/prescriptions/submit
 * Validates prescription data and stores it
 * Request body example:
 * {
 *   "medicineNames": "Aspirin 500mg",
 *   "notes": "خذ حبة واحدة مرتين يومياً",
 *   "prescriptionImageIds": ["bucket/path/image.jpg"],
 *   "targetPharmacyId": "uuid-here",
 *   "patientNotes": "طلب سريع"
 * }
 */
export async function examplePrescriptionSubmitRoute(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // 🔒 VALIDATION
    const validationResult = prescriptionSubmissionSchema.safeParse(body)

    // ❌ Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: getFirstErrorMessage(validationResult.error.issues),
        },
        { status: 400 }
      )
    }

    // ✅ Valid data
    const {
      medicineNames,
      notes,
      prescriptionImageIds,
      targetPharmacyId,
      patientNotes,
    } = validationResult.data

    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      )
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

    if (prescriptionError) throw prescriptionError

    return NextResponse.json(
      {
        success: true,
        prescriptionId: prescription.id,
        message: "تم رفع الوصفة بنجاح",
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: "خطأ في عملية رفع الوصفة. حاول مجدداً." },
      { status: 500 }
    )
  }
}

// ============================================================================
// USAGE NOTES
// ============================================================================
/**
 * How to use these examples:
 *
 * 1. THESE ARE EXAMPLES, NOT REAL ROUTES
 *    Create separate files in app/api for actual implementation
 *
 * 2. CREATE YOUR ROUTE FILE:
 *    // app/api/auth/login/route.ts
 *    export async function POST(request: NextRequest) {
 *      // Use exampleLoginRoute code above
 *    }
 *
 * 3. IMPORT SCHEMA:
 *    import { loginSchema } from "@/lib/validation"
 *
 * 4. PARSE REQUEST:
 *    const body = await request.json()
 *
 * 5. VALIDATE:
 *    const result = schema.safeParse(body)
 *    if (!result.success) {
 *      return NextResponse.json({ error: getFirstErrorMessage(...) }, { status: 400 })
 *    }
 *
 * 6. USE VALIDATED DATA:
 *    const { field } = result.data  // Type-safe!
 *
 * 7. ERROR RESPONSES:
 *    - 400: Validation error (bad request)
 *    - 401: Auth error (unauthorized)
 *    - 500: Server error
 *
 * 8. CURL TESTING:
 *    curl -X POST http://localhost:3000/api/auth/login \
 *      -H "Content-Type: application/json" \
 *      -d '{"email":"test@example.com","password":"password123"}'
 */

