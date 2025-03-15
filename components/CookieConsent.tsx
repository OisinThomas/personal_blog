'use client'

import { useState, useEffect } from 'react'
import posthog from 'posthog-js'

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  
  useEffect(() => {
    // Check if user has already made a choice
    const consentChoice = localStorage.getItem('cookie-consent')
    
    if (consentChoice === null) {
      // No choice made yet, show the banner
      setShowConsent(true)
    } else if (consentChoice === 'true') {
      // User previously accepted
      posthog.opt_in_capturing()
    }
    // If consentChoice is 'false', tracking remains opted out by default
  }, [])
  
  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true')
    setShowConsent(false)
    posthog.opt_in_capturing()
  }
  
  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'false')
    setShowConsent(false)
    // PostHog is already opted out by default with our configuration
  }

  const manageCookies = () => {
    // Clear the previous choice and show the banner again
    localStorage.removeItem('cookie-consent')
    setShowConsent(true)
  }
  
  if (!showConsent) {
    // Show a small "Manage Cookies" button when the banner is hidden
    return (
      <button 
        onClick={manageCookies}
        className="fixed bottom-4 right-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs px-2 py-1 rounded opacity-70 hover:opacity-100 z-50"
      >
        Manage Cookies
      </button>
    )
  }
  
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <h3 className="font-bold text-lg mb-2">Cookie Consent</h3>
      <p className="mb-4">
        This website uses cookies to improve your experience and for analytics. 
        We use PostHog to collect anonymous usage data to help us improve our site.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={acceptCookies}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Accept
        </button>
        <button
          onClick={declineCookies}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
        >
          Decline
        </button>
      </div>
    </div>
  )
}
