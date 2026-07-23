/**
 * Set to `true` to preview the interface without a backend. While `true`,
 * every read/write in the app is served from the in-memory demo store
 * (src/lib/demo/store.ts) instead of Supabase, and auth is bypassed.
 */
export const DEMO_MODE = false;

export const DEMO_USER = {
  name: "Alex Rivera",
  email: "alex@demoagency.com",
};
