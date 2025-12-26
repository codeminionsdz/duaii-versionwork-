import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function GET() {
  // Use service role for admin API to avoid RLS issues
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Fetch strictly pending subscriptions (enum value)
    const { data: subsData, error: subsError } = await supabase
      .from("subscriptions")
      .select("id, pharmacy_id, plan_type, status, receipt_url, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (subsError) {
      console.error("❌ Error fetching pending subscriptions:", subsError)
      return Response.json([], { status: 500 })
    }

    console.log("📊 Found pending subscriptions:", subsData?.length || 0)
    if (subsData && subsData.length > 0) {
      console.log("🔍 First subscription receipt_url:", subsData[0].receipt_url)
    }

    if (!subsData || subsData.length === 0) {
      return Response.json([])
    }

    // Attach pharmacy profile details per subscription and sign receipt URL
    const subscriptionsWithPharmacy = await Promise.all(
      subsData.map(async (sub) => {
        const { data: pharmacy, error: pharmacyError } = await supabase
          .from("pharmacy_profiles")
          .select("id, pharmacy_name, address, license_number, is_verified")
          .eq("id", sub.pharmacy_id)
          .single()

        if (pharmacyError) {
          console.error("❌ Pharmacy fetch error for", sub.pharmacy_id, pharmacyError)
        }

        let signedReceiptUrl = sub.receipt_url
        try {
          if (typeof sub.receipt_url === "string" && sub.receipt_url) {
            let filePath = sub.receipt_url
            
            // If it's a full URL, extract the file path
            if (filePath.includes("http")) {
              // Method 1: URL contains /object/public/subscriptions/
              if (filePath.includes("/object/public/subscriptions/")) {
                const parts = filePath.split("/object/public/subscriptions/")
                filePath = parts[1] || ""
              }
              // Method 2: URL contains /storage/v1/object/
              else if (filePath.includes("/storage/v1/object/")) {
                const parts = filePath.split("/subscriptions/")
                filePath = parts[1] || ""
              }
            }
            // If it's already just a path, clean it up
            else if (filePath.startsWith("subscriptions/")) {
              filePath = filePath.replace("subscriptions/", "")
            }
            
            console.log("🔍 Original receipt URL:", sub.receipt_url)
            console.log("🔍 Extracted file path:", filePath)
            
            if (filePath) {
              const { data: signed, error: signErr } = await supabase
                .storage
                .from("subscriptions")
                .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days
              
              if (!signErr && signed?.signedUrl) {
                signedReceiptUrl = signed.signedUrl
                console.log("✅ Signed URL generated successfully")
              } else if (signErr) {
                console.error("❌ Signing receipt failed for", filePath, signErr)
              }
            }
          }
        } catch (e) {
          console.error("❌ Error while generating signed receipt URL:", e)
        }

        return { ...sub, pharmacy, receipt_url: signedReceiptUrl }
      })
    )

    return Response.json(subscriptionsWithPharmacy)
  } catch (error) {
    console.error("❌ Unexpected error fetching subscriptions:", error)
    return Response.json([], { status: 500 })
  }
}
