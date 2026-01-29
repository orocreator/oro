/**
 * User Router
 *
 * Handles user-related operations including:
 * - Syncing Clerk users to Supabase
 * - Getting current user profile
 * - Updating user settings
 */

import { z } from 'zod'
import { router, protectedProcedure, orgProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const userRouter = router({
  /**
   * Get the current user's profile
   * Creates user + org if they don't exist (first login)
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // Try to find existing user
    let { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('clerk_id', userId)
      .single()

    // If user doesn't exist, create them with a new org
    if (error?.code === 'PGRST116' || !user) {
      // Create new organization first
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'My Workspace',
          credit_balance: 1000,
          plan_tier: 'free',
        })
        .select()
        .single()

      if (orgError || !org) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create organization',
        })
      }

      // Create user linked to org
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          org_id: org.id,
          clerk_id: userId,
          email: '', // Will be updated from Clerk webhook
          role: 'owner',
        })
        .select(`
          *,
          organization:organizations(*)
        `)
        .single()

      if (userError || !newUser) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        })
      }

      // Create empty Creator DNA for the org
      await supabase.from('creator_dna').insert({
        org_id: org.id,
      })

      user = newUser
    }

    return user
  }),

  /**
   * Update user profile
   */
  updateProfile: orgProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const { data, error } = await supabase
        .from('users')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', userId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        })
      }

      return data
    }),

  /**
   * Sync user data from Clerk (called after auth)
   */
  syncFromClerk: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      const name = [input.firstName, input.lastName].filter(Boolean).join(' ') || null

      const { data, error } = await supabase
        .from('users')
        .update({
          email: input.email,
          name,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', userId)
        .select()
        .single()

      if (error) {
        // User might not exist yet, that's ok
        return null
      }

      return data
    }),
})
