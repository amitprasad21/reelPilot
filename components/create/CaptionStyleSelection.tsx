"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { CAPTION_STYLES, type CaptionStyle } from "@/lib/data/caption-styles"

interface CaptionStyleSelectionProps {
  selectedStyle: string | null
  onSelectStyle: (styleId: string) => void
}

export function CaptionStyleSelection({
  selectedStyle,
  onSelectStyle,
}: CaptionStyleSelectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Caption Style</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose an animated caption style for your videos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CAPTION_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.id)}
              className={cn(
                "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all",
                isSelected
                  ? "border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-200"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              {/* Animated preview */}
              <CaptionPreview style={style} />

              {/* Label */}
              <div
                className={cn(
                  "px-2 py-2 text-center text-sm font-medium border-t transition-colors",
                  isSelected
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white text-slate-700 border-slate-100"
                )}
              >
                {style.name}
              </div>

              {/* Selected badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Renders an animated preview of the caption style on a dark 9:16 card */
function CaptionPreview({ style }: { style: CaptionStyle }) {
  // Restart animation on a loop by toggling a key
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setCycle((c) => c + 1), 2400)
    return () => clearInterval(interval)
  }, [])

  const previewText = "Your Story"

  // Build inline styles from the caption style definition
  const textStyle: React.CSSProperties = {
    color: style.color,
    fontWeight: style.fontWeight,
    fontSize: 15,
    WebkitTextStroke: style.textStroke
      ? style.textStroke.replace("2px", "1px")
      : undefined,
    textShadow: style.textShadow || "0 2px 8px rgba(0,0,0,0.9)",
    animation: style.animation,
  }

  // For highlight style, wrap words with background
  if (style.wordBackground) {
    return (
      <div
        className="flex items-center justify-center px-3"
        style={{ aspectRatio: "9/8", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
      >
        <style>{style.keyframes}</style>
        <span
          key={cycle}
          style={{
            ...textStyle,
            backgroundColor: style.wordBackground,
            borderRadius: style.wordBorderRadius,
            padding: style.wordPadding,
            display: "inline-block",
          }}
        >
          {previewText}
        </span>
      </div>
    )
  }

  // For wave style, animate each letter with staggered delay
  if (style.id === "wave") {
    return (
      <div
        className="flex items-center justify-center px-3"
        style={{ aspectRatio: "9/8", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
      >
        <style>{style.keyframes}</style>
        <span style={{ display: "inline-flex" }} key={cycle}>
          {previewText.split("").map((char, i) => (
            <span
              key={i}
              style={{
                ...textStyle,
                animationDelay: `${i * 0.06}s`,
                display: "inline-block",
                minWidth: char === " " ? "0.25em" : undefined,
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </div>
    )
  }

  // Default: single animated block
  return (
    <div
      className="flex items-center justify-center px-3"
      style={{ aspectRatio: "9/8", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
    >
      <style>{style.keyframes}</style>
      <span key={cycle} style={textStyle}>
        {previewText}
      </span>
    </div>
  )
}
