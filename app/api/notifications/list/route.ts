import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const url = new URL(request.url)
    const limit = Number(url.searchParams.get("limit") || 20)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    const unread = (data || []).filter(n => !n.read).length
    return Response.json({ notifications: data || [], unread })
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
