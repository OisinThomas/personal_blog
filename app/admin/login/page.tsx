'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithOTP, verifyOTP } from '@/lib/supabase/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error === 'auth_callback_error') {
      setErrorMessage('Authentication failed. Please try again.');
    }
  }, [error]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await signInWithOTP(email);
      setStep('otp');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await verifyOTP(email, otpCode);
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Admin Login
      </h1>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
          >
            {loading ? 'Sending...' : 'Send Login Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            We sent a code to <strong>{email}</strong>. Check your email and
            enter the 6-digit code below, or click the link in the email.
          </p>

          <div className="mb-4">
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors mb-3"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('email');
              setOtpCode('');
              setErrorMessage(null);
            }}
            className="w-full py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <Suspense
          fallback={
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-lg animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-6" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">
            &larr; Back to blog
          </Link>
        </p>
      </div>
    </div>
  );
}
