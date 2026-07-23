/**
 * Flip this back to `false` once a real Supabase project is wired up.
 * While `true`, every read/write in the app is served from the in-memory
 * demo store (src/lib/demo/store.ts) instead of Supabase, and auth is
 * bypassed so the interface can be reviewed without any backend setup.
 */
export const DEMO_MODE = false;

export const DEMO_USER = {
  name: "Alex Rivera",
  email: "alex@demoagency.com",
};
