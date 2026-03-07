import { FolderPlus, Wand2, Clapperboard, Upload } from "lucide-react"

const steps = [
  {
    icon: FolderPlus,
    step: "01",
    title: "Create a Series",
    description:
      "Define your video series with topics, style, and target audience.",
  },
  {
    icon: Wand2,
    step: "02",
    title: "AI Generates Script + Scenes",
    description:
      "Our AI creates compelling scripts and matching scene visuals.",
  },
  {
    icon: Clapperboard,
    step: "03",
    title: "Render Video Automatically",
    description:
      "Videos are rendered with voiceover, scenes, and transitions.",
  },
  {
    icon: Upload,
    step: "04",
    title: "Schedule to YouTube",
    description:
      "Set your publishing schedule and ReelPilot handles the rest.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/40 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Go from idea to published YouTube Short in four simple steps.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              {i < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-px w-full bg-gradient-to-r from-blue-500/50 to-transparent lg:block" />
              )}

              <div className="relative z-10 mb-4 flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm">
                <step.icon className="size-7 text-blue-500 dark:text-blue-400" />
              </div>

              <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400">
                Step {step.step}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
