import { LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your video series, AI generation, and scheduling.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-50">
          <LayoutDashboard className="size-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">
          Your dashboard is being built
        </h2>
        <p className="mt-2 text-slate-500">
          Video series, AI generation, and scheduling tools are coming soon.
        </p>
      </div>
    </div>
  )
}

