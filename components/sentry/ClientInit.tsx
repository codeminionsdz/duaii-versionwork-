"use client"

import { useEffect } from 'react'
import * as Sentry from '@sentry/react'

export default function ClientInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    const enabled = !!dsn && process.env.NODE_ENV === 'production'
    if (!enabled) return

    try {
      Sentry.init({
        dsn,
        environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
        tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0),
        attachStacktrace: true,
      })

      // Expose to window for quick manual tests from console (safe when DSN present)
      ;(window as any).Sentry = Sentry
    } catch (e) {
      // avoid breaking the app if Sentry init fails
      // eslint-disable-next-line no-console
      console.error('Sentry client init failed', e)
    }
  }, [])

  return null
}
