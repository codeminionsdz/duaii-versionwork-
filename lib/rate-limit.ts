/**
 * Rate Limiting Utility for دوائي App
 * Lightweight solution with in-memory storage and optional Redis support
 * 
 * Features:
 * - Per-IP and per-user rate limiting
 * - Configurable limits per endpoint
 * - Returns friendly Arabic error messages
 * - Automatic cleanup of stale entries
 */

import { headers } from "next/headers"

// In-memory store for rate limiting (per-IP and per-user)
// Structure: { key: { timestamps: number[], lastCleanup: number } }
const rateLimitStore = new Map<
  string,
  { timestamps: number[]; lastCleanup: number }
>()

// Configuration for different endpoints
export const RATE_LIMIT_CONFIG = {
  // Authentication: 5 attempts per minute (brute-force protection)
  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: "عذراً، لقد تجاوزت عدد محاولات التسجيل. حاول مجدداً بعد دقيقة.",
  },
  // Search: 30 requests per minute (generous for smooth UX)
  search: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: "عذراً، عدد الطلبات كثير جداً. حاول مجدداً بعد لحظات.",
  },
  // Prescription upload: 10 requests per minute
  prescription: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: "عذراً، لا يمكنك رفع أكثر من 10 وصفات في الدقيقة. حاول مجدداً لاحقاً.",
  },
  // General API: 50 requests per minute
  api: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: "عذراً، عدد الطلبات كثير جداً. حاول مجدداً بعد لحظات.",
  },
}

/**
 * Get client IP address from request headers
 * Works with common proxy headers (X-Forwarded-For, CloudFlare, etc.)
 */
export function getClientIP(): string {
  const headersList = headers()

  // Check common headers set by proxies/CDNs
  const forwarded = headersList.get("x-forwarded-for")
  if (forwarded) {
    // x-forwarded-for can have multiple IPs, get the first one (client IP)
    return forwarded.split(",")[0].trim()
  }

  const realIP = headersList.get("x-real-ip")
  if (realIP) return realIP

  const cfConnectingIP = headersList.get("cf-connecting-ip")
  if (cfConnectingIP) return cfConnectingIP

  // Fallback to generic header
  const clientIP = headersList.get("x-client-ip")
  return clientIP || "unknown"
}

/**
 * Check if a request should be rate limited
 * Returns { allowed: boolean, remaining: number, retryAfter: number }
 */
export function checkRateLimit(
  identifier: string,
  config: (typeof RATE_LIMIT_CONFIG)[keyof typeof RATE_LIMIT_CONFIG]
): {
  allowed: boolean
  remaining: number
  retryAfter: number
} {
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get or create entry
  let entry = rateLimitStore.get(identifier)
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now }
    rateLimitStore.set(identifier, entry)
  }

  // Cleanup old entries periodically (every 10 seconds)
  if (now - entry.lastCleanup > 10000) {
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart)
    entry.lastCleanup = now
  }

  // Filter timestamps within the window
  const recentRequests = entry.timestamps.filter((ts) => ts > windowStart)

  // Check if limit exceeded
  const allowed = recentRequests.length < config.maxRequests
  const remaining = Math.max(0, config.maxRequests - recentRequests.length)

  if (allowed) {
    // Add current timestamp
    recentRequests.push(now)
    entry.timestamps = recentRequests
  }

  // Calculate retry-after in seconds
  const retryAfter = recentRequests.length > 0
    ? Math.ceil((recentRequests[0] + config.windowMs - now) / 1000)
    : 0

  return { allowed, remaining, retryAfter }
}

/**
 * Rate limit middleware for Server Actions
 * Usage:
 *   await rateLimitAction(identifier, RATE_LIMIT_CONFIG.auth)
 */
export async function rateLimitAction(
  identifier: string,
  config: (typeof RATE_LIMIT_CONFIG)[keyof typeof RATE_LIMIT_CONFIG]
) {
  const result = checkRateLimit(identifier, config)

  if (!result.allowed) {
    const error = new Error(config.errorMessage) as any
    error.code = "RATE_LIMIT_EXCEEDED"
    error.retryAfter = result.retryAfter
    throw error
  }

  return {
    allowed: true,
    remaining: result.remaining,
  }
}

/**
 * Rate limit middleware for API Routes
 * Usage in route handler:
 *   const ip = getClientIP()
 *   const result = checkRateLimit(ip, RATE_LIMIT_CONFIG.auth)
 *   if (!result.allowed) {
 *     return Response.json(
 *       { error: RATE_LIMIT_CONFIG.auth.errorMessage },
 *       { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
 *     )
 *   }
 */
export function createRateLimitResponse(
  result: ReturnType<typeof checkRateLimit>,
  config: (typeof RATE_LIMIT_CONFIG)[keyof typeof RATE_LIMIT_CONFIG],
  statusCode = 429
) {
  return new Response(
    JSON.stringify({
      error: config.errorMessage,
      retryAfter: result.retryAfter,
    }),
    {
      status: statusCode,
      headers: {
        "Retry-After": String(result.retryAfter),
        "Content-Type": "application/json",
      },
    }
  )
}

/**
 * Clear rate limit for a specific identifier
 * Useful for testing or manual resets
 */
export function clearRateLimit(identifier: string) {
  rateLimitStore.delete(identifier)
}

/**
 * Get current rate limit status for monitoring
 */
export function getRateLimitStatus(identifier: string) {
  const entry = rateLimitStore.get(identifier)
  return {
    identifier,
    requestCount: entry?.timestamps.length || 0,
    lastRequest: entry?.timestamps[entry.timestamps.length - 1] || null,
  }
}
