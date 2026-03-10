"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Check, Play, Pause, Music } from "lucide-react"

interface BgTrack {
  id: string
  name: string
  url: string
}

const BG_TRACKS: BgTrack[] = [
  {
    id: "reels-marketing-1",
    name: "Instagram Reels Marketing",
    url: "https://ik.imagekit.io/Tubeguruji/BgMusic/instagram-reels-marketing-music-384448.mp3",
  },
  {
    id: "basketball-reels",
    name: "Basketball Reels",
    url: "https://ik.imagekit.io/Tubeguruji/BgMusic/basketball-instagram-reels-music-461852.mp3",
  },
  {
    id: "trending-reels",
    name: "Trending Reels",
    url: "https://ik.imagekit.io/Tubeguruji/BgMusic/trending-instagram-reels-music-447249.mp3",
  },
  {
    id: "reels-marketing-2",
    name: "Reels Marketing Upbeat",
    url: "https://ik.imagekit.io/Tubeguruji/BgMusic/instagram-reels-marketing-music-469052.mp3",
  },
  {
    id: "dramatic-hiphop",
    name: "Dramatic Hip-Hop Jazz",
    url: "https://ik.imagekit.io/Tubeguruji/BgMusic/dramatic-hip-hop-music-background-jazz-music-for-short-video-148505.mp3",
  },
]

interface BackgroundMusicSelectionProps {
  selectedTracks: string[]
  onToggleTrack: (trackId: string) => void
}

export function BackgroundMusicSelection({
  selectedTracks,
  onToggleTrack,
}: BackgroundMusicSelectionProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function handlePlayPause(track: BgTrack) {
    // If already playing this track, pause it
    if (playingId === track.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(track.url)
    audioRef.current = audio
    setPlayingId(track.id)

    audio.play().catch(() => setPlayingId(null))
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => setPlayingId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Background Music</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select one or more background tracks for your videos. Preview before selecting.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {BG_TRACKS.map((track) => {
          const isSelected = selectedTracks.includes(track.id)
          const isPlaying = playingId === track.id

          return (
            <div
              key={track.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              {/* Play / Pause button */}
              <button
                type="button"
                onClick={() => handlePlayPause(track)}
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  isPlaying
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4 ml-0.5" />
                )}
              </button>

              {/* Track info */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Music className="size-4 shrink-0 text-slate-400" />
                <span className="truncate text-sm font-medium text-slate-700">
                  {track.name}
                </span>
              </div>

              {/* Select checkbox */}
              <button
                type="button"
                onClick={() => onToggleTrack(track.id)}
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white hover:border-slate-400"
                )}
              >
                {isSelected && <Check className="size-3.5" strokeWidth={3} />}
              </button>
            </div>
          )
        })}
      </div>

      {selectedTracks.length > 0 && (
        <p className="text-xs text-slate-500">
          {selectedTracks.length} track{selectedTracks.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  )
}
