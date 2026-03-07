import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"

/**
 * Browser (client-component) Supabase client.
 * Uses the public anon key — safe to expose.
 * Re-uses the same instance across hot reloads in development.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
