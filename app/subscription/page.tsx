'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Footer from '@/components/Footer';

interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${'*'.repeat(Math.min(local.length - 2, 6))}@${domain}`;
}

function ManageSubscription() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const justUnsubscribed = searchParams.get('unsubscribed') === 'true';

  const [email, setEmail] = useState('');
  const [subscriberStatus, setSubscriberStatus] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'saved' | 'unsubscribed' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No subscription token provided.');
      return;
    }

    fetch(`/api/newsletter/manage?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Invalid or expired token');
        return res.json();
      })
      .then((data) => {
        setEmail(data.subscriber.email);
        setSubscriberStatus(data.subscriber.status);
        setChannels(data.channels);
        setSelectedChannels(data.selectedChannelIds);
        if (justUnsubscribed) {
          setStatus('unsubscribed');
        } else {
          setStatus('ready');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Invalid or expired subscription link.');
      });
  }, [token, justUnsubscribed]);

  const selectChannel = (id: string) => {
    setSelectedChannels([id]);
  };

  const handleSave = async () => {
    if (!token || selectedChannels.length === 0) return;

    setStatus('saving');
    try {
      const res = await fetch(`/api/newsletter/manage?token=${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_ids: selectedChannels }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSubscriberStatus('confirmed');
      setStatus('saved');
    } catch {
      setStatus('ready');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) return;

    setStatus('saving');
    try {
      const res = await fetch(`/api/newsletter/manage?token=${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_ids: [] }),
      });

      if (!res.ok) throw new Error('Failed to unsubscribe');
      setSubscriberStatus('unsubscribed');
      setSelectedChannels([]);
      setStatus('unsubscribed');
    } catch {
      setStatus('ready');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="py-24 text-center">
        <div className="text-secondary-500">Loading...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-secondary-500 mb-8">{message}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 transition-opacity"
        >
          Back to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16">
      <h1 className="text-2xl font-bold mb-2">Manage subscription</h1>
      <p className="text-secondary-500 mb-8 text-sm">
        {maskEmail(email)}
      </p>

      {status === 'unsubscribed' && (
        <div className="mb-6 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-700 dark:text-yellow-400">
          You&apos;ve been unsubscribed. Select a topic below and save to re-subscribe.
        </div>
      )}

      {status === 'saved' && (
        <div className="mb-6 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
          Your preferences have been saved.
        </div>
      )}

      {message && status === 'ready' && (
        <div className="mb-6 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-500 dark:text-red-400">
          {message}
        </div>
      )}

      {channels.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-secondary-400 font-medium mb-3">Topics:</p>
          <div className="flex flex-wrap gap-2">
            {channels.map((channel) => {
              const selected = selectedChannels.includes(channel.id);
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => selectChannel(channel.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                    selected
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'border-card-border text-secondary-400 hover:border-secondary-300 hover:text-secondary-600'
                  }`}
                >
                  {channel.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={status === 'saving' || selectedChannels.length === 0}
          className="px-5 py-2 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {status === 'saving' ? 'Saving...' : 'Save preferences'}
        </button>

        {subscriberStatus !== 'unsubscribed' && (
          <button
            onClick={handleUnsubscribe}
            disabled={status === 'saving'}
            className="text-sm text-secondary-400 hover:text-red-500 transition-colors"
          >
            Unsubscribe from all
          </button>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <>
      <main className="container mx-auto px-4 mb-16 max-w-xl">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="text-secondary-500">Loading...</div>
            </div>
          }
        >
          <ManageSubscription />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
