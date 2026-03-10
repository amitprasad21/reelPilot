import { LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your video series, AI generation, and scheduling.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950">
          <LayoutDashboard className="size-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Your dashboard is being built
        </h2>
        <p className="mt-2 text-muted-foreground">
          Video series, AI generation, and scheduling tools are coming soon.
        </p>
      </div>
    </div>
  )
}

