import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

/**
 * Server-only Supabase Admin client (uses Service Role key).
 * Ensure SUPABASE_SERVICE_ROLE_KEY is set in server env (never expose).
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

/**
 * Input validation schema
 */
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  phone: z.string().optional().nullable(),
  role: z.union([z.literal("user"), z.literal("pharmacy"), z.literal("admin")]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);
    const role = parsed.role ?? "user";

    // 1) Create Auth user (signUp) - using Admin client is allowed server-side
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
      email: parsed.email,
      password: parsed.password,
    });

    if (signUpError) {
      // Authentication-level error
      return new Response(JSON.stringify({ error: "Auth error", details: signUpError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Auth error", details: "No user id returned" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2) Insert profile using the Admin client (bypasses RLS securely)
    const { error: dbError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        full_name: parsed.full_name,
        phone: parsed.phone ?? null,
        role,
      })
      .select();

    if (dbError) {
      // If profile insert fails, optionally rollback user creation depending on policy.
      // For safety we return a clear DB error. Do NOT return service-role key or sensitive data.
      return new Response(JSON.stringify({ error: "Database error saving new user", details: dbError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Success - return minimal safe info
    return new Response(JSON.stringify({ ok: true, userId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    // Zod validation errors or unexpected errors
    if (err?.name === "ZodError") {
      return new Response(JSON.stringify({ error: "Validation error", details: err.errors }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Server error", details: err?.message ?? String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}