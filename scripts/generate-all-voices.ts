import { config } from "dotenv"
config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import textToSpeech from "@google-cloud/text-to-speech"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

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

// Set Google credentials path
process.env.GOOGLE_APPLICATION_CREDENTIALS = join(__dirname, "..", "google-service-account.json")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ttsClient = new textToSpeech.TextToSpeechClient()

// ── Languages ───────────────────────────────────────
const languages = [
  { code: "en-US", label: "English" },
  { code: "en-IN", label: "Indian English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "mr-IN", label: "Marathi" },
  { code: "te-IN", label: "Telugu" },
  { code: "ta-IN", label: "Tamil" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
  { code: "pa-IN", label: "Punjabi" },
  { code: "bn-IN", label: "Bengali" },
  { code: "ur-IN", label: "Urdu" },
]

// ── Voice mapping per language ──────────────────────
// Neural2 where available, Wavenet as fallback
// Verified against Google Cloud TTS API listVoices()
interface VoiceConfig {
  gender: string
  voiceName: string
  type: string // "Neural2" or "Wavenet"
}

const voiceMap: Record<string, VoiceConfig[]> = {
  "en-US": [
    { gender: "female", voiceName: "en-US-Neural2-C", type: "Neural2" },
    { gender: "male", voiceName: "en-US-Neural2-A", type: "Neural2" },
  ],
  "en-IN": [
    { gender: "female", voiceName: "en-IN-Neural2-A", type: "Neural2" },
    { gender: "male", voiceName: "en-IN-Neural2-B", type: "Neural2" },
  ],
  "hi-IN": [
    { gender: "female", voiceName: "hi-IN-Neural2-A", type: "Neural2" },
    { gender: "male", voiceName: "hi-IN-Neural2-B", type: "Neural2" },
  ],
  "mr-IN": [
    { gender: "female", voiceName: "mr-IN-Wavenet-A", type: "Wavenet" },
    { gender: "male", voiceName: "mr-IN-Wavenet-B", type: "Wavenet" },
  ],
  "te-IN": [
    { gender: "female", voiceName: "te-IN-Standard-A", type: "Standard" },
    { gender: "male", voiceName: "te-IN-Standard-B", type: "Standard" },
  ],
  "ta-IN": [
    { gender: "female", voiceName: "ta-IN-Wavenet-A", type: "Wavenet" },
    { gender: "male", voiceName: "ta-IN-Wavenet-B", type: "Wavenet" },
  ],
  "gu-IN": [
    { gender: "female", voiceName: "gu-IN-Wavenet-A", type: "Wavenet" },
    { gender: "male", voiceName: "gu-IN-Wavenet-B", type: "Wavenet" },
  ],
  "kn-IN": [
    { gender: "female", voiceName: "kn-IN-Wavenet-A", type: "Wavenet" },
    { gender: "male", voiceName: "kn-IN-Wavenet-B", type: "Wavenet" },
  ],
  "ml-IN": [
    { gender: "female", voiceName: "ml-IN-Wavenet-A", type: "Wavenet" },
    { gender: "male", voiceName: "ml-IN-Wavenet-B", type: "Wavenet" },
  ],
  "pa-IN": [
    { gender: "female", voiceName: "pa-IN-Wavenet-A", type: "Wavenet" },
    { gender: "male", voiceName: "pa-IN-Wavenet-B", type: "Wavenet" },
  ],
  "bn-IN": [
    { gender: "female", voiceName: "bn-IN-Wavenet-A", type: "Wavenet" },
    { gender: "male", voiceName: "bn-IN-Wavenet-B", type: "Wavenet" },
  ],
  "ur-IN": [
    { gender: "female", voiceName: "ur-IN-Wavenet-A", type: "Wavenet" },
    { gender: "male", voiceName: "ur-IN-Wavenet-B", type: "Wavenet" },
  ],
}

// ── Tones ───────────────────────────────────────────
const tones = ["story", "friendly", "calm", "energetic", "motivational", "tutorial"] as const

// ── Preview messages per language × tone ─────────────
const previewMessages: Record<string, Record<string, string>> = {
  "en-US": {
    story: "This AI voice can bring your stories to life with vivid narration.",
    friendly: "Hey there! This voice can make your videos more engaging and fun.",
    calm: "This AI voice presents your content in a calm and clear manner.",
    energetic: "Make your videos more impactful with this powerful AI voice!",
    motivational: "Share your story with the world using this inspiring AI voice.",
    tutorial: "This AI voice makes your video tutorials clear and easy to follow.",
  },
  "en-IN": {
    story: "This AI voice can bring your stories to life with vivid narration.",
    friendly: "Hello! This voice can make your videos more engaging and appealing.",
    calm: "This AI voice presents your content in a calm and clear manner.",
    energetic: "Make your videos more impactful with this powerful AI voice!",
    motivational: "Share your story with the world using this inspiring AI voice.",
    tutorial: "This AI voice makes your video tutorials clear and easy to follow.",
  },
  "hi-IN": {
    story: "यह एआई आवाज़ आपकी कहानियों को जीवंत बना सकती है।",
    friendly: "नमस्ते! यह आवाज़ आपके वीडियो को आकर्षक बना सकती है।",
    calm: "यह एआई आवाज़ शांत और स्पष्ट तरीके से आपके कंटेंट को प्रस्तुत करती है।",
    energetic: "इस एआई आवाज़ के साथ अपने वीडियो को और प्रभावशाली बनाइए।",
    motivational: "अपनी कहानी को इस शक्तिशाली एआई आवाज़ के साथ दुनिया तक पहुँचाएँ।",
    tutorial: "यह एआई आवाज़ आपके वीडियो ट्यूटोरियल को स्पष्ट और आसान बनाती है।",
  },
  "mr-IN": {
    story: "हा एआय आवाज तुमच्या कथांना जिवंत करू शकतो.",
    friendly: "नमस्कार! हा आवाज तुमचे व्हिडिओ अधिक आकर्षक बनवू शकतो.",
    calm: "हा एआय आवाज तुमची सामग्री शांत आणि स्पष्टपणे सादर करतो.",
    energetic: "या शक्तिशाली एआय आवाजाने तुमचे व्हिडिओ अधिक प्रभावी बनवा!",
    motivational: "या प्रेरणादायी एआय आवाजाने तुमची कहाणी जगापर्यंत पोहोचवा.",
    tutorial: "हा एआय आवाज तुमचे व्हिडिओ ट्यूटोरियल स्पष्ट आणि सोपे बनवतो.",
  },
  "te-IN": {
    story: "ఈ ఎఐ గొంతు మీ కథలకు ప్రాణం పోయగలదు.",
    friendly: "హలో! ఈ గొంతు మీ వీడియోలను మరింత ఆకర్షణీయంగా చేయగలదు.",
    calm: "ఈ ఎఐ గొంతు మీ కంటెంట్‌ను ప్రశాంతంగా మరియు స్పష్టంగా అందిస్తుంది.",
    energetic: "ఈ శక్తివంతమైన ఎఐ గొంతుతో మీ వీడియోలను మరింత ప్రభావవంతం చేయండి!",
    motivational: "ఈ ప్రేరణాదాయక ఎఐ గొంతుతో మీ కథను ప్రపంచానికి చేరవేయండి.",
    tutorial: "ఈ ఎఐ గొంతు మీ వీడియో ట్యుటోరియల్స్‌ను స్పష్టంగా మరియు సులభంగా చేస్తుంది.",
  },
  "ta-IN": {
    story: "இந்த AI குரல் உங்கள் கதைகளை உயிர்ப்பிக்க முடியும்.",
    friendly: "வணக்கம்! இந்த குரல் உங்கள் வீடியோக்களை மேலும் கவர்ச்சிகரமாக்கும்.",
    calm: "இந்த AI குரல் உங்கள் உள்ளடக்கத்தை அமைதியாகவும் தெளிவாகவும் வழங்குகிறது.",
    energetic: "இந்த சக்திவாய்ந்த AI குரலுடன் உங்கள் வீடியோக்களை மேலும் தாக்கமாக்குங்கள்!",
    motivational: "இந்த ஊக்கமளிக்கும் AI குரலுடன் உங்கள் கதையை உலகிற்கு கொண்டு செல்லுங்கள்.",
    tutorial: "இந்த AI குரல் உங்கள் வீடியோ பயிற்சிகளை தெளிவாகவும் எளிதாகவும் செய்கிறது.",
  },
  "gu-IN": {
    story: "આ AI અવાજ તમારી વાર્તાઓને જીવંત બનાવી શકે છે.",
    friendly: "નમસ્તે! આ અવાજ તમારા વીડિયોને વધુ આકર્ષક બનાવી શકે છે.",
    calm: "આ AI અવાજ તમારી સામગ્રીને શાંત અને સ્પષ્ટ રીતે રજૂ કરે છે.",
    energetic: "આ શક્તિશાળી AI અવાજ સાથે તમારા વીડિયોને વધુ પ્રભાવશાળી બનાવો!",
    motivational: "આ પ્રેરણાદાયી AI અવાજ સાથે તમારી વાર્તા દુનિયા સુધી પહોંચાડો.",
    tutorial: "આ AI અવાજ તમારા વીડિયો ટ્યુટોરિયલ્સને સ્પષ્ટ અને સરળ બનાવે છે.",
  },
  "kn-IN": {
    story: "ಈ AI ಧ್ವನಿ ನಿಮ್ಮ ಕಥೆಗಳನ್ನು ಜೀವಂತಗೊಳಿಸಬಹುದು.",
    friendly: "ನಮಸ್ಕಾರ! ಈ ಧ್ವನಿ ನಿಮ್ಮ ವೀಡಿಯೊಗಳನ್ನು ಹೆಚ್ಚು ಆಕರ್ಷಕಗೊಳಿಸಬಹುದು.",
    calm: "ಈ AI ಧ್ವನಿ ನಿಮ್ಮ ವಿಷಯವನ್ನು ಶಾಂತ ಮತ್ತು ಸ್ಪಷ್ಟವಾಗಿ ಪ್ರಸ್ತುತಪಡಿಸುತ್ತದೆ.",
    energetic: "ಈ ಶಕ್ತಿಶಾಲಿ AI ಧ್ವನಿಯೊಂದಿಗೆ ನಿಮ್ಮ ವೀಡಿಯೊಗಳನ್ನು ಹೆಚ್ಚು ಪರಿಣಾಮಕಾರಿಯಾಗಿಸಿ!",
    motivational: "ಈ ಪ್ರೇರಣಾದಾಯಕ AI ಧ್ವನಿಯೊಂದಿಗೆ ನಿಮ್ಮ ಕಥೆಯನ್ನು ಜಗತ್ತಿಗೆ ತಲುಪಿಸಿ.",
    tutorial: "ಈ AI ಧ್ವನಿ ನಿಮ್ಮ ವೀಡಿಯೊ ಟ್ಯುಟೋರಿಯಲ್‌ಗಳನ್ನು ಸ್ಪಷ್ಟ ಮತ್ತು ಸುಲಭಗೊಳಿಸುತ್ತದೆ.",
  },
  "ml-IN": {
    story: "ഈ AI ശബ്ദം നിങ്ങളുടെ കഥകൾക്ക് ജീവൻ നൽകും.",
    friendly: "നമസ്കാരം! ഈ ശബ്ദം നിങ്ങളുടെ വീഡിയോകൾ കൂടുതൽ ആകർഷകമാക്കും.",
    calm: "ഈ AI ശബ്ദം നിങ്ങളുടെ ഉള്ളടക്കം ശാന്തമായും വ്യക്തമായും അവതരിപ്പിക്കുന്നു.",
    energetic: "ഈ ശക്തമായ AI ശബ്ദത്തോടെ നിങ്ങളുടെ വീഡിയോകൾ കൂടുതൽ സ്വാധീനമുള്ളതാക്കൂ!",
    motivational: "ഈ പ്രചോദനാത്മക AI ശബ്ദത്തോടെ നിങ്ങളുടെ കഥ ലോകത്തിന് എത്തിക്കൂ.",
    tutorial: "ഈ AI ശബ്ദം നിങ്ങളുടെ വീഡിയോ ട്യൂട്ടോറിയലുകൾ വ്യക്തവും എളുപ്പവുമാക്കുന്നു.",
  },
  "pa-IN": {
    story: "ਇਹ AI ਅਵਾਜ਼ ਤੁਹਾਡੀਆਂ ਕਹਾਣੀਆਂ ਨੂੰ ਜੀਵੰਤ ਬਣਾ ਸਕਦੀ ਹੈ।",
    friendly: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਇਹ ਅਵਾਜ਼ ਤੁਹਾਡੇ ਵੀਡੀਓ ਨੂੰ ਹੋਰ ਆਕਰਸ਼ਕ ਬਣਾ ਸਕਦੀ ਹੈ।",
    calm: "ਇਹ AI ਅਵਾਜ਼ ਤੁਹਾਡੀ ਸਮੱਗਰੀ ਨੂੰ ਸ਼ਾਂਤ ਅਤੇ ਸਪੱਸ਼ਟ ਢੰਗ ਨਾਲ ਪੇਸ਼ ਕਰਦੀ ਹੈ।",
    energetic: "ਇਸ ਸ਼ਕਤੀਸ਼ਾਲੀ AI ਅਵਾਜ਼ ਨਾਲ ਆਪਣੇ ਵੀਡੀਓ ਨੂੰ ਹੋਰ ਪ੍ਰਭਾਵਸ਼ਾਲੀ ਬਣਾਓ!",
    motivational: "ਇਸ ਪ੍ਰੇਰਣਾਦਾਇਕ AI ਅਵਾਜ਼ ਨਾਲ ਆਪਣੀ ਕਹਾਣੀ ਦੁਨੀਆ ਤੱਕ ਪਹੁੰਚਾਓ।",
    tutorial: "ਇਹ AI ਅਵਾਜ਼ ਤੁਹਾਡੇ ਵੀਡੀਓ ਟਿਊਟੋਰੀਅਲ ਨੂੰ ਸਪੱਸ਼ਟ ਅਤੇ ਆਸਾਨ ਬਣਾਉਂਦੀ ਹੈ।",
  },
  "bn-IN": {
    story: "এই AI কণ্ঠস্বর আপনার গল্পগুলিকে জীবন্ত করে তুলতে পারে।",
    friendly: "নমস্কার! এই কণ্ঠস্বর আপনার ভিডিওগুলিকে আরও আকর্ষণীয় করতে পারে।",
    calm: "এই AI কণ্ঠস্বর আপনার বিষয়বস্তু শান্ত ও স্পষ্টভাবে উপস্থাপন করে।",
    energetic: "এই শক্তিশালী AI কণ্ঠস্বর দিয়ে আপনার ভিডিওগুলিকে আরও প্রভাবশালী করুন!",
    motivational: "এই অনুপ্রেরণামূলক AI কণ্ঠস্বর দিয়ে আপনার গল্প বিশ্বে পৌঁছে দিন।",
    tutorial: "এই AI কণ্ঠস্বর আপনার ভিডিও টিউটোরিয়ালগুলি স্পষ্ট ও সহজ করে তোলে।",
  },
  "ur-IN": {
    story: "یہ اے آئی آواز آپ کی کہانیوں کو زندہ کر سکتی ہے۔",
    friendly: "السلام علیکم! یہ آواز آپ کے ویڈیوز کو مزید دلکش بنا سکتی ہے۔",
    calm: "یہ اے آئی آواز آپ کے مواد کو پرسکون اور واضح طریقے سے پیش کرتی ہے۔",
    energetic: "اس طاقتور اے آئی آواز کے ساتھ اپنے ویڈیوز کو مزید مؤثر بنائیں!",
    motivational: "اس متاثر کن اے آئی آواز کے ساتھ اپنی کہانی دنیا تک پہنچائیں۔",
    tutorial: "یہ اے آئی آواز آپ کے ویڈیو ٹیوٹوریلز کو واضح اور آسان بناتی ہے۔",
  },
}

// ── Generate TTS audio ──────────────────────────────
async function generateVoicePreview(
  text: string,
  languageCode: string,
  voiceName: string
): Promise<Buffer> {
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
    },
  })

  if (!response.audioContent) {
    throw new Error(`No audio content returned for ${voiceName}`)
  }

  return Buffer.from(response.audioContent as Uint8Array)
}

