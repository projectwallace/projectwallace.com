import * as Sentry from '@sentry/sveltekit'
import { isSupported } from '@oddbird/popover-polyfill/fn'

Sentry.init({
  dsn: 'https://e5b77e4a23c6fed08fa9f7d9eb8749a8@o50610.ingest.us.sentry.io/4508721021321216',

  tracesSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // If you don't want to use Session Replay, just remove the line below:
  integrations: [],

  ignoreErrors: [
    // Ignore errors caused by newer deployments overriding old deployments
    'Failed to fetch dynamically imported module',
    'Unable to preload CSS for',
    // Ignore error caused by Evernote Web Clipper
    'no clipping info'
  ],

  enableLogs: true,
})

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = Sentry.handleErrorWithSentry()

export const init = async () => {
  // Polyfill popover if necessary
  if (!isSupported()) {
    console.warn('Popover API not supported in this browser, applying polyfill')
    await import("@oddbird/popover-polyfill/fn")
      .then(({ apply }) => apply())
    Sentry.captureMessage('Popover API not supported in this browser', {
      fingerprint: ['popover-polyfill-applied'],
    })
  }
}