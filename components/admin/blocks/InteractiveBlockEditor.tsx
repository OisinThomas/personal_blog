'use client';

import { getAllComponents } from '@/components/interactive/registry';
import type { NodeMetadata } from '@/lib/supabase/types';

interface InteractiveBlockEditorProps {
  metadata: NodeMetadata;
  onMetadataChange: (metadata: NodeMetadata) => void;
}

export default function InteractiveBlockEditor({
  metadata,
  onMetadataChange,
}: InteractiveBlockEditorProps) {
  const interactiveMetadata = metadata as {
    componentSlug?: string;
    props?: Record<string, unknown>;
  };

  const availableComponents = getAllComponents();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Component
        </label>
        {availableComponents.length > 0 ? (
          <select
            value={interactiveMetadata.componentSlug || ''}
            onChange={(e) =>
              onMetadataChange({
                ...interactiveMetadata,
                componentSlug: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a component</option>
            {availableComponents.map((comp) => (
              <option key={comp.slug} value={comp.slug}>
                {comp.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
            No interactive components registered yet.
            <br />
            Add components to <code>components/interactive/registry.ts</code>
          </div>
        )}
      </div>

      {interactiveMetadata.componentSlug && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Props (JSON)
          </label>
          <textarea
            value={JSON.stringify(interactiveMetadata.props || {}, null, 2)}
            onChange={(e) => {
              try {
                const props = JSON.parse(e.target.value);
                onMetadataChange({ ...interactiveMetadata, props });
              } catch {
                // Invalid JSON, don't update
              }
            }}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter props as valid JSON to pass to the component
          </p>
        </div>
      )}

      {interactiveMetadata.componentSlug && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Preview available at:{' '}
            <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
              /interactions/{interactiveMetadata.componentSlug}
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