// ── Upload to Supabase Storage ──────────────────────
async function uploadToStorage(fileName: string, buffer: Buffer): Promise<string> {
  const { error: uploadError } = await supabase.storage
    .from("voices")
    .upload(fileName, buffer, {
      contentType: "audio/mpeg",
      upsert: true,
    })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  const { data } = supabase.storage.from("voices").getPublicUrl(fileName)
  return data.publicUrl
}

// ── Format display name ─────────────────────────────
function formatDisplayName(langLabel: string, gender: string, tone: string): string {
  const g = gender.charAt(0).toUpperCase() + gender.slice(1)
  const t = tone.charAt(0).toUpperCase() + tone.slice(1)
  return `${langLabel} ${g} - ${t}`
}

// ── Main ────────────────────────────────────────────
async function generateAllVoices(): Promise<void> {
  // Calculate total
  let totalExpected = 0
  for (const lang of languages) {
    const voices = voiceMap[lang.code]
    if (voices) totalExpected += voices.length * tones.length
  }

  console.log(`\nGenerating ${totalExpected} voices (${languages.length} languages × 2 genders × ${tones.length} tones)\n`)

  // Step 1: Delete all existing voices
  console.log("Clearing existing voices from database...")
  const { error: deleteError } = await supabase
    .from("voices")
    .delete()
    .neq("voice_id", "")  // delete all rows

  if (deleteError) {
    console.error("Failed to clear voices table:", deleteError.message)
    process.exit(1)
  }
  console.log("Existing voices deleted.\n")

  let created = 0
  let failed = 0

  for (const lang of languages) {
    const voices = voiceMap[lang.code]
    if (!voices) {
      console.log(`⊘ No voice config for ${lang.code}, skipping`)
      continue
    }

    for (const { gender, voiceName, type } of voices) {
      for (const tone of tones) {
        const voiceId = `${voiceName}-${tone}`
        const fileName = `${voiceName}-${tone}.mp3`
        const displayName = formatDisplayName(lang.label, gender, tone)
        const label = `[${created + failed + 1}/${totalExpected}] ${displayName} (${type})`

        try {
          // 1. Generate TTS audio
          const text = previewMessages[lang.code][tone]
          console.log(`${label} — generating...`)
          const audioBuffer = await generateVoicePreview(text, lang.code, voiceName)

          // 2. Upload to Supabase storage
          console.log(`${label} — uploading...`)
          const publicUrl = await uploadToStorage(fileName, audioBuffer)

          // 3. Insert into voices table
          const { error: insertError } = await supabase.from("voices").insert({
            name: displayName,
            language: lang.code,
            gender,
            tone,
            provider: "google",
            voice_id: voiceId,
            preview_url: publicUrl,
          })

          if (insertError) {
            console.error(`${label} — DB insert failed: ${insertError.message}`)
            failed++
            continue
          }

          created++
          console.log(`${label} — done ✓`)
        } catch (err) {
          console.error(`${label} — failed:`, err instanceof Error ? err.message : err)
          failed++
        }

        // Rate limit: small delay between API calls
        await new Promise((r) => setTimeout(r, 300))
      }
    }
  }

  console.log(`\n========================================`)
  console.log(`Total: ${created} created, ${failed} failed`)
  console.log(`========================================\n`)
}

generateAllVoices()
