'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { Asset } from '@/lib/supabase/types';

interface ImageBlockProps {
  asset: Asset | null;
  metadata?: {
    alt?: string;
    caption?: string;
  };
}

export default function ImageBlock({ asset, metadata }: ImageBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openModal = useCallback(() => setIsExpanded(true), []);
  const closeModal = useCallback(() => setIsExpanded(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeModal();
      };
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isExpanded, closeModal]);

  if (!asset) {
    return null;
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;
  const alt = metadata?.alt || asset.alt_text || asset.filename;
  const caption = metadata?.caption || asset.caption;

  return (
    <>
      <figure className="my-8 group">
        <div className="relative overflow-hidden rounded-xl shadow-soft">
          <Image
            src={imageUrl}
            alt={alt}
            width={asset.width || 800}
            height={asset.height || 600}
            className="w-full h-auto"
          />
          <button
            onClick={openModal}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white/80 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label="Expand image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        </div>
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-secondary-500">
            {caption}
          </figcaption>
        )}
      </figure>

      {isExpanded && createPortal(
        <div
          className="fixed top-0 left-0 w-screen h-screen z-[9999] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded image view"
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            onClick={closeModal}
            aria-label="Close expanded view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          {caption && (
            <p className="absolute bottom-4 left-0 right-0 text-white/80 text-center text-sm">{caption}</p>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
