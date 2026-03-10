'use client';

import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';

interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

interface SubscribeFormProps {
  compact?: boolean;
}

export default function SubscribeForm({ compact = false }: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/newsletter/channels')
      .then((res) => res.json())
      .then((data) => {
        const ch = data.channels ?? [];
        setChannels(ch);
        // Default: select "All Posts"
        const allChannel = ch.find((c: Channel) => c.slug === 'all');
        if (allChannel) setSelectedChannels([allChannel.id]);
      })
      .catch(() => {});
  }, []);

  const selectChannel = (id: string) => {
    setSelectedChannels([id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || selectedChannels.length === 0) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, channel_ids: selectedChannels }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message ?? 'Check your inbox to confirm!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-1.5 text-sm rounded-md border border-card-border bg-transparent text-primary placeholder:text-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
        {status === 'success' && (
          <span className="text-xs text-green-600 dark:text-green-400 self-center">Sent!</span>
        )}
      </form>
    );
  }

  return (
    <div id="subscribe" className="card p-6 scroll-mt-24">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <Mail className="w-5 h-5 text-primary" />
        Subscribe
      </h3>
      <p className="text-sm text-secondary-500 mb-4">
        Get new posts delivered to your inbox.
      </p>

      {status === 'success' ? (
        <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2 text-sm rounded-md border border-card-border bg-transparent placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />

          {channels.length > 1 && (
            <div>
              <p className="text-xs text-secondary-400 font-medium mb-2">Topics:</p>
              <div className="flex flex-wrap gap-2">
                {channels.map((channel) => {
                  const selected = selectedChannels.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => selectChannel(channel.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
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

          <button
            type="submit"
            disabled={status === 'loading' || selectedChannels.length === 0}
            className="w-full px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>

          {status === 'error' && (
            <p className="text-xs text-red-500 dark:text-red-400">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
