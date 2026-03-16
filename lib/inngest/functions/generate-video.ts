import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/supabase/types"
import { GoogleGenAI } from "@google/genai"

interface GeneratedScene {
  sceneNumber: number
  narration: string
  imagePrompt: string
}

interface GeneratedVideoScript {
  videoTitle: string
  videoScript: string
  durationTarget: string
  scenes: GeneratedScene[]
}

interface CaptionSegment {
  start: number
  end: number
  text: string
}

interface GeneratedCaptionsResult {
  transcript: string
  captions: CaptionSegment[]
}

interface GeneratedImageAsset {
  sceneNumber: number
  prompt: string
  storagePath: string
  publicUrl: string
  mimeType: string
}

type SupportedVoiceProvider = "fonadalabs" | "deepgram" | "elevenlabs"

interface TtsVoiceRecord {
  provider: string
  voice_id: string
  name: string
  language: string | null
}

interface VoiceIdRow {
  voice_id: string
}

interface GeneratedVoiceResult {
  provider: SupportedVoiceProvider
  voiceId: string
  contentType: string
  audioBytes: number
  storagePath?: string
  outputDataUrl?: string
}

interface GeneratedVoiceBinary {
  provider: SupportedVoiceProvider
  voiceId: string
  contentType: string
  audioBase64: string
  audioBytes: number
}

function normalizeProvider(provider?: string | null): SupportedVoiceProvider | null {
  if (!provider) return null
  const value = provider.toLowerCase()
  if (value === "fonada" || value === "fonadalabs") return "fonadalabs"
  if (value === "deepgram") return "deepgram"
  if (value === "elevenlabs") return "elevenlabs"
  return null
}

function mapSeriesLanguageToFonada(language?: string | null): "English" | "Hindi" | "Tamil" | "Telugu" {
  const value = (language ?? "en-US").toLowerCase()
  if (value.startsWith("hi")) return "Hindi"
  if (value.startsWith("ta")) return "Tamil"
  if (value.startsWith("te")) return "Telugu"
  return "English"
}

function splitTextIntoChunks(text: string, maxChars: number): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (!cleaned) return []
  if (cleaned.length <= maxChars) return [cleaned]

  const chunks: string[] = []
  let current = ""

  for (const sentence of cleaned.split(/(?<=[.!?])\s+/)) {
    const next = current ? `${current} ${sentence}` : sentence
    if (next.length <= maxChars) {
      current = next
      continue
    }

    if (current) chunks.push(current)

    if (sentence.length <= maxChars) {
      current = sentence
      continue
    }

    // Hard-wrap very long sentence.
    for (let i = 0; i < sentence.length; i += maxChars) {
      chunks.push(sentence.slice(i, i + maxChars))
    }
    current = ""
  }

  if (current) chunks.push(current)
  return chunks
}

async function synthesizeWithFonadaLabs(
  text: string,
  languageCode: string | null,
  voiceName?: string
): Promise<GeneratedVoiceBinary> {
  const apiKey = process.env.FONADA_API_KEY
  if (!apiKey) {
    throw new Error("Missing FONADA_API_KEY")
  }

  const chunks = splitTextIntoChunks(text, 450)
  if (!chunks.length) {
    throw new Error("No text available for FonadaLabs TTS")
  }

  const fonadaLanguage = mapSeriesLanguageToFonada(languageCode)
  const fonadaVoice = voiceName?.trim() || "Naad"
  const buffers: Buffer[] = []

  for (const chunk of chunks) {
    const res = await fetch("https://api.fonada.ai/tts/generate-audio-large", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: chunk,
        voice: fonadaVoice,
        language: fonadaLanguage,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`FonadaLabs request failed: ${res.status} ${body}`)
    }

    const audio = Buffer.from(await res.arrayBuffer())
    buffers.push(audio)
  }

  const merged = Buffer.concat(buffers)
  return {
    provider: "fonadalabs",
    voiceId: fonadaVoice,
    contentType: "audio/mpeg",
    audioBase64: merged.toString("base64"),
    audioBytes: merged.length,
  }
}

async function synthesizeWithDeepgram(
  text: string,
  model?: string
): Promise<GeneratedVoiceBinary> {
  const apiKey = process.env.DEEPGRAM_API_KEY
  if (!apiKey) {
    throw new Error("Missing DEEPGRAM_API_KEY")
  }

  const resolvedModel = model || "aura-2-asteria-en"
  const res = await fetch(
    `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(resolvedModel)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Deepgram request failed: ${res.status} ${body}`)
  }

  const audio = Buffer.from(await res.arrayBuffer())
  return {
    provider: "deepgram",
    voiceId: resolvedModel,
    contentType: "audio/mpeg",
    audioBase64: audio.toString("base64"),
    audioBytes: audio.length,
  }
}

