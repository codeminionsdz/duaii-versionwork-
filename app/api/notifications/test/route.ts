import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * Test endpoint to create a test notification for the current user
 * Usage: POST /api/notifications/test
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ Auth error:", userError)
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title = "اختبار الإشعارات", message = "هذا إشعار اختباري" } = await request.json()

    console.log("✅ User authenticated:", user.id)
    console.log("📨 Creating test notification for user:", user.id)

    // Create test notification
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title,
        message,
        type: "test",
        read: false,
        data: { test: true, timestamp: new Date().toISOString() }
      })
      .select()

    if (error) {
      console.error("❌ Error creating notification:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ Test notification created:", data)
    return Response.json({ success: true, notification: data?.[0] })
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
