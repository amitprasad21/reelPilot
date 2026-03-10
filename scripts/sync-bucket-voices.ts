import { config } from "dotenv"
config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"

// ── ENV ──────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

for (const [k, v] of Object.entries({
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

// ── Parse filename ──────────────────────────────────
// Expected format: {provider}-{voicename}-{gender}-{langcode}.{ext}
// Example: fonadlab-vaanee-female-hi-IN.mp3
//          deepgram-odysseus-male-en-US.wav
//          elevenlabs-roger-male-en-US.mp3
function parseFileName(fileName: string) {
  // Remove extension
  const base = fileName.replace(/\.[^.]+$/, "")
  // Match: provider-name-gender-xx-XX
  const match = base.match(/^([a-z0-9]+)-([a-z0-9]+)-(male|female|neutral)-([a-z]{2}-[A-Z]{2})$/)
  if (!match) return null
  return {
    provider: match[1],
    voiceName: match[2],
    gender: match[3],
    language: match[4],
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Main ────────────────────────────────────────────
async function syncBucketVoices(): Promise<void> {
  console.log("Listing files in 'voices' bucket…\n")

  const { data: files, error: listError } = await supabase.storage
    .from("voices")
    .list("", { limit: 1000 })

  if (listError) {
    console.error("Failed to list bucket:", listError.message)
    process.exit(1)
  }

  if (!files || files.length === 0) {
    console.log("No files found in the voices bucket.")
    return
  }

  let created = 0
  let skipped = 0
  let failed = 0

  for (const file of files) {
    // Skip folders
    if (!file.name || file.name.endsWith("/")) continue

    const parsed = parseFileName(file.name)
    if (!parsed) {
      console.log(`⊘ Skipping "${file.name}" — doesn't match naming convention`)
      skipped++
      continue
    }

    const voiceId = `${parsed.provider}-${parsed.voiceName}-${parsed.language}`
    const displayName = `${capitalize(parsed.voiceName)} - ${capitalize(parsed.gender)}`

    // Duplicate check
    const { data: existing } = await supabase
      .from("voices")
      .select("voice_id")
      .eq("voice_id", voiceId)
      .single()

    if (existing) {
      console.log(`⊘ "${voiceId}" already in DB, skipping`)
      skipped++
      continue
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("voices").getPublicUrl(file.name)
    const publicUrl = urlData.publicUrl

    // Insert
    const { error: insertError } = await supabase.from("voices").insert({
      voice_id: voiceId,
      name: displayName,
      language: parsed.language,
      gender: parsed.gender,
      provider: parsed.provider,
      preview_url: publicUrl,
    })

    if (insertError) {
      console.error(`✗ "${voiceId}" — insert failed: ${insertError.message}`)
      failed++
      continue
    }

    created++
    console.log(`✓ "${voiceId}" → ${parsed.language} (${parsed.gender})`)
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${failed} failed`)
}

syncBucketVoices()
