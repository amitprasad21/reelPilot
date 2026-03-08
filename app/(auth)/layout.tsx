export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-[120px]" />
      </div>

      {/* Logo */}
      <a
        href="/"
        className="mb-8 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent"
      >
        ReelPilot
      </a>

      {children}
    </div>
  )
}
