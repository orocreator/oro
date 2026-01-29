/**
 * Main App Router
 *
 * Combines all sub-routers into the main tRPC router.
 * This is the root of all API routes.
 */

import { router } from '../trpc'
import { userRouter } from './user'
import { creatorDnaRouter } from './creatorDna'
import { platformConnectionRouter } from './platformConnection'
import { contentRouter } from './content'
import { recommendationRouter } from './recommendation'
import { creditsRouter } from './credits'
import { trendsRouter } from './trends'

export const appRouter = router({
  // User & auth
  user: userRouter,

  // Creator profile
  creatorDna: creatorDnaRouter,

  // Platform connections
  platformConnection: platformConnectionRouter,

  // Content library
  content: contentRouter,

  // Decision engine
  recommendation: recommendationRouter,

  // Credits system
  credits: creditsRouter,

  // Trend intelligence
  trends: trendsRouter,
})

// Export type for client
export type AppRouter = typeof appRouter
