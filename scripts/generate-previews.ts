import { config } from "dotenv"
config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── ENV ──────────────────────────────────────────────
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

for (const [k, v] of Object.entries({
  ELEVENLABS_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_KEY,
})) {
  if (!v) {
    console.error(`Missing ${k} in environment`)
    process.exit(1)
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Preview messages pool ───────────────────────────
const previewMessages = [
  "Hello! This AI voice can narrate your videos with natural clarity.",
  "Welcome to ReelPilot, where AI voices bring your stories to life.",
  "This is an example of an AI narration voice used for video storytelling.",
  "Hi there! I'm an AI voice designed to power modern video content.",
  "Imagine your ideas turning into narrated videos with this AI voice.",
  "Create engaging stories with this expressive AI voice for your videos.",
  "This voice is perfect for short videos, tutorials, and storytelling.",
  "Bring your video ideas to life with natural sounding AI narration.",
]

function pickMessage(index: number): string {
  return previewMessages[index % previewMessages.length]
}

// ── Types ───────────────────────────────────────────
interface VoiceEntry {
  voice_id: string
  name: string
  gender: string
  language: string
  provider: string
  preview_file?: string
  supported_languages?: string[]
}

// ── Helpers ─────────────────────────────────────────
function sanitiseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

async function generateAudio(voiceId: string, text: string): Promise<Buffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    }
  )

  if (!res.ok) {
    throw new Error(`TTS error for ${voiceId}: ${res.status} ${res.statusText}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

async function uploadToStorage(fileName: string, buffer: Buffer): Promise<string> {
  const { error: uploadError } = await supabase.storage
    .from("voices")
    .upload(fileName, buffer, {
      contentType: "audio/mpeg",
      upsert: true,
    })

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

  const { data } = supabase.storage.from("voices").getPublicUrl(fileName)
  return data.publicUrl
}

// ── Main ────────────────────────────────────────────
async function generatePreviews(): Promise<void> {
  const voicesPath = join(__dirname, "voices.json")
  let voices: VoiceEntry[]
  try {
    voices = JSON.parse(readFileSync(voicesPath, "utf-8"))
  } catch {
    console.error("Could not read scripts/voices.json — run `npm run fetch:voices` first.")
    process.exit(1)
  }

  console.log(`Processing ${voices.length} voices…\n`)

  let created = 0
  let skipped = 0

  for (let i = 0; i < voices.length; i++) {
    const voice = voices[i]
    const label = `[${i + 1}/${voices.length}] ${voice.name}`

    // For voices with supported_languages, insert one row per language
    const languagesToInsert = voice.supported_languages && voice.supported_languages.length > 0
      ? voice.supported_languages
      : [voice.language]

    for (const lang of languagesToInsert) {
      const voiceIdForLang = languagesToInsert.length > 1
        ? `${voice.voice_id}-${lang}`
        : voice.voice_id

      // Duplicate check
      const { data: existing } = await supabase
        .from("voices")
        .select("voice_id")
        .eq("voice_id", voiceIdForLang)
        .single()

      if (existing) {
        console.log(`${label} [${lang}] — already exists, skipping`)
        skipped++
        continue
      }

      try {
        let publicUrl: string

        if (voice.provider === "elevenlabs") {
          // Generate audio via ElevenLabs TTS
          const message = pickMessage(i)
          console.log(`Generating preview for ${voice.name}...`)
          const audioBuffer = await generateAudio(voice.voice_id, message)

          const fileName = `${sanitiseName(voice.name)}.mp3`
          console.log(`Uploading preview...`)
          publicUrl = await uploadToStorage(fileName, audioBuffer)
        } else {
          // Deepgram / Fonadlab: use existing local preview file
          if (voice.preview_file) {
            const localPath = join(__dirname, "..", "public", "voice", voice.preview_file)
            const buffer = readFileSync(localPath)
            const ext = voice.preview_file.endsWith(".wav") ? "wav" : "mp3"
            const contentType = ext === "wav" ? "audio/wav" : "audio/mpeg"
            const fileName = voice.preview_file

            const { error: uploadError } = await supabase.storage
              .from("voices")
              .upload(fileName, buffer, { contentType, upsert: true })

            if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

            const { data } = supabase.storage.from("voices").getPublicUrl(fileName)
            publicUrl = data.publicUrl
          } else {
            // No preview available — use a placeholder
            publicUrl = ""
          }
        }

        // Insert metadata into voices table
        const { error: insertError } = await supabase.from("voices").insert({
          name: voice.name,
          language: lang,
          gender: voice.gender,
          provider: voice.provider,
          voice_id: voiceIdForLang,
          preview_url: publicUrl,
        })

        if (insertError) {
          console.error(`${label} [${lang}] — DB insert failed: ${insertError.message}`)
          continue
        }

        created++
        console.log(`${label} [${lang}] — inserted ✓`)
      } catch (err) {
        console.error(`${label} [${lang}] — failed:`, err instanceof Error ? err.message : err)
      }

      // Rate-limit: small delay between API calls
      if (voice.provider === "elevenlabs") {
        await new Promise((r) => setTimeout(r, 500))
      }
    }
  }

  console.log(`\nFinished: ${created} created, ${skipped} skipped`)
}

generatePreviews()
