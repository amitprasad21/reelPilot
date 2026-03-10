export const Language = [
  { language: "English", countryCode: "US", countryFlag: "us", modelName: "google", modelLangCode: "en-US" },
  { language: "Indian English", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "en-IN" },
  { language: "Hindi", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "hi-IN" },
  { language: "Marathi", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "mr-IN" },
  { language: "Telugu", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "te-IN" },
  { language: "Tamil", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "ta-IN" },
  { language: "Gujarati", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "gu-IN" },
  { language: "Kannada", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "kn-IN" },
  { language: "Malayalam", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "ml-IN" },
  { language: "Punjabi", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "pa-IN" },
  { language: "Bengali", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "bn-IN" },
  { language: "Urdu", countryCode: "IN", countryFlag: "in", modelName: "google", modelLangCode: "ur-IN" },
]

export const DeepgramVoices = [
  {
    model: "deepgram",
    modelName: "aura-2-odysseus-en",
    preview: "deepgram-aura-2-odysseus-en.wav",
    gender: "male"
  },
  {
    model: "deepgram",
    modelName: "aura-2-thalia-en",
    preview: "deepgram-aura-2-thalia-en.wav",
    gender: "female"
  },
  {
    model: "deepgram",
    modelName: "aura-2-amalthea-en",
    preview: "deepgram-aura-2-amalthea-en.wav",
    gender: "female"
  },
  {
    model: "deepgram",
    modelName: "aura-2-andromeda-en",
    preview: "deepgram-aura-2-andromeda-en.wav",
    gender: "female"
  },
  {
    model: "deepgram",
    modelName: "aura-2-apollo-en",
    preview: "deepgram-aura-2-apollo-en.wav",
    gender: "male"
  }
]

export const FonadlabVoices = [
  {
    model: "fonadlab",
    modelName: "vaanee",
    preview: "fonadalab-Vaanee.mp3",
    gender: "female"
  },
  {
    model: "fonadlab",
    modelName: "chaitra",
    preview: "fonadalab-Chaitra.mp3",
    gender: "female"
  },
  {
    model: "fonadlab",
    modelName: "meghra",
    preview: "fonadalab-Meghra.mp3",
    gender: "female"
  },
  {
    model: "fonadlab",
    modelName: "nirvani",
    preview: "fonadalab-Nirvani.mp3",
    gender: "female"
  }
]

export type LanguageOption = (typeof Language)[number]
export type VoiceOption = (typeof DeepgramVoices)[number] | (typeof FonadlabVoices)[number]

export function getVoicesForModel(modelName: string): VoiceOption[] {
  if (modelName === "deepgram") return DeepgramVoices
  if (modelName === "fonadlab") return FonadlabVoices
  return []
}

/** Extract a clean display name from model identifier, e.g. "aura-2-odysseus-en" → "Odysseus" */
export function formatVoiceName(modelName: string): string {
  // For deepgram: "aura-2-odysseus-en" → "Odysseus"
  const parts = modelName.split("-")
  // Find the first part that looks like a proper name (not a number, not "aura", not "en")
  const skip = new Set(["aura", "en", "2"])
  const name = parts.find((p) => !skip.has(p) && isNaN(Number(p)))
  if (name) return name.charAt(0).toUpperCase() + name.slice(1)
  // For fonadlab voices like "vanee", "chitraa" — already clean
  return modelName.charAt(0).toUpperCase() + modelName.slice(1)
}

/** Convert a 2-letter country code to a flag emoji */
export function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("")
}
