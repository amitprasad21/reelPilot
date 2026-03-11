import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { syncUser } from "@/lib/actions/sync-user"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Sync Clerk user → Supabase profiles (idempotent upsert)
  await syncUser()

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
