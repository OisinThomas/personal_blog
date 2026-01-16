import { getSupabaseClient } from './client';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export async function signInWithOTP(email: string) {
  // Validate email matches admin email
  if (ADMIN_EMAIL && email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized email address');
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function verifyOTP(email: string, token: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function getSession() {
  const supabase = getSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

export async function getUser() {
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}
