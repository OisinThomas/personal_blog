import posthog from "posthog-js"

// Check for existing consent before initializing
const existingConsent = typeof window !== 'undefined' ? localStorage.getItem('cookieConsent') : null;

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  defaults: '2025-05-24',
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking
  debug: process.env.NODE_ENV === "development",
  // Start with tracking disabled if no consent or rejected
  opt_out_capturing_by_default: !existingConsent || existingConsent === 'rejected',
  // Respect Do Not Track
  respect_dnt: true,
});

// Apply the saved preference
if (existingConsent === 'rejected') {
  posthog.opt_out_capturing();
} else if (existingConsent === 'accepted') {
  posthog.opt_in_capturing();
}