async function synthesizeWithElevenLabs(
  text: string,
  resolvedVoiceId?: string | null
): Promise<GeneratedVoiceBinary> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error("Missing ELEVENLABS_API_KEY")
  }

  const voiceId = resolvedVoiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID
  if (!voiceId) {
    throw new Error("Missing ElevenLabs voice id")
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5",
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`ElevenLabs request failed: ${res.status} ${body}`)
  }

  const audio = Buffer.from(await res.arrayBuffer())
  return {
    provider: "elevenlabs",
    voiceId,
    contentType: "audio/mpeg",
    audioBase64: audio.toString("base64"),
    audioBytes: audio.length,
  }
}

async function generateImageWithGoogle(
  prompt: string,
  videoStyle?: string | null
): Promise<{ imageBase64: string; mimeType: string }> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY) env variable")
  }

  const ai = new GoogleGenAI({ apiKey })
  const styledPrompt = [
    "Create one high-quality cinematic 9:16 vertical image for short-form video.",
    `Style: ${videoStyle ?? "realistic"}.`,
    "No text overlays, no captions, no logos, no watermarks.",
    prompt,
  ].join(" ")

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: styledPrompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  })

  const candidates = (response as { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }> }).candidates ?? []

  for (const candidate of candidates) {
    const parts = candidate.content?.parts ?? []
    for (const part of parts) {
      const data = part.inlineData?.data
      if (data) {
        return {
          imageBase64: data,
          mimeType: part.inlineData?.mimeType || "image/png",
        }
      }
    }
  }

  throw new Error("Google image generation did not return image data")
}

