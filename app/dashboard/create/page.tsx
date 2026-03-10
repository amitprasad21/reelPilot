"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepperProgress } from "@/components/create/StepperProgress"
import { NicheSelection } from "@/components/create/NicheSelection"
import { LanguageVoiceSelection } from "@/components/create/LanguageVoiceSelection"
import { BackgroundMusicSelection } from "@/components/create/BackgroundMusicSelection"
import { VideoStyleSelection } from "@/components/create/VideoStyleSelection"
import { CaptionStyleSelection } from "@/components/create/CaptionStyleSelection"
import { ScheduleStep, type ScheduleDetails } from "@/components/create/steps/ScheduleStep"
import { scheduleSeries } from "@/lib/actions/schedule-series"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { LanguageOption } from "@/lib/data/languages"

export default function CreatePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

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
    const result = await scheduleSeries({
      seriesName: scheduleDetails.seriesName,
      videoDuration: scheduleDetails.duration,
      platforms: scheduleDetails.platforms,
      repeatType: scheduleDetails.repeatType,
      publishDate: scheduleDetails.publishDate?.toISOString() ?? null,
      publishTime: scheduleDetails.publishTime,
      repeatDays: scheduleDetails.repeatDays,
    })

    if (result.error) {
      console.error("Schedule failed:", result.error)
      return
    }

    router.push("/dashboard")
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
        <h1 className="text-2xl font-bold text-foreground">Create New Series</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow the steps below to set up your AI-powered YouTube Shorts series.
        </p>
      </div>

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
            canSchedule={canSchedule}
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
