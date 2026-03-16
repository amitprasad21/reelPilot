"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Clapperboard,
  BookOpen,
  CreditCard,
  Settings,
  Layers,
  Plus,
  Zap,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Series", href: "/dashboard", icon: Layers },
  { label: "Videos", href: "/dashboard/videos", icon: Clapperboard },
  { label: "Guides", href: "/dashboard/guides", icon: BookOpen },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-background">
      {/* Sidebar Header — Logo + App Name */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <Image
          src="/logo.png"
          alt="VidMaxx logo"
          width={32}
          height={32}
          className="rounded-lg object-contain"
        />
        <span className="text-lg font-bold tracking-tight text-foreground">
          ReelPilot
        </span>
      </div>

      {/* Create New Series Button */}
      <div className="px-4 pt-5 pb-2">
        <Button
          asChild
          className="w-full gap-2 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          size="default"
        >
          <Link href="/dashboard/create">
            <Plus className="size-4" />
            Create New Series
          </Link>
        </Button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0",
                      active ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                    )}
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-border px-3 py-4 space-y-0.5">
        <Link
          href="/dashboard/billing/upgrade"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
        >
          <Zap className="size-[18px] shrink-0 text-amber-500 dark:text-amber-400" />
          Upgrade Plan
        </Link>
        <Link
          href="/dashboard/settings/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <User className="size-[18px] shrink-0 text-muted-foreground" />
          Profile Settings
        </Link>
      </div>
    </aside>
  )
}
