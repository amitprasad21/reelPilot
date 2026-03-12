"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepperProgress } from "@/components/create/StepperProgress"
import { NicheSelection } from "@/components/create/NicheSelection"
import { LanguageVoiceSelection } from "@/components/create/LanguageVoiceSelection"
import { BackgroundMusicSelection } from "@/components/create/BackgroundMusicSelection"
import { VideoStyleSelection } from "@/components/create/VideoStyleSelection"
import { CaptionStyleSelection } from "@/components/create/CaptionStyleSelection"
import { ScheduleStep, type ScheduleDetails } from "@/components/create/steps/ScheduleStep"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { LanguageOption } from "@/lib/data/languages"
import { Language } from "@/lib/data/languages"

export default function CreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const isEditing = !!editId

  const [currentStep, setCurrentStep] = useState(1)
  const [loadingEdit, setLoadingEdit] = useState(isEditing)

  // Step 1 state
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null)
  const [customNiche, setCustomNiche] = useState("")

  // Step 2 state
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<{
    id: string
    voice_id: string
    name: string
    language: string
    gender: string
    tone: string | null
    provider: string
    preview_url: string
  } | null>(null)

  // Step 3 state
  const [selectedBgTracks, setSelectedBgTracks] = useState<string[]>([])

  // Step 4 state
  const [selectedVideoStyle, setSelectedVideoStyle] = useState<string | null>(null)

  // Step 5 state
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState<string | null>(null)

  // Step 6 state
  const [scheduleDetails, setScheduleDetails] = useState<ScheduleDetails>({
    seriesName: "",
    duration: "",
    platforms: [],
    repeatType: "once",
    publishDate: null,
    publishTime: "",
    repeatDays: [],
  })

  const [submitting, setSubmitting] = useState(false)

  // Fetch series data when editing
  useEffect(() => {
    if (!editId) return
    async function fetchSeries() {
      try {
        const res = await fetch(`/api/series?id=${encodeURIComponent(editId!)}`)
        if (!res.ok) {
          router.push("/dashboard")
          return
        }
        const series = await res.json()

        // Pre-fill step 1
        const knownNiches = [
          "scary-stories", "motivational", "did-you-know", "history-stories",
          "life-lessons", "mystery-unsolved", "finance-tips", "philosophy",
          "true-crime", "sleep-stories",
        ]
        if (series.niche && knownNiches.includes(series.niche)) {
          setSelectedNiche(series.niche)
        } else if (series.niche) {
          setCustomNiche(series.niche)
        }

        // Pre-fill step 2
        if (series.language) {
          const lang = Language.find((l) => l.modelLangCode === series.language)
          if (lang) setSelectedLanguage(lang)

          // Fetch voices for this language and pre-select the saved voice
          if (series.voice_id) {
            try {
              const voiceRes = await fetch(
                `/api/voices?language=${encodeURIComponent(series.language)}`
              )
              if (voiceRes.ok) {
                const voices = await voiceRes.json()
                const matchedVoice = voices.find(
                  (v: { voice_id: string }) => v.voice_id === series.voice_id
                )
                if (matchedVoice) setSelectedVoice(matchedVoice)
              }
            } catch {
              // Voice pre-fill failed, user can re-select
            }
          }
        }

        // Pre-fill step 3
        if (series.bg_tracks?.length) {
          setSelectedBgTracks(series.bg_tracks)
        }

        // Pre-fill step 4
        if (series.video_style) {
          setSelectedVideoStyle(series.video_style)
        }

        // Pre-fill step 5
        if (series.caption_style) {
          setSelectedCaptionStyle(series.caption_style)
        }

        // Pre-fill step 6
        setScheduleDetails({
          seriesName: series.series_name || "",
          duration: series.video_duration || "",
          platforms: series.platforms || [],
          repeatType: series.repeat_type || "once",
          publishDate: series.publish_at ? new Date(series.publish_at) : null,
          publishTime: series.publish_at
            ? new Date(series.publish_at).toTimeString().slice(0, 5)
            : "",
          repeatDays: series.repeat_days || [],
        })
      } catch {
        router.push("/dashboard")
      } finally {
        setLoadingEdit(false)
      }
    }
    fetchSeries()
  }, [editId, router])

  function toggleBgTrack(trackId: string) {
    setSelectedBgTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    )
  }

  function handleSelectLanguage(lang: LanguageOption) {
    // Reset voice when switching language
    if (selectedLanguage?.modelLangCode !== lang.modelLangCode) {
      setSelectedVoice(null)
    }
    setSelectedLanguage(lang)
  }

  const canContinue =
    currentStep === 1
      ? selectedNiche !== null || customNiche.trim().length > 0
      : currentStep === 2
      ? selectedLanguage !== null && selectedVoice !== null
      : currentStep === 3
      ? selectedBgTracks.length > 0
      : currentStep === 4
      ? selectedVideoStyle !== null
      : currentStep === 5
      ? selectedCaptionStyle !== null
      : true

  const canSchedule =
    scheduleDetails.seriesName.trim().length > 0 &&
    scheduleDetails.duration !== "" &&
    scheduleDetails.platforms.length > 0 &&
    scheduleDetails.publishTime !== "" &&
    (scheduleDetails.repeatType === "once"
      ? scheduleDetails.publishDate !== null
      : scheduleDetails.repeatDays.length > 0)

  async function handleSchedule() {
    if (submitting) return
    setSubmitting(true)

    try {
      const payload = {
        seriesName: scheduleDetails.seriesName,
        videoDuration: scheduleDetails.duration,
        niche: selectedNiche || customNiche,
        language: selectedLanguage?.modelLangCode ?? "",
        voiceId: selectedVoice?.voice_id ?? "",
        bgTracks: selectedBgTracks,
        videoStyle: selectedVideoStyle ?? "",
        captionStyle: selectedCaptionStyle ?? "",
        platforms: scheduleDetails.platforms,
        repeatType: scheduleDetails.repeatType,
        publishDate: scheduleDetails.publishDate?.toISOString() ?? null,
        publishTime: scheduleDetails.publishTime,
        repeatDays: scheduleDetails.repeatDays,
      }

      let res: Response

      if (isEditing) {
        // Build update body with snake_case keys for Supabase
        let publishAt: string | null = null
        let generateAt: string | null = null

        if (scheduleDetails.repeatType === "once" && scheduleDetails.publishDate) {
          const [hours, minutes] = scheduleDetails.publishTime.split(":").map(Number)
          const pub = new Date(scheduleDetails.publishDate)
          pub.setHours(hours, minutes, 0, 0)
          publishAt = pub.toISOString()

          const gen = new Date(pub)
          gen.setHours(gen.getHours() - 4)
          generateAt = gen.toISOString()
        }

        res = await fetch("/api/series", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editId,
            series_name: payload.seriesName,
            video_duration: payload.videoDuration,
            niche: payload.niche || null,
            language: payload.language || null,
            voice_id: payload.voiceId || null,
            bg_tracks: payload.bgTracks,
            video_style: payload.videoStyle || null,
            caption_style: payload.captionStyle || null,
            platforms: payload.platforms,
            publish_at: publishAt,
            generate_at: generateAt,
            repeat_type: payload.repeatType,
            repeat_days: payload.repeatDays,
          }),
        })
      } else {
        res = await fetch("/api/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

    if (!res.ok) {
      const err = await res.json()
      console.error("Schedule failed:", err.error)
      setSubmitting(false)
      return
    }

    router.push("/dashboard")
    } catch {
      setSubmitting(false)
    }
  }

  function handleContinue() {
    if (currentStep < 6) {
      setCurrentStep((s) => s + 1)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {isEditing ? "Edit Series" : "Create New Series"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditing
            ? "Update the settings for your video series."
            : "Follow the steps below to set up your AI-powered YouTube Shorts series."}
        </p>
      </div>

      {loadingEdit ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12">
          <div className="text-sm text-muted-foreground">Loading series data…</div>
        </div>
      ) : (
      <>
      {/* Stepper */}
      <div className="mb-8 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
        <StepperProgress currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-border bg-card px-6 py-6 shadow-sm">
        {currentStep === 1 && (
          <NicheSelection
            selectedNiche={selectedNiche}
            customNiche={customNiche}
            onSelectNiche={setSelectedNiche}
            onCustomNicheChange={setCustomNiche}
          />
        )}

        {currentStep === 2 && (
          <LanguageVoiceSelection
            selectedLanguage={selectedLanguage}
            selectedVoice={selectedVoice}
            onSelectLanguage={handleSelectLanguage}
            onSelectVoice={setSelectedVoice}
          />
        )}
        {currentStep === 3 && (
          <BackgroundMusicSelection
            selectedTracks={selectedBgTracks}
            onToggleTrack={toggleBgTrack}
          />
        )}
        {currentStep === 4 && (
          <VideoStyleSelection
            selectedStyle={selectedVideoStyle}
            onSelectStyle={setSelectedVideoStyle}
          />
        )}
        {currentStep === 5 && (
          <CaptionStyleSelection
            selectedStyle={selectedCaptionStyle}
            onSelectStyle={setSelectedCaptionStyle}
          />
        )}
        {currentStep === 6 && (
          <ScheduleStep
            details={scheduleDetails}
            onChange={setScheduleDetails}
            onSchedule={handleSchedule}
            canSchedule={canSchedule && !submitting}
            submitting={submitting}
            isEditing={isEditing}
          />
        )}

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            disabled={currentStep === 1}
          >
            ← Back
          </button>

          {currentStep < 6 && (
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  )
}

function StepPlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-2 py-6 text-center">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
      <p className="mt-4 text-xs text-slate-400">This step is coming soon.</p>
    </div>
  )
}
