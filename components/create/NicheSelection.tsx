"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Check,
  Pencil,
  Ghost,
  Flame,
  Lightbulb,
  BookOpen,
  Sparkles,
  Search,
  TrendingUp,
  Brain,
  ShieldAlert,
  Moon,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const AVAILABLE_NICHES = [
  {
    id: "scary-stories",
    label: "Scary Stories",
    description: "Chilling horror tales, creepypastas, and true scary encounters.",
    icon: Ghost,
    color: "text-violet-500",
    bg: "bg-violet-50",
    selectedBg: "bg-violet-100",
    selectedBorder: "border-violet-400",
  },
  {
    id: "motivational",
    label: "Motivational",
    description: "Inspiring quotes, success stories, and mindset-shifting content.",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-50",
    selectedBg: "bg-orange-50",
    selectedBorder: "border-orange-400",
  },
  {
    id: "did-you-know",
    label: "Did You Know?",
    description: "Surprising facts, science trivia, and mind-blowing discoveries.",
    icon: Lightbulb,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    selectedBg: "bg-yellow-50",
    selectedBorder: "border-yellow-400",
  },
  {
    id: "history-stories",
    label: "History Stories",
    description: "Fascinating events, forgotten figures, and untold historical moments.",
    icon: BookOpen,
    color: "text-amber-600",
    bg: "bg-amber-50",
    selectedBg: "bg-amber-50",
    selectedBorder: "border-amber-400",
  },
  {
    id: "life-lessons",
    label: "Life Lessons",
    description: "Practical wisdom, self-improvement tips, and personal growth insights.",
    icon: Sparkles,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    selectedBg: "bg-emerald-50",
    selectedBorder: "border-emerald-400",
  },
  {
    id: "mystery-unsolved",
    label: "Mystery & Unsolved",
    description: "Cold cases, unexplained phenomena, and conspiracy deep-dives.",
    icon: Search,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    selectedBg: "bg-indigo-50",
    selectedBorder: "border-indigo-400",
  },
  {
    id: "finance-tips",
    label: "Finance Tips",
    description: "Money hacks, investment basics, and budgeting advice for beginners.",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
    selectedBg: "bg-green-50",
    selectedBorder: "border-green-400",
  },
  {
    id: "philosophy",
    label: "Philosophy",
    description: "Thought-provoking ideas, stoic wisdom, and existential reflections.",
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-50",
    selectedBg: "bg-purple-50",
    selectedBorder: "border-purple-400",
  },
  {
    id: "true-crime",
    label: "True Crime",
    description: "Real criminal cases, investigative breakdowns, and crime psychology.",
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-50",
    selectedBg: "bg-red-50",
    selectedBorder: "border-red-400",
  },
  {
    id: "sleep-stories",
    label: "Sleep Stories",
    description: "Calming bedtime narratives and relaxing audio storytelling content.",
    icon: Moon,
    color: "text-blue-400",
    bg: "bg-blue-50",
    selectedBg: "bg-blue-50",
    selectedBorder: "border-blue-400",
  },
]

interface NicheSelectionProps {
  selectedNiche: string | null
  customNiche: string
  onSelectNiche: (id: string) => void
  onCustomNicheChange: (value: string) => void
}

export function NicheSelection({
  selectedNiche,
  customNiche,
  onSelectNiche,
  onCustomNicheChange,
}: NicheSelectionProps) {
  const [activeTab, setActiveTab] = useState("available")

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Choose Your Niche</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick the content niche for your YouTube Shorts series.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full max-w-xs">
          <TabsTrigger value="available" className="flex-1">
            Available Niche
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex-1">
            Custom Niche
          </TabsTrigger>
        </TabsList>

        {/* Available Niches Tab */}
        <TabsContent value="available" className="mt-4">
          <div
            className="flex flex-col gap-2 overflow-y-auto pr-1"
            style={{ maxHeight: "360px" }}
          >
            {AVAILABLE_NICHES.map((niche) => {
              const isSelected = selectedNiche === niche.id
              const Icon = niche.icon
              return (
                <button
                  key={niche.id}
                  type="button"
                  onClick={() => onSelectNiche(niche.id)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-left",
                    "transition-all duration-200 ease-in-out",
                    "active:scale-[0.99]",
                    isSelected
                      ? cn("border-2 shadow-sm", niche.selectedBorder, niche.selectedBg)
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                  )}
                >
                  {/* Icon badge */}
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                      isSelected ? niche.selectedBg : niche.bg
                    )}
                  >
                    <Icon className={cn("size-5", niche.color)} strokeWidth={1.8} />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold transition-colors duration-150",
                        isSelected ? "text-slate-900" : "text-slate-800"
                      )}
                    >
                      {niche.label}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      {niche.description}
                    </p>
                  </div>

                  {/* Selection checkmark */}
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                      isSelected
                        ? "border-blue-600 bg-blue-600 scale-100 opacity-100"
                        : "border-slate-300 bg-white scale-75 opacity-0 group-hover:scale-90 group-hover:opacity-60"
                    )}
                  >
                    <Check className="size-3 text-white" strokeWidth={3} />
                  </div>
                </button>
              )
            })}
          </div>
        </TabsContent>

        {/* Custom Niche Tab */}
        <TabsContent value="custom" className="mt-4">
          <div className="flex flex-col gap-3 rounded-xl border-2 border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Pencil className="size-4 text-blue-600" />
              <Label
                htmlFor="custom-niche"
                className="text-sm font-semibold text-slate-800"
              >
                Describe your custom niche
              </Label>
            </div>
            <Textarea
              id="custom-niche"
              placeholder="e.g. Weekly AI tool reviews for non-technical entrepreneurs…"
              value={customNiche}
              onChange={(e) => onCustomNicheChange(e.target.value)}
              className="min-h-[120px] resize-none text-sm"
            />
            <p className="text-xs text-slate-400">
              Be specific — the more detail you provide, the better your content
              will be tailored.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
