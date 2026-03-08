import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { LayoutDashboard } from "lucide-react"
import { syncUser } from "@/lib/actions/sync-user"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Sync Clerk user → Supabase profiles on every visit (upsert is idempotent)
  await syncUser()

  const user = await currentUser()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <LayoutDashboard className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back,{" "}
              <span className="font-medium text-foreground">
                {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "Creator"}
              </span>
              !
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-500/10">
            <LayoutDashboard className="size-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold">Your dashboard is being built</h2>
          <p className="mt-2 text-muted-foreground">
            Video series, AI generation, and scheduling tools are coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
