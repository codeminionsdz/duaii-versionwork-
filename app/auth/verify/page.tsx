"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight, Loader2 } from "lucide-react"
import { completeSignupAfterVerification } from "@/lib/auth/profile-creation"

export default function VerifyPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<"pending" | "loading" | "error" | "success">("pending")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleVerification = async () => {
      try {
        setStatus("loading")
        const supabase = createClient()

        // Check if we already have a session (either from storage or URL tokens)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        // If no session in storage, try to retrieve from URL tokens
        if (!session) {
          setStatus("pending")
          setErrorMessage("")
          return
        }

        // ✅ Session exists - user email is verified!
        console.log("✅ Valid session found for user:", session.user.id)

        // Get user metadata
        const user = session.user
        const metadata = user.user_metadata || {}

        // Check if profile already exists (prevent duplicate creation)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single()

        if (existingProfile) {
          console.log("✅ Profile already exists, skipping creation")
          setStatus("success")
          router.replace("/home")
          return
        }

        // Create profiles for this user
        await completeSignupAfterVerification(supabase, user.id, {
          full_name: metadata.full_name,
          phone: metadata.phone,
          role: metadata.role,
          pharmacy_name: metadata.pharmacy_name,
          license_number: metadata.license_number,
          address: metadata.address,
        })

        console.log("✅ Profile created successfully")
        setStatus("success")
        router.replace("/home")
      } catch (error: any) {
        console.error("❌ Verification error:", error)
        setStatus("error")
        setErrorMessage(error?.message || "حدث خطأ أثناء التحقق")
      }
    }

    handleVerification()
  }, [router, mounted])

  if (!mounted) {
    return null // Prevent SSR mismatch
  }

  const getStatusMessage = () => {
    switch (status) {
      case "pending":
        return {
          title: "تحقق من بريدك الإلكتروني",
          description: "انقر على رابط التفعيل المرسل إلى بريدك",
          icon: <Mail className="h-8 w-8 text-emerald-600" />,
        }
      case "loading":
        return {
          title: "جاري التحقق من البريد الإلكتروني...",
          description: "يرجى الانتظار",
          icon: <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />,
        }
      case "success":
        return {
          title: "تم التحقق بنجاح!",
          description: "جاري التوجيه إلى لوحة التحكم...",
          icon: <Mail className="h-8 w-8 text-emerald-600" />,
        }
      case "error":
        return {
          title: "خطأ في التحقق",
          description: errorMessage || "حدث خطأ ما",
          icon: <Mail className="h-8 w-8 text-red-600" />,
        }
    }
  }

  const msg = getStatusMessage()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4">
            <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">دوائي</h1>
        </div>

        <Card className="shadow-lg border-2">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              {msg.icon}
            </div>
            <CardTitle className="text-2xl">{msg.title}</CardTitle>
            <CardDescription className="text-base">{msg.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{status === "pending" && (
              <>
                <div className="bg-muted/50 p-4 rounded-lg text-sm text-center space-y-2">
                  <p>يرجى فتح بريدك الإلكتروني والنقر على رابط التفعيل لإكمال عملية التسجيل</p>
                  <p className="text-muted-foreground text-xs">إذا لم تجد الرسالة، تحقق من مجلد الرسائل غير المرغوب فيها</p>
                </div>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/auth/login">
                    العودة لتسجيل الدخول
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="bg-red-50 p-4 rounded-lg text-sm text-center">
                  <p className="text-red-800">{errorMessage}</p>
                </div>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/auth/signup">
                    محاولة التسجيل مرة أخرى
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
