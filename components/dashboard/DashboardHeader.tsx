import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"

export async function DashboardHeader() {
  const user = await currentUser()
  const displayName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "Creator"

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">
          Welcome back,{" "}
          <span className="font-semibold text-slate-800">{displayName}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <UserButton />
      </div>
    </header>
  )
}
