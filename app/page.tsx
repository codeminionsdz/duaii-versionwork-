import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    redirect('/home')
  }

  // Do not redirect unauthenticated users to the login page here.
  // The layout renders the `WelcomeScreen` and `Onboarding` client-side
  // and will decide when to show the `Login` route after onboarding.
  return <main />
}
