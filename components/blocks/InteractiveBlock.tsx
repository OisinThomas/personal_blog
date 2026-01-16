'use client';

import { Suspense, lazy, useMemo } from 'react';
import { componentRegistry } from '@/components/interactive/registry';

interface InteractiveBlockProps {
  metadata: {
    componentSlug: string;
    props?: Record<string, unknown>;
  };
}

export default function InteractiveBlock({ metadata }: InteractiveBlockProps) {
  const { componentSlug, props = {} } = metadata;

  const Component = useMemo(() => {
    const registration = componentRegistry[componentSlug];
    if (!registration) {
      return null;
    }
    return lazy(registration.loader);
  }, [componentSlug]);

  if (!Component) {
    return (
      <div className="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-700 dark:text-yellow-400">
          Interactive component not found: {componentSlug}
        </p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <Suspense
        fallback={
          <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-48" />
        }
      >
        <Component {...props} />
      </Suspense>
    </div>
  );
}
