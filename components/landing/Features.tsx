import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Sparkles,
  Mic,
  ImageIcon,
  Film,
  Calendar,
  Share2,
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Script Generator",
    description:
      "Generate engaging, viral-worthy scripts using AI tailored to your niche and audience.",
  },
  {
    icon: Mic,
    title: "AI Voiceover",
    description:
      "Automatically create natural-sounding voiceovers from your scripts with multiple voice options.",
  },
  {
    icon: ImageIcon,
    title: "Scene Image Generation",
    description:
      "AI generates visually stunning scene images that perfectly match your script content.",
  },
  {
    icon: Film,
    title: "Automated Video Rendering",
    description:
      "Render complete videos automatically by combining scripts, voiceovers, and scene images.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Schedule your videos for optimal posting times and let ReelPilot handle the uploads.",
  },
  {
    icon: Share2,
    title: "Multi Platform Publishing",
    description:
      "Publish your shorts across YouTube and other platforms from a single dashboard.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Automate
            </span>{" "}
            Video Creation
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From script to screen — ReelPilot handles every step of the video
            creation process.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
