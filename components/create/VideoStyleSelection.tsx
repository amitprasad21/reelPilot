"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import Image from "next/image"

export interface VideoStyle {
  id: string
  name: string
  image: string
}

const VIDEO_STYLES: VideoStyle[] = [
  { id: "realistic", name: "Realistic", image: "/video-style/realistic.png" },
  { id: "cinematic", name: "Cinematic", image: "/video-style/cinematic.png" },
  { id: "anime", name: "Anime", image: "/video-style/anime.png" },
  { id: "3d-render", name: "3D Render", image: "/video-style/3d-render.png" },
  { id: "cyberpunk", name: "Cyberpunk", image: "/video-style/cyberpunk.png" },
  { id: "gta", name: "GTA", image: "/video-style/gta.png" },
]

interface VideoStyleSelectionProps {
  selectedStyle: string | null
  onSelectStyle: (styleId: string) => void
}

export function VideoStyleSelection({
  selectedStyle,
  onSelectStyle,
}: VideoStyleSelectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Video Style</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a visual style for your video series.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin">
        {VIDEO_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.id)}
              className={cn(
                "relative shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                isSelected
                  ? "border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-200"
                  : "border-slate-200 hover:border-slate-300"
              )}
              style={{ width: 140 }}
            >
              {/* 9:16 image */}
              <div className="relative" style={{ aspectRatio: "9/16" }}>
                <Image
                  src={style.image}
                  alt={style.name}
                  fill
                  className="object-cover"
                  sizes="140px"
                />

                {/* Selected overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                      <Check className="size-4" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>

              {/* Label */}
              <div
                className={cn(
                  "px-2 py-2 text-center text-sm font-medium transition-colors",
                  isSelected ? "bg-blue-50 text-blue-700" : "bg-white text-slate-700"
                )}
              >
                {style.name}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
