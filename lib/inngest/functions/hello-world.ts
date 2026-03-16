import { inngest } from "@/lib/inngest/client"

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const greeting = await step.run("say-hello", async () => {
      return `Hello, ${event.data.name ?? "World"}!`
    })

    return { message: greeting }
  }
)
