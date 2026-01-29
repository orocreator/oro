/**
 * Recommendation Router
 *
 * Handles the Decision Engine:
 * - Getting current recommendation
 * - Accepting/rejecting recommendations
 * - Listing recommendation history
 * - Tracking outcomes
 */

import { z } from 'zod'
import { router, orgProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const platformTypeSchema = z.enum(['instagram', 'youtube', 'tiktok'])
const contentTypeSchema = z.enum(['video', 'image', 'carousel', 'text', 'story', 'reel', 'short'])
const recommendationStatusSchema = z.enum(['pending', 'accepted', 'modified', 'rejected', 'published'])

export const recommendationRouter = router({
  /**
   * Get the current active recommendation
   * This is the "What should I post next?" answer
   */
  current: orgProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    // Get the most recent pending recommendation
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recommendation',
      })
    }

    return data || null
  }),

  /**
   * Get a specific recommendation by ID
   */
  get: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recommendation not found',
        })
      }

      return data
    }),

  /**
   * List recommendation history with pagination
   */
  list: orgProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: recommendationStatusSchema.optional(),
        platform: platformTypeSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('recommendations')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (input.status) {
        query = query.eq('status', input.status)
      }

      if (input.platform) {
        query = query.eq('platform', input.platform)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recommendations',
        })
      }

      return {
        items: data,
        total: count || 0,
        hasMore: (count || 0) > input.offset + input.limit,
      }
    }),

  /**
   * Accept a recommendation
   */
  accept: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('recommendations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to accept recommendation',
        })
      }

      return data
    }),

  /**
   * Accept with modifications
   */
  acceptWithModifications: orgProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        modifications: z.object({
          platform: platformTypeSchema.optional(),
          format: contentTypeSchema.optional(),
          hook_angle: z.string().optional(),
          structure: z.string().optional(),
          timing_suggestion: z.record(z.string(), z.unknown()).optional(),
          hashtag_guidance: z.array(z.string()).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('recommendations')
        .update({
          status: 'modified',
          accepted_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          user_modifications: input.modifications,
          // Also update the actual fields if provided
          ...(input.modifications.platform && { platform: input.modifications.platform }),
          ...(input.modifications.format && { format: input.modifications.format }),
          ...(input.modifications.hook_angle && { hook_angle: input.modifications.hook_angle }),
          ...(input.modifications.structure && { structure: input.modifications.structure }),
          ...(input.modifications.timing_suggestion && { timing_suggestion: input.modifications.timing_suggestion }),
          ...(input.modifications.hashtag_guidance && { hashtag_guidance: input.modifications.hashtag_guidance }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to modify recommendation',
        })
      }

      return data
    }),

  /**
   * Reject a recommendation
   */
  reject: orgProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('recommendations')
        .update({
          status: 'rejected',
          user_modifications: input.reason ? { rejection_reason: input.reason } : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject recommendation',
        })
      }

      return data
    }),

  /**
   * Mark recommendation as published and link to content
   */
  markPublished: orgProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content_id: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('recommendations')
        .update({
          status: 'published',
          outcome_content_id: input.content_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark as published',
        })
      }

      return data
    }),

  /**
   * Create a new recommendation (called by generation jobs)
   */
  create: orgProcedure
    .input(
      z.object({
        platform: platformTypeSchema,
        format: contentTypeSchema,
        hook_angle: z.string().optional(),
        structure: z.string().optional(),
        timing_suggestion: z.record(z.string(), z.unknown()).optional(),
        hashtag_guidance: z.array(z.string()).optional(),
        metadata_guidance: z.record(z.string(), z.unknown()).optional(),
        reasoning: z.record(z.string(), z.unknown()),
        confidence_score: z.number().min(0).max(1).optional(),
        confidence_breakdown: z.record(z.string(), z.number()).optional(),
        trend_pattern_ids: z.array(z.string().uuid()).optional(),
        based_on_content_ids: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('recommendations')
        .insert({
          org_id: orgId,
          ...input,
          status: 'pending',
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create recommendation',
        })
      }

      return data
    }),

  /**
   * Get recommendation stats for dashboard
   */
  stats: orgProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    const { data } = await supabase
      .from('recommendations')
      .select('status')
      .eq('org_id', orgId)

    const statusCounts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      modified: 0,
      rejected: 0,
      published: 0,
    }

    data?.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1
    })

    const total = data?.length || 0
    const actedOn = statusCounts.accepted + statusCounts.modified + statusCounts.published
    const acceptanceRate = total > 0 ? actedOn / total : 0

    return {
      total,
      byStatus: statusCounts,
      acceptanceRate,
    }
  }),
})
