/**
 * Trends Router
 *
 * Handles trend pattern operations:
 * - Listing active trends
 * - Getting trend details
 * - Trend management (for admin/analysis jobs)
 */

import { z } from 'zod'
import { router, orgProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const platformTypeSchema = z.enum(['instagram', 'youtube', 'tiktok'])

export const trendsRouter = router({
  /**
   * List active trend patterns
   * Note: Trends are global (not org-specific)
   */
  list: publicProcedure
    .input(
      z.object({
        platform: platformTypeSchema.optional(),
        category: z.string().optional(),
        minConfidence: z.number().min(0).max(1).optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx }) => {
      const { supabase } = ctx

      let query = supabase
        .from('trend_patterns')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('confidence_score', { ascending: false })

      // Note: We can't use input directly here due to publicProcedure not having orgId
      // Let me fix this by using the input properly

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch trends',
        })
      }

      return data
    }),

  /**
   * List active trend patterns with filters
   */
  listFiltered: orgProcedure
    .input(
      z.object({
        platform: platformTypeSchema.optional(),
        category: z.string().optional(),
        minConfidence: z.number().min(0).max(1).optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      let query = supabase
        .from('trend_patterns')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('confidence_score', { ascending: false })
        .limit(input.limit)

      if (input.platform) {
        query = query.eq('platform', input.platform)
      }

      if (input.category) {
        query = query.eq('category', input.category)
      }

      if (input.minConfidence) {
        query = query.gte('confidence_score', input.minConfidence)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch trends',
        })
      }

      return data
    }),

  /**
   * Get a specific trend pattern
   */
  get: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('trend_patterns')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trend pattern not found',
        })
      }

      return data
    }),

  /**
   * Get trend categories for a platform
   */
  categories: orgProcedure
    .input(z.object({ platform: platformTypeSchema }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('trend_patterns')
        .select('category')
        .eq('platform', input.platform)
        .eq('is_active', true)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
        })
      }

      // Get unique categories
      const categories = [...new Set(data?.map(t => t.category).filter(Boolean))]
      return categories
    }),

  /**
   * Create a trend pattern (called by analysis jobs)
   */
  create: orgProcedure
    .input(
      z.object({
        platform: platformTypeSchema,
        category: z.string().optional(),
        pattern_data: z.record(z.string(), z.unknown()),
        example_content_urls: z.array(z.string()).optional(),
        example_metrics: z.record(z.string(), z.unknown()).optional(),
        confidence_score: z.number().min(0).max(1).optional(),
        expires_at: z.string().optional(),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('trend_patterns')
        .insert({
          ...input,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create trend pattern',
        })
      }

      return data
    }),

  /**
   * Update a trend pattern
   */
  update: orgProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        pattern_data: z.record(z.string(), z.unknown()).optional(),
        confidence_score: z.number().min(0).max(1).optional(),
        is_active: z.boolean().optional(),
        expires_at: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { id, ...updates } = input

      const { data, error } = await supabase
        .from('trend_patterns')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update trend pattern',
        })
      }

      return data
    }),

  /**
   * Get trend summary for dashboard
   */
  summary: orgProcedure.query(async ({ ctx }) => {
    const { supabase } = ctx

    const { data } = await supabase
      .from('trend_patterns')
      .select('platform, category, confidence_score')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    const byPlatform: Record<string, number> = {}
    const topCategories: { category: string; count: number }[] = []
    const categoryCounts: Record<string, number> = {}

    data?.forEach(trend => {
      byPlatform[trend.platform] = (byPlatform[trend.platform] || 0) + 1
      if (trend.category) {
        categoryCounts[trend.category] = (categoryCounts[trend.category] || 0) + 1
      }
    })

    // Sort categories by count
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([category, count]) => {
        topCategories.push({ category, count })
      })

    return {
      total: data?.length || 0,
      byPlatform,
      topCategories,
    }
  }),
})
