"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  MoreVertical,
  Pencil,
  Pause,
  Play,
  Trash2,
  Video,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Tables } from "@/lib/supabase/types"

const VIDEO_STYLE_IMAGES: Record<string, string> = {
  realistic: "/video-style/realistic.png",
  cinematic: "/video-style/cinematic.png",
  anime: "/video-style/anime.png",
  "3d-render": "/video-style/3d-render.png",
  cyberpunk: "/video-style/cyberpunk.png",
  gta: "/video-style/gta.png",
}

interface SeriesCardProps {
  series: Tables<"video_series">
  onEdit: (series: Tables<"video_series">) => void
  onToggleStatus: (id: string, currentStatus: string) => void
  onDelete: (id: string) => void
  onGenerate: (id: string) => void
}

export function SeriesCard({
  series,
  onEdit,
  onToggleStatus,
  onDelete,
  onGenerate,
}: SeriesCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const thumbnail =
    VIDEO_STYLE_IMAGES[series.video_style ?? ""] ??
    "/video-style/realistic.png"

  const isPaused = series.status === "paused"

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-9/16 w-full overflow-hidden bg-muted">
        <Image
          src={thumbnail}
          alt={series.series_name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Paused overlay */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-yellow-500/90 px-3 py-1 text-xs font-semibold text-white">
              Paused
            </span>
          </div>
        )}

        {/* Edit icon — top right */}
        <button
          onClick={() => onEdit(series)}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
          title="Edit series"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
            {series.series_name}
          </h3>

          {/* More options popover */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <MoreVertical className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1">
              <button
                onClick={() => {
                  setPopoverOpen(false)
                  onEdit(series)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  setPopoverOpen(false)
                  onToggleStatus(series.id, series.status)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent"
              >
                {isPaused ? (
                  <>
                    <Play className="size-3.5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="size-3.5" />
                    Pause
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setPopoverOpen(false)
                  onDelete(series.id)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </PopoverContent>
          </Popover>
        </div>

        <p className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(series.created_at), { addSuffix: true })}
        </p>

        {/* Bottom actions */}
        <div className="mt-auto flex items-center gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            asChild
          >
            <Link href={`/dashboard/series/${series.id}/videos`}>
              <Video className="size-3.5" />
              Videos
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-blue-600 text-xs text-white hover:bg-blue-700"
            onClick={() => onGenerate(series.id)}
          >
            <Sparkles className="size-3.5" />
            Generate
          </Button>
        </div>
      </div>
    </div>
  )
}
