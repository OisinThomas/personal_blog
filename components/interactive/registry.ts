/**
 * Interactive Components Registry
 *
 * Register interactive React components here that can be embedded in blog posts.
 * Each component must have a unique slug and a loader function.
 *
 * Example registration:
 * ```ts
 * 'my-component': {
 *   name: 'My Component',
 *   description: 'A description of what this component does',
 *   loader: () => import('./MyComponent'),
 * }
 * ```
 */

interface ComponentRegistration {
  name: string;
  description?: string;
  loader: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;
}

export const componentRegistry: Record<string, ComponentRegistration> = {
  // Example component
  'example-counter': {
    name: 'Example Counter',
    description: 'A simple counter component for demonstration',
    loader: () => import('./ExampleCounter'),
  },
};

export function getComponentBySlug(slug: string): ComponentRegistration | null {
  return componentRegistry[slug] || null;
}

export function getAllComponents(): Array<
  ComponentRegistration & { slug: string }
> {
  return Object.entries(componentRegistry).map(([slug, component]) => ({
    slug,
    ...component,
  }));
}
