import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the basics.",
    features: [
      "3 videos per month",
      "Basic AI scripts",
      "720p rendering",
      "Manual scheduling",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    description: "Everything you need to grow.",
    features: [
      "30 videos per month",
      "Advanced AI scripts",
      "1080p rendering",
      "Auto scheduling",
      "AI voiceovers",
      "Priority rendering",
    ],
    cta: "Start Basic Plan",
    highlighted: true,
  },
  {
    name: "Unlimited",
    price: "$29.99",
    period: "/month",
    description: "For power creators and agencies.",
    features: [
      "Unlimited videos",
      "Premium AI scripts",
      "4K rendering",
      "Auto scheduling",
      "Premium voiceovers",
      "Multi-channel support",
      "API access",
      "Priority support",
    ],
    cta: "Go Unlimited",
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/40 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple,{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start for free. Upgrade when you&apos;re ready to scale.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col",
                plan.highlighted
                  ? "scale-[1.02] border-blue-500/50 shadow-lg shadow-blue-500/10"
                  : "border-border/50"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white hover:bg-blue-500">
                    Recommended
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="size-4 shrink-0 text-blue-500 dark:text-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "mt-8 w-full",
                    plan.highlighted &&
                      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  )}
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
