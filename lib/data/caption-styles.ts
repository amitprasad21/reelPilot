/**
 * Caption style definitions — reusable across the form UI and Remotion compositions.
 *
 * Each style defines:
 *  - id / name for selection
 *  - CSS properties for the text
 *  - A Tailwind animation class name (used in the preview)
 *  - An `animation` CSS string for Remotion / runtime use
 */

export interface CaptionStyle {
  id: string
  name: string
  /** Text color */
  color: string
  /** Font weight */
  fontWeight: number
  /** Font size (px) — used in Remotion; the preview may scale down */
  fontSize: number
  /** Text stroke / outline (CSS -webkit-text-stroke) */
  textStroke?: string
  /** Text shadow */
  textShadow?: string
  /** Background behind each word (for highlight style) */
  wordBackground?: string
  /** Border radius on the word background */
  wordBorderRadius?: number
  /** Word padding when background is used */
  wordPadding?: string
  /** CSS animation shorthand (name, duration, easing) — used in Remotion */
  animation: string
  /** Keyframes CSS string — inject once per composition in Remotion */
  keyframes: string
}

export const CAPTION_STYLES: CaptionStyle[] = [
  {
    id: "pop",
    name: "Pop",
    color: "#FFFFFF",
    fontWeight: 800,
    fontSize: 42,
    textStroke: "2px #000000",
    animation: "captionPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
    keyframes: `@keyframes captionPop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}`,
  },
  {
    id: "bounce",
    name: "Bounce",
    color: "#FACC15",
    fontWeight: 800,
    fontSize: 42,
    textStroke: "2px #000000",
    animation: "captionBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
    keyframes: `@keyframes captionBounce {
  0% { transform: translateY(40px); opacity: 0; }
  60% { transform: translateY(-8px); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}`,
  },
  {
    id: "glow",
    name: "Glow",
    color: "#00FFFF",
    fontWeight: 700,
    fontSize: 40,
    textShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 40px #0088FF",
    animation: "captionGlow 1.5s ease-in-out infinite alternate",
    keyframes: `@keyframes captionGlow {
  0% { text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 40px #0088FF; }
  100% { text-shadow: 0 0 20px #00FFFF, 0 0 40px #00FFFF, 0 0 80px #0088FF; }
}`,
  },
  {
    id: "highlight",
    name: "Highlight",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 40,
    wordBackground: "#E11D48",
    wordBorderRadius: 6,
    wordPadding: "2px 8px",
    animation: "captionHighlight 0.3s ease-out both",
    keyframes: `@keyframes captionHighlight {
  0% { background-color: transparent; color: rgba(255,255,255,0.3); }
  100% { background-color: #E11D48; color: #FFFFFF; }
}`,
  },
  {
    id: "typewriter",
    name: "Typewriter",
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: 38,
    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
    animation: "captionTypewriter 0.6s steps(12) both",
    keyframes: `@keyframes captionTypewriter {
  0% { width: 0; overflow: hidden; white-space: nowrap; }
  100% { width: 100%; overflow: hidden; white-space: nowrap; }
}`,
  },
  {
    id: "wave",
    name: "Wave",
    color: "#A855F7",
    fontWeight: 800,
    fontSize: 42,
    textStroke: "2px #000000",
    animation: "captionWave 0.6s ease-in-out both",
    keyframes: `@keyframes captionWave {
  0% { transform: translateY(0); }
  25% { transform: translateY(-12px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}`,
  },
]

/** Look up a caption style by id */
export function getCaptionStyle(id: string): CaptionStyle | undefined {
  return CAPTION_STYLES.find((s) => s.id === id)
}
