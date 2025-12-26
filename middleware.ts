import { type NextRequest } from "next/server"
import { updateSession } from "./lib/supabase/middleware"

// Refresh Supabase auth session cookies on each request
export async function middleware(request: NextRequest) {
  return updateSession(request)
}

// Skip static assets and API routes for performance
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images/.*|manifest.json|service-worker.js).*)"],
}
