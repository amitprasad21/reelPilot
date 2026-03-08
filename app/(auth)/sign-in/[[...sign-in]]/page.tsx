import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-card border border-border shadow-xl shadow-black/20",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "border border-border bg-background text-foreground hover:bg-muted",
          socialButtonsBlockButtonText: "text-foreground font-medium",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          formFieldLabel: "text-foreground",
          formFieldInput:
            "bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-blue-500",
          formButtonPrimary:
            "bg-blue-600 hover:bg-blue-700 text-white font-medium",
          footerActionLink: "text-blue-500 hover:text-blue-400",
          identityPreviewText: "text-foreground",
          identityPreviewEditButton: "text-blue-500",
        },
      }}
    />
  )
}
