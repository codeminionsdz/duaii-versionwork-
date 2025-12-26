import * as Sentry from '@sentry/node'

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
const enabled = !!dsn && process.env.NODE_ENV === 'production'

if (enabled) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
    attachStacktrace: true,
    // keep the setup minimal to avoid over-instrumentation
  })

  // Capture unhandled rejections explicitly
  process.on('unhandledRejection', (reason) => {
    try {
      if (reason instanceof Error) Sentry.captureException(reason)
      else Sentry.captureException(new Error(String(reason)))
    } catch (e) {
      // swallow any error during reporting
      console.error('Sentry capture failed', e)
    }
  })

  // Optionally capture uncaught exceptions (Node process-level)
  process.on('uncaughtException', (err) => {
    try {
      Sentry.captureException(err)
    } catch (e) {
      console.error('Sentry capture failed', e)
    }
  })
}

export default Sentry
