'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function SubscriberActions({ subscriberId }: { subscriberId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUnsubscribe = async () => {
    if (!confirm('Are you sure you want to unsubscribe this user?')) return;

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('id', subscriberId);
      router.refresh();
    } catch (err) {
      console.error('Error unsubscribing:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUnsubscribe}
      disabled={loading}
      className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Unsubscribe'}
    </button>
  );
}
