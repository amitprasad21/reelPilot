import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Routes that are accessible without being signed in
const isPublicRoute = createRouteMatcher([
  "/",            // landing page
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
