"use client"

import { cn } from "@/lib/utils"
import { Clock, Info } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: "▶" },
  { id: "tiktok", label: "TikTok", icon: "♪" },
  { id: "instagram", label: "Instagram", icon: "📷" },
  { id: "email", label: "Email", icon: "✉" },
] as const

const PUBLISH_TIMES = [
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
]

export interface SeriesDetails {
  seriesName: string
  duration: string
  platforms: string[]
  publishTime: string
}

interface SeriesDetailsFormProps {
  details: SeriesDetails
  onChange: (details: SeriesDetails) => void
  onSchedule: () => void
  canSchedule: boolean
}

export function SeriesDetailsForm({
  details,
  onChange,
  onSchedule,
  canSchedule,
}: SeriesDetailsFormProps) {
  function update(partial: Partial<SeriesDetails>) {
    onChange({ ...details, ...partial })
  }

  function togglePlatform(platformId: string) {
    const platforms = details.platforms.includes(platformId)
      ? details.platforms.filter((p) => p !== platformId)
      : [...details.platforms, platformId]
    update({ platforms })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Series Details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure your series name, duration, platform and publish schedule.
        </p>
      </div>

      {/* Series Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="series-name" className="text-sm font-medium text-slate-700">
          Series Name
        </label>
        <input
          id="series-name"
          type="text"
          value={details.seriesName}
          onChange={(e) => update({ seriesName: e.target.value })}
          placeholder="e.g. Daily Motivation Shorts"
          className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Video Duration */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Video Duration</label>
        <Select
          value={details.duration}
          onValueChange={(val) => update({ duration: val })}
        >
          <SelectTrigger className="h-11 w-full">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30-50">30 – 50 seconds</SelectItem>
            <SelectItem value="60-70">60 – 70 seconds</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Platform</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLATFORMS.map((platform) => {
            const isSelected = details.platforms.includes(platform.id)
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <span>{platform.icon}</span>
                {platform.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Publish Time */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            Publish Time
          </span>
        </label>
        <Select
          value={details.publishTime}
          onValueChange={(val) => update({ publishTime: val })}
        >
          <SelectTrigger className="h-11 w-full">
            <SelectValue placeholder="Select publish time" />
          </SelectTrigger>
          <SelectContent>
            {PUBLISH_TIMES.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-1 flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <Info className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700">
            Video will generate 3–6 hours before video publish.
          </p>
        </div>
      </div>

      {/* Schedule Button */}
      <button
        type="button"
        onClick={onSchedule}
        disabled={!canSchedule}
        className={cn(
          "mt-2 w-full rounded-lg py-3 text-sm font-semibold transition-all",
          canSchedule
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        )}
      >
        Schedule Series
      </button>
    </div>
  )
}
