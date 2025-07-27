'use client';

import { useEffect, useState } from 'react';
import { X, Cookie, ChevronUp } from 'lucide-react';
import posthog from 'posthog-js';

type ConsentState = 'pending' | 'accepted' | 'rejected';

export default function CookieConsent() {
  const [consentState, setConsentState] = useState<ConsentState>('pending');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
      setConsentState(savedConsent as ConsentState);
      setIsExpanded(false);
      
      // Apply the saved preference
      if (savedConsent === 'rejected') {
        posthog.opt_out_capturing();
      }
    }
    
    // Show the banner after a small delay for better UX
    setTimeout(() => setIsVisible(true), 500);
  }, []);

  const handleAccept = () => {
    setConsentState('accepted');
    localStorage.setItem('cookieConsent', 'accepted');
    posthog.opt_in_capturing();
    setIsExpanded(false);
  };

  const handleReject = () => {
    setConsentState('rejected');
    localStorage.setItem('cookieConsent', 'rejected');
    posthog.opt_out_capturing();
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-12'
      }`}
    >
      {isExpanded ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Cookie Preferences
              </h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Minimize"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            We use cookies to improve your experience and analyze site usage. 
            By clicking "Accept", you consent to our use of cookies.{' '}
            <a 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Privacy Policy
            </a>
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Accept
            </button>
          </div>
          
          {consentState !== 'pending' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Current: {consentState === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={toggleExpanded}
          className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-xl transition-all group"
          aria-label="Open cookie preferences"
        >
          <div className="relative">
            <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            {consentState === 'accepted' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
            )}
            {consentState === 'rejected' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </div>
        </button>
      )}
    </div>
  );
}
