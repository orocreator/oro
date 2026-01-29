"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { ThemeProvider } from "@/components/theme-provider"
import { TRPCProvider } from "@/lib/trpc/provider"

export function Providers({ children }: { children: React.ReactNode }) {
  // Check if Clerk is configured
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // If Clerk is not configured, render without auth (for development/build)
  if (!clerkPubKey) {
    return (
      <TRPCProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TRPCProvider>
    )
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#ffffff",
          colorBackground: "#0a0a0a",
        },
      }}
    >
      <TRPCProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TRPCProvider>
    </ClerkProvider>
  )
}
