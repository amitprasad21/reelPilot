"use client"

import { useAuth, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutDashboard, Play } from "lucide-react"

export function Hero() {
  const { userId, isLoaded } = useAuth()
  const { openSignIn } = useClerk()
  const router = useRouter()

  const handleCTA = () => {
    if (!isLoaded) return
    if (userId) {
      router.push("/dashboard")
    } else {
      openSignIn({ fallbackRedirectUrl: "/dashboard" })
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[128px]" />
        <div className="absolute right-0 top-1/2 size-[400px] -translate-y-1/2 rounded-full bg-cyan-400/15 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            ✨ AI-Powered Video Automation
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Generate Viral YouTube Shorts with AI —{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Automatically
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            ReelPilot uses AI to generate scripts, create voiceovers, render
            scenes, and schedule your YouTube Shorts — all on autopilot. Focus
            on growing your channel while AI handles the content.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={handleCTA}
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {userId ? (
                <>
                  <LayoutDashboard className="size-4" />
                  Go to Dashboard
                </>
              ) : (
                <>
                  Start Creating Videos
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Play className="size-4" />
              View Demo
            </Button>
          </div>

          <div className="mt-16 w-full max-w-5xl">
            <div className="rounded-xl border border-border/60 bg-card/50 p-2 shadow-2xl ring-1 ring-white/5 backdrop-blur-sm">
              <div className="flex aspect-video items-center justify-center rounded-lg border border-border/40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
                <div className="flex w-full max-w-lg flex-col items-center gap-4 px-8 text-muted-foreground">
                  <div className="grid w-full grid-cols-3 gap-3">
                    <div className="h-20 rounded-lg border border-slate-300/50 bg-white/60 dark:border-white/10 dark:bg-white/5" />
                    <div className="h-20 rounded-lg border border-slate-300/50 bg-white/60 dark:border-white/10 dark:bg-white/5" />
                    <div className="h-20 rounded-lg border border-slate-300/50 bg-white/60 dark:border-white/10 dark:bg-white/5" />
                  </div>
                  <div className="w-full space-y-2">
                    <div className="h-32 rounded-lg border border-slate-300/50 bg-white/60 dark:border-white/10 dark:bg-white/5" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 rounded-lg border border-slate-300/50 bg-white/60 dark:border-white/10 dark:bg-white/5" />
                      <div className="h-16 rounded-lg border border-blue-500/30 bg-blue-500/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
