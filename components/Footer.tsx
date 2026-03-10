'use client';

import { useState } from 'react';
import Socials from './Socials';
import SubscribeModal from './SubscribeModal';

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <footer className="bg-surface-1 border-t border-card-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-primary mb-3">Never miss a post</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 transition-opacity"
          >
            Subscribe
          </button>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-secondary">
            © Oisín Thomas {new Date().getFullYear()}
          </div>
          <Socials />
        </div>
      </div>

      <SubscribeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </footer>
  );
}
