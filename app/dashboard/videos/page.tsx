"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

type VideoAsset = {
  id: string
  series_id: string
  title: string
  created_at: string
  status: "pending" | "completed" | "failed"
  images_json: unknown
}

function getThumbnail(imagesJson: unknown): string | null {
  if (!Array.isArray(imagesJson) || imagesJson.length === 0) {
    return null
  }

  const first = imagesJson[0] as { publicUrl?: string } | null
  if (!first || typeof first.publicUrl !== "string") {
    return null
  }

  return first.publicUrl
}

export default function VideosPage() {
  const searchParams = useSearchParams()
  const seriesId = searchParams.get("seriesId")
  const [items, setItems] = useState<VideoAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let stopped = false

    async function fetchVideos(isInitial = false) {
      try {
        const query = seriesId ? `?seriesId=${encodeURIComponent(seriesId)}` : ""
        const res = await fetch(`/api/videos${query}`, { cache: "no-store" })
        if (!res.ok) {
          return
        }

        const data = (await res.json()) as VideoAsset[]
        if (!stopped) {
          setItems(data)
          if (isInitial) {
            setLoading(false)
          }
        }
      } finally {
        if (isInitial && !stopped) {
          setLoading(false)
        }
      }
    }

    void fetchVideos(true)
    const interval = setInterval(() => {
      void fetchVideos(false)
    }, 5000)

    return () => {
      stopped = true
      clearInterval(interval)
    }
  }, [seriesId])

  const hasGenerating = useMemo(() => items.some((i) => i.status === "pending"), [items])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Videos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generated videos for your series.
        </p>
        {hasGenerating && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            <Spinner className="size-3.5" />
            Generation in progress. This list auto-refreshes.
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl border border-border bg-muted"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No generated videos yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const thumbnail = getThumbnail(item.images_json)

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="relative aspect-video bg-muted">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No thumbnail yet
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 text-sm font-semibold text-foreground">
                      {item.title}
                    </h2>
                    <Badge
                      variant={item.status === "completed" ? "secondary" : item.status === "failed" ? "destructive" : "outline"}
                      className="shrink-0"
                    >
                      {item.status === "pending" ? (
                        <span className="inline-flex items-center gap-1">
                          <Spinner className="size-3" />
                          Generating
                        </span>
                      ) : item.status === "completed" ? (
                        "Completed"
                      ) : (
                        "Failed"
                      )}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Created {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
