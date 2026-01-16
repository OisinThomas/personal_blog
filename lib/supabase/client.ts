import { createBrowserClient } from '@supabase/ssr';

// Note: For full type safety, run `supabase gen types typescript` after setting up tables
// and import the generated Database type
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient should only be called on the client side');
  }

  if (!browserClient) {
    browserClient = createClient();
  }

  return browserClient;
}
