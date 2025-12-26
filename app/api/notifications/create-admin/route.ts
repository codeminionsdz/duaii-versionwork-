import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, title, message, type = "pharmacy", data: notifData } = body as {
      user_id: string
      title: string
      message: string
      type?: string
      data?: Record<string, any>
    }

    console.log("📨 Creating notification for user:", user_id)
    console.log("🔑 Service role key available:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY not found")
      return Response.json({ error: "Service role key not configured" }, { status: 500 })
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log("✅ Admin client created")

    const { data, error } = await admin
      .from("notifications")
      .insert({
        user_id,
        title,
        message,
        type,
        read: false,
        data: notifData || null,
      })
      .select()

    if (error) {
      console.error("❌ Database error:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ Notification created:", data)
    return Response.json({ success: true, notification: data?.[0] })
  } catch (err) {
    console.error("❌ Unexpected error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
