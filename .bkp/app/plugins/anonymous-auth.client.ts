export default defineNuxtPlugin(async () => {
  // Ensure we have a client-side Supabase session. If none, sign in anonymously.
  const supabase = useSupabaseClient();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        // Anonymous sign-ins might be disabled in your Supabase project.
        // App can still operate with localStorage-only config if this fails.
        console.warn('[anon-auth] Anonymous sign-in failed:', error.message);
      } else {
        console.info('[anon-auth] Anonymous session started:', !!data?.user);
      }
    }
  } catch (e) {
    console.warn('[anon-auth] Error ensuring anonymous session:', e);
  }
});
