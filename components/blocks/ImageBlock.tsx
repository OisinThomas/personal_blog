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
  if (!asset) {
    return null;
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;
  const alt = metadata?.alt || asset.alt_text || asset.filename;
  const caption = metadata?.caption || asset.caption;

  return (
    <figure className="my-8 group">
      <div className="relative overflow-hidden rounded-xl shadow-soft border border-card-border">
        <Image
          src={imageUrl}
          alt={alt}
          width={asset.width || 800}
          height={asset.height || 600}
          className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-secondary-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
