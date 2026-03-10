"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const STEPS = [
  { id: 1, label: "Niche" },
  { id: 2, label: "Language" },
  { id: 3, label: "Music" },
  { id: 4, label: "Style" },
  { id: 5, label: "Captions" },
  { id: 6, label: "Schedule" },
]

interface StepperProgressProps {
  currentStep: number
}

export function StepperProgress({ currentStep }: StepperProgressProps) {
  return (
    <div className="w-full px-2">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isActive = step.id === currentStep
          const isUpcoming = step.id > currentStep

          return (
            <div key={step.id} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                    isCompleted &&
                      "border-blue-600 bg-blue-600 text-white",
                    isActive &&
                      "border-blue-600 bg-background text-blue-600 shadow-md shadow-blue-100 ring-4 ring-blue-100 dark:shadow-blue-900 dark:ring-blue-900/40",
                    isUpcoming &&
                      "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap transition-colors duration-300",
                    isActive && "text-blue-600",
                    isCompleted && "text-blue-500",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mb-5 h-0.5 w-full transition-all duration-500",
                    step.id < currentStep ? "bg-blue-500" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
