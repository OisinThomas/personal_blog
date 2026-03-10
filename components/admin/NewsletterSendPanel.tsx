'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Send, Check } from 'lucide-react';
import type { Channel } from '@/lib/supabase/types';

interface EmailSendInfo {
  id: string;
  status: string;
  subscriber_count: number;
  completed_at: string | null;
}

interface NewsletterSendPanelProps {
  postId: string;
  postStatus: string;
  postLanguage: string;
}

export default function NewsletterSendPanel({ postId, postStatus, postLanguage }: NewsletterSendPanelProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [postChannelIds, setPostChannelIds] = useState<string[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [emailSend, setEmailSend] = useState<EmailSendInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [channelsRes, postChannelsRes, emailSendRes] = await Promise.all([
        fetch('/api/newsletter/channels'),
        fetch(`/api/newsletter/post-channels?post_id=${postId}`),
        fetch(`/api/newsletter/email-send?post_id=${postId}`),
      ]);

      const channelsData = await channelsRes.json();
      setChannels(channelsData.channels ?? []);

      if (postChannelsRes.ok) {
        const pcData = await postChannelsRes.json();
        setPostChannelIds(pcData.channel_ids ?? []);
        setSelectedChannelIds(pcData.channel_ids ?? []);
      }

      if (emailSendRes.ok) {
        const esData = await emailSendRes.json();
        if (esData.email_send) {
          setEmailSend(esData.email_send);
        }
      }
    } catch (err) {
      console.error('Error fetching newsletter data:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pre-fill channel selection based on post language
  useEffect(() => {
    if (channels.length > 0 && postChannelIds.length === 0 && selectedChannelIds.length === 0) {
      const defaults: string[] = [];
      const allChannel = channels.find(c => c.slug === 'all');
      const langChannel = channels.find(c => c.slug === postLanguage);
      if (allChannel) defaults.push(allChannel.id);
      if (langChannel) defaults.push(langChannel.id);
      setSelectedChannelIds(defaults);
    }
  }, [channels, postChannelIds, selectedChannelIds.length, postLanguage]);

  const toggleChannel = (id: string) => {
    setSelectedChannelIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const saveChannels = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/newsletter/post-channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, channel_ids: selectedChannelIds }),
      });
      if (res.ok) {
        setPostChannelIds(selectedChannelIds);
        const data = await res.json();
        setSubscriberCount(data.subscriber_count ?? null);
      }
    } catch (err) {
      console.error('Error saving channels:', err);
    } finally {
      setSaving(false);
    }
  };

  const sendNewsletter = async () => {
    if (!confirm(`Send this post to ${subscriberCount ?? '?'} subscribers? This cannot be undone.`)) return;

    setSending(true);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailSend({ id: data.send_id, status: 'sent', subscriber_count: subscriberCount ?? 0, completed_at: new Date().toISOString() });
      } else {
        alert(data.error || 'Failed to send');
      }
    } catch (err) {
      console.error('Error sending newsletter:', err);
      alert('Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  if (postStatus !== 'published') return null;
  if (loading) return null;

  // Already sent
  if (emailSend && emailSend.status === 'sent') {
    return (
      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">
            Sent to {emailSend.subscriber_count} subscriber{emailSend.subscriber_count !== 1 ? 's' : ''}
            {emailSend.completed_at && ` on ${new Date(emailSend.completed_at).toLocaleDateString()}`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4" />
        Newsletter
      </h3>

      {/* Channel selection */}
      <div className="space-y-2 mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">Send to channels:</p>
        {channels.map(ch => (
          <label key={ch.id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selectedChannelIds.includes(ch.id)}
              onChange={() => toggleChannel(ch.id)}
              disabled={postChannelIds.length > 0 && emailSend !== null}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">{ch.name}</span>
          </label>
        ))}
      </div>

      {/* Save channels / Send */}
      <div className="flex items-center gap-2">
        {postChannelIds.length === 0 || JSON.stringify(postChannelIds.sort()) !== JSON.stringify(selectedChannelIds.sort()) ? (
          <button
            onClick={saveChannels}
            disabled={saving || selectedChannelIds.length === 0}
            className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-medium rounded-md transition-colors"
          >
            {saving ? 'Saving...' : 'Save Channels'}
          </button>
        ) : (
          <button
            onClick={sendNewsletter}
            disabled={sending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Sending...' : `Send to ${subscriberCount ?? '?'} subscribers`}
          </button>
        )}
      </div>
    </div>
  );
}
