"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Language,
  countryCodeToFlag,
  type LanguageOption,
} from "@/lib/data/languages"
import { Check, Play, Pause, Mic, User, Bot, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Shape returned by /api/voices */
interface ApiVoice {
  id: string
  name: string
  language: string
  gender: string
  tone: string | null
  provider: string
  voice_id: string
  preview_url: string
}

interface LanguageVoiceSelectionProps {
  selectedLanguage: LanguageOption | null
  selectedVoice: ApiVoice | null
  onSelectLanguage: (lang: LanguageOption) => void
  onSelectVoice: (voice: ApiVoice) => void
}

export function LanguageVoiceSelection({
  selectedLanguage,
  selectedVoice,
  onSelectLanguage,
  onSelectVoice,
}: LanguageVoiceSelectionProps) {
  const [playingPreview, setPlayingPreview] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ── Fetch voices from API ───────────────────────
  const [voices, setVoices] = useState<ApiVoice[]>([])
  const [loadingVoices, setLoadingVoices] = useState(false)

  useEffect(() => {
    if (!selectedLanguage) {
      setVoices([])
      return
    }
    let cancelled = false
    setLoadingVoices(true)
    fetch(`/api/voices?language=${encodeURIComponent(selectedLanguage.modelLangCode)}`)
      .then((r) => r.json())
      .then((data: ApiVoice[]) => {
        if (!cancelled && Array.isArray(data)) setVoices(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingVoices(false)
      })
    return () => { cancelled = true }
  }, [selectedLanguage])

  function handleLanguageChange(langCode: string) {
    const lang = Language.find((l) => l.modelLangCode === langCode)
    if (!lang) return
    onSelectLanguage(lang)
    stopPreview()
  }

  function stopPreview() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPlayingPreview(null)
  }

  function togglePreview(voice: ApiVoice, e: React.MouseEvent) {
    e.stopPropagation()

    if (playingPreview === voice.voice_id) {
      stopPreview()
      return
    }

    stopPreview()

    const audio = new Audio(voice.preview_url)
    audioRef.current = audio
    setPlayingPreview(voice.voice_id)

    audio.play().catch(() => {
      setPlayingPreview(null)
    })

    audio.addEventListener("ended", () => {
      setPlayingPreview(null)
      audioRef.current = null
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Language & Voice</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose the narration language, then pick an AI voice to match your style.
        </p>
      </div>

      {/* ── Language Dropdown ─────────────────────────── */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Select Language
        </p>
        <Select
          value={selectedLanguage?.modelLangCode ?? ""}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger
            className="w-full sm:w-80 h-11 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
          >
            <SelectValue placeholder="Choose a language…">
              {selectedLanguage && (
                <span className="flex items-center gap-2">
                  <span className="text-lg leading-none">
                    {countryCodeToFlag(selectedLanguage.countryFlag)}
                  </span>
                  <span>{selectedLanguage.language}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-72">
            {Language.map((lang) => (
              <SelectItem key={lang.modelLangCode} value={lang.modelLangCode}>
                <span className="flex items-center gap-2">
                  <span className="text-lg leading-none">
                    {countryCodeToFlag(lang.countryFlag)}
                  </span>
                  <span>{lang.language}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* ── Voice List ────────────────────────────────── */}
      {selectedLanguage && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Select Voice
            </p>
            {loadingVoices && (
              <Loader2 className="size-4 animate-spin text-slate-400" />
            )}
          </div>

          {voices.length === 0 && !loadingVoices && (
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
              <Mic className="size-8 text-slate-300" strokeWidth={1.5} />
              <p className="text-sm text-slate-400">
                No voices available for {selectedLanguage.language} yet.
              </p>
            </div>
          )}

          <div
            className="flex flex-col gap-2 overflow-y-auto pr-0.5"
            style={{ maxHeight: "260px" }}
          >
            {voices.map((voice) => {
              const isSelected = selectedVoice?.voice_id === voice.voice_id
              const isPlaying = playingPreview === voice.voice_id

              return (
                <button
                  key={voice.voice_id}
                  type="button"
                  onClick={() => onSelectVoice(voice)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-left",
                    "transition-all duration-200 ease-in-out active:scale-[0.99]",
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                  )}
                >
                  {/* Voice avatar icon */}
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                      voice.gender === "female"
                        ? isSelected ? "bg-pink-100" : "bg-pink-50"
                        : isSelected ? "bg-blue-100" : "bg-blue-50"
                    )}
                  >
                    <Mic
                      className={cn(
                        "size-5",
                        voice.gender === "female" ? "text-pink-500" : "text-blue-500"
                      )}
                      strokeWidth={1.8}
                    />
                  </div>

                  {/* Voice info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        isSelected ? "text-slate-900" : "text-slate-800"
                      )}
                    >
                      {voice.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {/* Gender badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          voice.gender === "female"
                            ? "bg-pink-100 text-pink-600"
                            : "bg-blue-100 text-blue-600"
                        )}
                      >
                        <User className="size-2.5" />
                        {voice.gender}
                      </span>
                      {/* Tone badge */}
                      {voice.tone && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                          {voice.tone}
                        </span>
                      )}
                      {/* Provider badge */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        <Bot className="size-2.5" />
                        {voice.provider}
                      </span>
                    </div>
                  </div>

                  {/* Preview button */}
                  <button
                    type="button"
                    onClick={(e) => togglePreview(voice, e)}
                    title={isPlaying ? "Stop preview" : "Play preview"}
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-150",
                      isPlaying
                        ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200"
                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="size-4" fill="currentColor" stroke="none" />
                    ) : (
                      <Play className="size-4 translate-x-px" fill="currentColor" stroke="none" />
                    )}
                  </button>

                  {/* Selection check */}
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                      isSelected
                        ? "border-blue-600 bg-blue-600 scale-100 opacity-100"
                        : "border-slate-300 bg-white scale-75 opacity-0 group-hover:scale-90 group-hover:opacity-60"
                    )}
                  >
                    <Check className="size-3 text-white" strokeWidth={3} />
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state when no language selected */}
      {!selectedLanguage && (
        <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
          <Mic className="size-8 text-slate-300" strokeWidth={1.5} />
          <p className="text-sm text-slate-400">Select a language above to see available voices</p>
        </div>
      )}
    </div>
  )
}
