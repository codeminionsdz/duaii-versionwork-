import { createClient as createAdminClient } from "@supabase/supabase-js"

interface CreateNotificationPayload {
  userId: string
  title: string
  message: string
  type?: string
  data?: Record<string, any>
}

export async function POST(request: Request) {
  try {
    const payload: CreateNotificationPayload = await request.json()

    if (!payload.userId || !payload.title || !payload.message) {
      return Response.json({ error: "Missing required fields: userId, title, message" }, { status: 400 })
    }

    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type || "pharmacy",
        read: false,
        data: payload.data || null,
      })
      .select()

    if (error) {
      console.error("❌ Error creating notification:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, notification: data?.[0] })
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
