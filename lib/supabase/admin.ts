import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

/**
 * Service-role Supabase client for server-side operations that have no
 * incoming request (e.g. webhook handlers, cron jobs, scripts).
 * Bypasses Row Level Security — use only in trusted server code.
 * NEVER import this in Client Components.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/** Pre-built admin client instance for direct imports */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
