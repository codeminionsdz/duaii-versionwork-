import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            // Ignore cookie errors in API routes
          }
        },
      },
    },
  )

  try {
    const { email, password } = await request.json()

    console.log("🔐 Login attempt for:", email)
    console.log("📍 Using Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

    if (!email || !password) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    console.log("🔍 Login response:", { success: !error, error: error?.message })

    if (error || !data?.user) {
      return NextResponse.json({ error: error?.message || "تعذر تسجيل الدخول" }, { status: 400 })
    }

    const role = data.user.user_metadata?.role || "user"

    return NextResponse.json({
      ok: true,
      role,
      redirectTo: role === "pharmacy" ? "/pharmacy/dashboard" : "/home",
    })
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "خطأ غير متوقع"
    console.error("/api/auth/login error", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
