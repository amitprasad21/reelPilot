"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SeriesCard } from "@/components/dashboard/SeriesCard"
import type { Tables } from "@/lib/supabase/types"

export default function DashboardPage() {
  const router = useRouter()
  const [seriesList, setSeriesList] = useState<Tables<"video_series">[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSeries = useCallback(async () => {
    try {
      const res = await fetch("/api/series")
      if (res.ok) {
        const data = await res.json()
        setSeriesList(data)
      }
    } catch (err) {
      console.error("Failed to fetch series:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "paused" : "active"
    const res = await fetch("/api/series", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    })
    if (res.ok) {
      setSeriesList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this series?")) return
    const res = await fetch(`/api/series?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    if (res.ok) {
      setSeriesList((prev) => prev.filter((s) => s.id !== id))
    }
  }

  function handleEdit(series: Tables<"video_series">) {
    router.push(`/dashboard/create?edit=${series.id}`)
  }

  function handleGenerate(id: string) {
    // Trigger video generation (placeholder — hook into generation pipeline)
    console.log("Generate video for series:", id)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your video series, AI generation, and scheduling.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-9/16 animate-pulse rounded-xl border border-border bg-muted"
            />
          ))}
        </div>
      </div>
    )
  }

  if (seriesList.length === 0) {
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
            No series yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Create your first AI-powered video series to get started.
          </p>
          <Button asChild className="mt-6 gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/dashboard/create">
              <Plus className="size-4" />
              Create New Series
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your video series, AI generation, and scheduling.
          </p>
        </div>
        <Button asChild className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/dashboard/create">
            <Plus className="size-4" />
            New Series
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {seriesList.map((series) => (
          <SeriesCard
            key={series.id}
            series={series}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onGenerate={handleGenerate}
          />
        ))}
      </div>
    </div>
  )
}

