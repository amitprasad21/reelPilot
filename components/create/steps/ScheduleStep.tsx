"use client"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
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
  "06:00",
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "22:00",
]

const WEEKDAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const

export interface ScheduleDetails {
  seriesName: string
  duration: string
  platforms: string[]
  repeatType: "once" | "weekly"
  publishDate: Date | null
  publishTime: string
  repeatDays: string[]
}

interface ScheduleStepProps {
  details: ScheduleDetails
  onChange: (details: ScheduleDetails) => void
  onSchedule: () => void
  canSchedule: boolean
  submitting?: boolean
  isEditing?: boolean
}

export function ScheduleStep({
  details,
  onChange,
  onSchedule,
  canSchedule,
  submitting = false,
  isEditing = false,
}: ScheduleStepProps) {
  function update(partial: Partial<ScheduleDetails>) {
    onChange({ ...details, ...partial })
  }

  function togglePlatform(platformId: string) {
    const platforms = details.platforms.includes(platformId)
      ? details.platforms.filter((p) => p !== platformId)
      : [...details.platforms, platformId]
    update({ platforms })
  }

  function toggleWeekday(dayId: string) {
    const repeatDays = details.repeatDays.includes(dayId)
      ? details.repeatDays.filter((d) => d !== dayId)
      : [...details.repeatDays, dayId]
    update({ repeatDays })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Schedule</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your series and set your publish schedule.
        </p>
      </div>

      {/* Series Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="series-name" className="text-sm font-medium text-foreground">
          Series Name
        </label>
        <input
          id="series-name"
          type="text"
          value={details.seriesName}
          onChange={(e) => update({ seriesName: e.target.value })}
          placeholder="e.g. Daily Motivation Shorts"
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
        />
      </div>

      {/* Video Duration */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Video Duration</label>
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
        <label className="text-sm font-medium text-foreground">Platforms</label>
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
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
                )}
              >
                <span>{platform.icon}</span>
                {platform.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Repeat Schedule */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Repeat Schedule</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => update({ repeatType: "once", repeatDays: [] })}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all",
              details.repeatType === "once"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full border-2",
                details.repeatType === "once"
                  ? "border-blue-500"
                  : "border-muted-foreground/40"
              )}
            >
              {details.repeatType === "once" && (
                <span className="size-2 rounded-full bg-blue-500" />
              )}
            </span>
            One Time
          </button>
          <button
            type="button"
            onClick={() => update({ repeatType: "weekly", publishDate: null })}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all",
              details.repeatType === "weekly"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full border-2",
                details.repeatType === "weekly"
                  ? "border-blue-500"
                  : "border-muted-foreground/40"
              )}
            >
              {details.repeatType === "weekly" && (
                <span className="size-2 rounded-full bg-blue-500" />
              )}
            </span>
            Weekly
          </button>
        </div>
      </div>

      {/* Publish Date — only for One Time */}
      {details.repeatType === "once" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Publish Date</label>
          <div className="rounded-lg border border-border p-1 w-fit">
            <Calendar
              mode="single"
              selected={details.publishDate ?? undefined}
              onSelect={(date) => update({ publishDate: date ?? null })}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>
        </div>
      )}

      {/* Publish Time */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
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
      </div>

      {/* Weekly Day Selector — only for Weekly */}
      {details.repeatType === "weekly" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Repeat Weekly On
          </label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const isSelected = details.repeatDays.includes(day.id)
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleWeekday(day.id)}
                  className={cn(
                    "rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
                  )}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950">
        <Info className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Video will generate 3–6 hours before publish.
        </p>
      </div>

      {/* Schedule Button */}
      <button
        type="button"
        onClick={onSchedule}
        disabled={!canSchedule || submitting}
        className={cn(
          "w-full rounded-lg py-3 text-sm font-semibold transition-all",
          canSchedule && !submitting
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {submitting
          ? isEditing ? "Saving…" : "Scheduling…"
          : isEditing ? "Save Changes" : "Schedule Series"}
      </button>
    </div>
  )
}
