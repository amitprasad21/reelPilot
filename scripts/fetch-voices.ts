import { config } from "dotenv"
config({ path: ".env.local" })

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
if (!ELEVENLABS_API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY in environment")
  process.exit(1)
}

// ── Accent → Language mapping ───────────────────
const accentLanguageMap: Record<string, string> = {
  american: "en-US",
  british: "en-GB",
  australian: "en-AU",
  indian: "en-IN",
  german: "de-DE",
  french: "fr-FR",
  spanish: "es-ES",
  italian: "it-IT",
  japanese: "ja-JP",
}

function accentToLanguage(accent?: string): string {
  if (!accent) return "en-US"
  return accentLanguageMap[accent.toLowerCase()] ?? "en-US"
}

interface ElevenLabsVoice {
  voice_id: string
  name: string
  labels?: Record<string, string>
}

interface CleanVoice {
  voice_id: string
  name: string
  gender: string
  language: string
  provider: string
}

async function fetchVoices(): Promise<void> {
  console.log("Fetching voices from ElevenLabs...")

  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": ELEVENLABS_API_KEY! },
  })

  if (!res.ok) {
    console.error(`ElevenLabs API error: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const data = (await res.json()) as { voices: ElevenLabsVoice[] }

  const cleaned: CleanVoice[] = data.voices.map((v) => {
    const accent = v.labels?.accent?.toLowerCase()
    const language = accentToLanguage(accent)
    console.log("Voice:", v.name, "Accent:", accent ?? "none", "Language:", language)
    return {
      voice_id: v.voice_id,
      name: v.name,
      gender: v.labels?.gender ?? "unknown",
        language,
      provider: "elevenlabs",
    }
  })

  console.log("Saving voices.json...")

  const { writeFileSync } = await import("fs")
  const { join, dirname } = await import("path")
  const { fileURLToPath } = await import("url")

  const __dirname = dirname(fileURLToPath(import.meta.url))
  const outPath = join(__dirname, "voices.json")
  writeFileSync(outPath, JSON.stringify(cleaned, null, 2), "utf-8")

  console.log(`Saved ${cleaned.length} voices → scripts/voices.json`)
}

fetchVoices()
