/**
 * tRPC Server Configuration
 *
 * This file sets up the core tRPC infrastructure including:
 * - Context creation with Supabase client and auth
 * - Base router and procedure definitions
 * - Protected procedures that require authentication
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@clerk/nextjs/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Context passed to all tRPC procedures
 */
export interface Context {
  userId: string | null
  orgId: string | null
  supabase: ReturnType<typeof createAdminClient>
}

/**
 * Creates context for each request
 * Called for every incoming request
 */
export async function createContext(): Promise<Context> {
  const { userId } = await auth()

  // Create admin Supabase client (bypasses RLS for backend operations)
  const supabase = createAdminClient()

  // If user is authenticated, look up their org
  let orgId: string | null = null
  if (userId) {
    const { data: user } = await supabase
      .from('users')
      .select('org_id')
      .eq('clerk_id', userId)
      .single()

    orgId = user?.org_id ?? null
  }

  return {
    userId,
    orgId,
    supabase,
  }
}

/**
 * Initialize tRPC with our context
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router
export const publicProcedure = t.procedure
export const createCallerFactory = t.createCallerFactory

/**
 * Middleware that enforces authentication
 */
const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  })
})

/**
 * Middleware that enforces authentication AND org membership
 */
const enforceOrgMembership = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    })
  }

  if (!ctx.orgId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be a member of an organization to perform this action',
    })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      orgId: ctx.orgId,
    },
  })
})

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(enforceAuth)

/**
 * Org procedure - requires authentication AND org membership
 * Most procedures should use this
 */
export const orgProcedure = t.procedure.use(enforceOrgMembership)
