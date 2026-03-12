"use server"

import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

interface ScheduleSeriesInput {
  seriesName: string
  videoDuration: string
  niche: string
  language: string
  voiceId: string
  bgTracks: string[]
  videoStyle: string
  captionStyle: string
  platforms: string[]
  repeatType: "once" | "weekly"
  publishDate: string | null // ISO string
  publishTime: string        // "HH:mm"
  repeatDays: string[]
}

export async function scheduleSeries(input: ScheduleSeriesInput) {
  const { userId } = await auth()
  if (!userId) {
    return { error: "Not authenticated" }
  }

  let publishAt: Date | null = null
  let generateAt: Date | null = null

  if (input.repeatType === "once" && input.publishDate) {
    const [hours, minutes] = input.publishTime.split(":").map(Number)
    publishAt = new Date(input.publishDate)
    publishAt.setHours(hours, minutes, 0, 0)

    generateAt = new Date(publishAt)
    generateAt.setHours(generateAt.getHours() - 4)
  }

  const supabase = await createClient()

  const { error } = await supabase.from("video_series").insert({
    user_id: userId,
    series_name: input.seriesName,
    video_duration: input.videoDuration,
    niche: input.niche,
    language: input.language,
    voice_id: input.voiceId,
    bg_tracks: input.bgTracks,
    video_style: input.videoStyle,
    caption_style: input.captionStyle,
    platforms: input.platforms,
    publish_at: publishAt?.toISOString() ?? null,
    generate_at: generateAt?.toISOString() ?? null,
    repeat_type: input.repeatType,
    repeat_days: input.repeatDays,
  })

  if (error) {
    console.error("[scheduleSeries] Supabase insert error:", error.message)
    return { error: error.message }
  }

  return { success: true }
}