export const generateVideo = inngest.createFunction(
  { id: "generate-video" },
  { event: "video/generate" },
  async ({ event, step }) => {
    const { seriesId, assetId } = event.data as { seriesId: string; assetId?: string }

    try {

    // Step 1: Fetch Series data from Supabase
    const series = await step.run("fetch-series-data", async () => {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("video_series")
        .select("*")
        .eq("id", seriesId)
        .single()

      if (error || !data) {
        throw new Error(`Series not found: ${seriesId}`)
      }

      return data as Tables<"video_series">
    })

    // Step 2: Generate Video Script using AI
    const script = await step.run("generate-script", async () => {
      const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
      if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY) env variable")
      }

      const ai = new GoogleGenAI({ apiKey })
      const sceneCountHint =
        series.video_duration === "30-50" ? "4 to 5 scenes" : "5 to 6 scenes"

      const prompt = `You are a professional short-video script writer.

Create ONLY valid JSON with no markdown and no extra text.

Requirements:
- Generate content for this series:
  - seriesName: ${series.series_name}
  - niche: ${series.niche ?? "general"}
  - videoDuration: ${series.video_duration}
  - videoStyle: ${series.video_style ?? "realistic"}
  - language: ${series.language ?? "en-US"}
- Script must sound natural and conversational for voiceover.
- Include a strong hook in first line.
- For duration 30-50 seconds: create 4-5 image prompts.
- For duration 60-70 seconds: create 5-6 image prompts.
- Return exactly ${sceneCountHint} based on duration.
- Each scene should map to one narration segment and one detailed cinematic image prompt.

Output JSON schema:
{
  "videoTitle": "string",
  "videoScript": "string",
  "durationTarget": "30-50 | 60-70",
  "scenes": [
    {
      "sceneNumber": 1,
      "narration": "string",
      "imagePrompt": "string"
    }
  ]
}`

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })

      const jsonText = response.text?.trim()
      if (!jsonText) {
        throw new Error("Gemini returned empty response")
      }

      let parsed: GeneratedVideoScript
      try {
        parsed = JSON.parse(jsonText) as GeneratedVideoScript
      } catch {
        throw new Error("Gemini returned invalid JSON")
      }

      const hasRequiredShape =
        typeof parsed.videoTitle === "string" &&
        typeof parsed.videoScript === "string" &&
        typeof parsed.durationTarget === "string" &&
        Array.isArray(parsed.scenes) &&
        parsed.scenes.every(
          (scene) =>
            typeof scene.sceneNumber === "number" &&
            typeof scene.narration === "string" &&
            typeof scene.imagePrompt === "string"
        )

      if (!hasRequiredShape) {
        throw new Error("Gemini JSON does not match required schema")
      }

      return parsed
    })

    // Step 3: Generate Voice using TTS model
    const voice = await step.run("generate-voice", async () => {
      const voiceScript = script.videoScript?.trim() ||
        script.scenes.map((scene) => scene.narration).join(" ").trim()

      if (!voiceScript) {
        throw new Error("No script text available for TTS")
      }

      const supabase = createAdminClient()
      let selectedVoice: TtsVoiceRecord | null = null

      if (series.voice_id) {
        const { data } = await supabase
          .from("voices")
          .select("provider, voice_id, name, language")
          .eq("voice_id", series.voice_id)
          .maybeSingle()

        if (data) {
          selectedVoice = data as unknown as TtsVoiceRecord
        }
      }

      const { data: elevenVoiceByLanguageRaw } = await supabase
        .from("voices")
        .select("voice_id")
        .eq("provider", "elevenlabs")
        .eq("language", series.language ?? "en-US")
        .limit(1)
        .maybeSingle()

      const { data: anyElevenVoiceRaw } = await supabase
        .from("voices")
        .select("voice_id")
        .eq("provider", "elevenlabs")
        .limit(1)
        .maybeSingle()

      const { data: deepgramVoiceByLanguageRaw } = await supabase
        .from("voices")
        .select("voice_id")
        .eq("provider", "deepgram")
        .eq("language", series.language ?? "en-US")
        .limit(1)
        .maybeSingle()

      const elevenVoiceByLanguage =
        elevenVoiceByLanguageRaw as unknown as VoiceIdRow | null
      const anyElevenVoice =
        anyElevenVoiceRaw as unknown as VoiceIdRow | null
      const deepgramVoiceByLanguage =
        deepgramVoiceByLanguageRaw as unknown as VoiceIdRow | null

      const preferredProvider = normalizeProvider(selectedVoice?.provider)

      // Protect against accidentally passing secret/API-key-like values as voice IDs.
      const selectedVoiceId = selectedVoice?.voice_id
      const looksLikeSecret =
        typeof selectedVoiceId === "string" &&
        (selectedVoiceId.startsWith("sk_") || selectedVoiceId.length > 64)

      const resolvedElevenlabsVoiceId =
        preferredProvider === "elevenlabs" && !looksLikeSecret
          ? selectedVoiceId
          : (elevenVoiceByLanguage?.voice_id as string | undefined) ??
            (anyElevenVoice?.voice_id as string | undefined) ??
            process.env.ELEVENLABS_DEFAULT_VOICE_ID

      const resolvedDeepgramModel =
        preferredProvider === "deepgram" && selectedVoiceId
          ? selectedVoiceId
          : (deepgramVoiceByLanguage?.voice_id as string | undefined) ??
            "aura-2-asteria-en"

      const resolvedFonadaVoiceName =
        preferredProvider === "fonadalabs" && selectedVoice?.name
          ? selectedVoice.name
          : "Naad"

      const providerOrder: SupportedVoiceProvider[] = [
        preferredProvider,
        "elevenlabs",
        "fonadalabs",
        "deepgram",
      ].filter((provider, index, arr): provider is SupportedVoiceProvider => {
        return !!provider && arr.indexOf(provider) === index
      })

      const failures: string[] = []

      for (const provider of providerOrder) {
        try {
          let generatedVoice: GeneratedVoiceBinary

          if (provider === "fonadalabs") {
            generatedVoice = await synthesizeWithFonadaLabs(
              voiceScript,
              series.language,
              resolvedFonadaVoiceName
            )
          } else if (provider === "deepgram") {
            generatedVoice = await synthesizeWithDeepgram(voiceScript, resolvedDeepgramModel)
          } else {
            generatedVoice = await synthesizeWithElevenLabs(voiceScript, resolvedElevenlabsVoiceId)
          }

          const audioBuffer = Buffer.from(generatedVoice.audioBase64, "base64")
          const fileExt = generatedVoice.contentType.includes("mpeg") ? "mp3" : "bin"
          const storagePath = `${series.user_id}/${series.id}/${Date.now()}-${provider}-voiceover.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from("voiceovers")
            .upload(storagePath, audioBuffer, {
              contentType: generatedVoice.contentType,
              upsert: true,
            })

          if (uploadError) {
            throw new Error(`Storage upload failed: ${uploadError.message}`)
          }

          const { data: publicData } = supabase.storage
            .from("voiceovers")
            .getPublicUrl(storagePath)

          return {
            provider: generatedVoice.provider,
            voiceId: generatedVoice.voiceId,
            contentType: generatedVoice.contentType,
            audioBytes: generatedVoice.audioBytes,
            storagePath,
            outputDataUrl: publicData.publicUrl,
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "unknown error"
          failures.push(`${provider}: ${message}`)
        }
      }

      throw new Error(`All TTS providers failed. ${failures.join(" | ")}`)
    })

    // Step 4: Generate Captions using model
    const captions = await step.run("generate-captions", async (): Promise<GeneratedCaptionsResult> => {
      const apiKey = process.env.DEEPGRAM_API_KEY
      if (!apiKey) {
        throw new Error("Missing DEEPGRAM_API_KEY")
      }
      if (!voice.outputDataUrl) {
        throw new Error("No public URL for voiceover audio")
      }

      // Deepgram API: POST to /v1/listen with audio_url
      const res = await fetch("https://api.deepgram.com/v1/listen", {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: voice.outputDataUrl,
          model: "nova-2",
          smart_format: true,
          punctuate: true,
          paragraphs: true,
          diarize: false,
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Deepgram caption request failed: ${res.status} ${body}`)
      }

      const json = await res.json()
      // Extract transcript/captions
      const transcript = json.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""
      const paragraphs = json.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs || []

      // Optionally, build caption blocks (array of {start, end, text})
      const captionsArr = paragraphs.map((p: { start?: number; end?: number; transcript?: string }) => ({
        start: p.start,
        end: p.end,
        text: p.transcript,
      }))

      return {
        transcript,
        captions: captionsArr,
      }
    })

    // Step 5: Generate Images from image prompts (from step 2 script data)
    const images = await step.run("generate-images", async (): Promise<{ images: GeneratedImageAsset[] }> => {
      const supabase = createAdminClient()
      const imageAssets: GeneratedImageAsset[] = []

      for (const scene of script.scenes) {
        const generatedImage = await generateImageWithGoogle(scene.imagePrompt, series.video_style)
        const imageBuffer = Buffer.from(generatedImage.imageBase64, "base64")
        const fileExt = generatedImage.mimeType.includes("png") ? "png" : "jpg"
        const storagePath = `${series.user_id}/${series.id}/${Date.now()}-scene-${scene.sceneNumber}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("generated-images")
          .upload(storagePath, imageBuffer, {
            contentType: generatedImage.mimeType,
            upsert: true,
          })

        if (uploadError) {
          throw new Error(`Image upload failed for scene ${scene.sceneNumber}: ${uploadError.message}`)
        }

        const { data: publicData } = supabase.storage
          .from("generated-images")
          .getPublicUrl(storagePath)

        imageAssets.push({
          sceneNumber: scene.sceneNumber,
          prompt: scene.imagePrompt,
          storagePath,
          publicUrl: publicData.publicUrl,
          mimeType: generatedImage.mimeType,
        })
      }

      return { images: imageAssets }
    })

    // Step 6: Build final asset payload
    const assets = await step.run("prepare-assets", async () => {
      return {
        videoTitle: script.videoTitle,
        videoScript: script.videoScript,
        durationTarget: script.durationTarget,
        scenes: script.scenes,
        transcript: captions.transcript,
        captions: captions.captions,
        images: images.images,
        voiceoverUrl: voice.outputDataUrl,
        voiceStoragePath: voice.storagePath,
        voiceProvider: voice.provider,
        voiceId: voice.voiceId,
      }
    })

    // Step 7: Save generated assets to database
    const result = await step.run("save-assets-to-database", async () => {
      const supabase = createAdminClient()

      const payload = {
        series_id: series.id,
        user_id: series.user_id,
        title: assets.videoTitle,
        script: assets.videoScript,
        duration_target: assets.durationTarget,
        voice_provider: assets.voiceProvider,
        voice_id: assets.voiceId,
        voiceover_url: assets.voiceoverUrl ?? null,
        voiceover_storage_path: assets.voiceStoragePath ?? null,
        transcript: assets.transcript,
        captions_json: assets.captions,
        scenes_json: assets.scenes,
        images_json: assets.images,
        status: "completed" as const,
      }

      const query = assetId
        ? supabase
            .from("generated_video_assets")
            .update(payload)
            .eq("id", assetId)
            .eq("series_id", series.id)
            .eq("user_id", series.user_id)
            .select("id, series_id, created_at")
            .single()
        : supabase
            .from("generated_video_assets")
            .insert(payload)
            .select("id, series_id, created_at")
            .single()

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to save generated assets: ${error.message}`)
      }

      return {
        success: true,
        assetId: data.id,
        seriesId: data.series_id,
        createdAt: data.created_at,
        outputDataUrl: assets.voiceoverUrl,
        imageCount: assets.images.length,
      }
    })

      return result
    } catch (error) {
      if (assetId) {
        const supabase = createAdminClient()
        await supabase
          .from("generated_video_assets")
          .update({ status: "failed" })
          .eq("id", assetId)
      }

      throw error
    }
  }
)
