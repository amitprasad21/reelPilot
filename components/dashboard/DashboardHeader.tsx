import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { ThemeToggle } from "@/components/theme-toggle"

export async function DashboardHeader() {
  const user = await currentUser()
  const displayName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "Creator"

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Welcome back,{" "}
          <span className="font-semibold text-foreground">{displayName}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  )
}
