/**
 * tRPC Client Configuration
 *
 * Sets up the tRPC client with React Query integration.
 */

import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/routers/_app'

/**
 * tRPC React hooks
 * Use this in components to call API endpoints
 *
 * Example:
 *   const { data } = trpc.user.me.useQuery()
 *   const mutation = trpc.creatorDna.updateOnboarding.useMutation()
 */
export const trpc = createTRPCReact<AppRouter>()
