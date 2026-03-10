'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import SubscribeModal from './SubscribeModal';

export default function SubscribeBanner() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Mail className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Enjoyed this post?</h3>
        <p className="text-secondary-500 text-sm mb-6 max-w-sm mx-auto">
          Subscribe to get new posts delivered to your inbox.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 transition-opacity"
        >
          Subscribe
        </button>
      </div>

      <SubscribeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
