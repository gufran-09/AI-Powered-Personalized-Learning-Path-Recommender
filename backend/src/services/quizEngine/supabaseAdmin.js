/**
 * Supabase Admin Client (Server-Side)
 *
 * Uses service role key for backend operations.
 * NEVER use this client on the frontend.
 *
 * @version 1.0.0
 * @author Person 2 - Quiz Engine Team
 */

import { createClient } from "@supabase/supabase-js";

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  console.warn("Warning: SUPABASE_URL not set. Using placeholder.");
}

/**
 * Admin client with service role key (bypasses RLS)
 * Use ONLY on backend/server-side code
 */
export const supabaseAdmin = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY || "placeholder-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Public client (respects RLS)
 * Can be used on frontend
 */
export const supabasePublic = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-key",
);

/**
 * Get admin client (factory function)
 */
export function getAdminClient() {
  if (!SUPABASE_SERVICE_KEY) {
    console.warn(
      "Warning: SUPABASE_SERVICE_KEY not set. Admin operations may fail.",
    );
  }
  return supabaseAdmin;
}

/**
 * Check if service role key is configured
 */
export function hasServiceKey() {
  return !!SUPABASE_SERVICE_KEY;
}

export default supabaseAdmin;
