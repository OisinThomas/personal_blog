'use client';

import { Suspense, lazy, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { componentRegistry, getComponentBySlug } from '@/components/interactive/registry';
import Link from 'next/link';

export default function InteractionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const registration = useMemo(() => getComponentBySlug(slug), [slug]);

  if (!registration) {
    notFound();
  }

  const Component = useMemo(() => lazy(registration.loader), [registration]);

  return (
    <div className="min-h-screen bg-primary">
      <header className="bg-card-bg border-b border-card-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-secondary hover:text-primary transition-colors">
            &larr; Back to blog
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">{registration.name}</h1>
        {registration.description && (
          <p className="text-secondary mb-8">{registration.description}</p>
        )}

        <div className="bg-card-bg border border-card-border rounded-lg p-6">
          <Suspense
            fallback={
              <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-64" />
            }
          >
            <Component />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
