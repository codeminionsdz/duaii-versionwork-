/**
 * EXAMPLE: Rate Limiting in API Routes
 * 
 * Example: app/api/medicines/search/route.ts
 * This shows how to apply rate limiting to an API endpoint
 */

import { NextRequest, NextResponse } from "next/server"
import {
  getClientIP,
  checkRateLimit,
  createRateLimitResponse,
  RATE_LIMIT_CONFIG,
} from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  // 🔒 Extract client IP and check rate limit
  const clientIP = getClientIP()
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIG.search)

  // If rate limit exceeded, return 429 Too Many Requests
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult, RATE_LIMIT_CONFIG.search)
  }

  // ✅ Rate limit passed, proceed with handler logic
  const supabase = await createClient()

  try {
    const searchQuery = request.nextUrl.searchParams.get("q")
    const latitude = request.nextUrl.searchParams.get("lat")
    const longitude = request.nextUrl.searchParams.get("lng")

    if (!searchQuery) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 }
      )
    }

    // Your existing search logic here
    const { data: medicines, error } = await supabase
      .from("medicines")
      .select("*")
      .ilike("name", `%${searchQuery}%`)
      .limit(50)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: medicines,
      remaining: rateLimitResult.remaining, // Optional: inform client of remaining quota
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "خطأ في البحث. حاول مجدداً.",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * EXAMPLE: Authentication API Route with Rate Limiting
 * Example: app/api/auth/login/route.ts
 */

export async function POST(request: NextRequest) {
  // 🔒 Check rate limit (5 attempts per minute for auth)
  const clientIP = getClientIP()
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIG.auth)

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult,
      RATE_LIMIT_CONFIG.auth,
      429
    )
  }

  // ✅ Rate limit passed
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبة" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: "بيانات تسجيل دخول غير صحيحة" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "خطأ في المعالجة. حاول مجدداً.",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
