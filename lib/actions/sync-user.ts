"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Upserts the currently signed-in Clerk user into the Supabase `profiles` table.
 * Call this server action from any Server Component after the user signs in/up.
 * Uses the admin client so it works even before the profile row exists.
 */
export async function syncUser() {
  const user = await currentUser()
  if (!user) return

  const email = user.emailAddresses?.[0]?.emailAddress ?? null
  const full_name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null
  const avatar_url = user.imageUrl ?? null

  const supabase = createAdminClient()

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email,
      full_name,
      avatar_url,
    },
    { onConflict: "id" }
  )

  if (error) {
    console.error("[syncUser] Supabase upsert error:", error.message)
  }
}
