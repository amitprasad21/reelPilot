import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/types"

/**
 * Server (RSC / Server Action / Route Handler) Supabase client.
 * Reads and writes session cookies via next/headers — never use in Client Components.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll is called from a Server Component — cookies can only
            // be mutated inside Server Actions or Route Handlers. Ignore
            // the error here; the middleware will handle token refresh.
          }
        },
      },
    }
  )
}

/**
 * Admin (service-role) Supabase client — bypasses Row Level Security.
 * ONLY use in trusted server-side code (Route Handlers, Server Actions).
 * NEVER import this in Client Components or expose to the browser.
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Admin client does not need to persist session cookies
        },
      },
    }
  )
}
