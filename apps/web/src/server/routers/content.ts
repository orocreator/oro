/**
 * Content Router
 *
 * Handles content library operations:
 * - Listing content
 * - Uploading content
 * - Importing from URL
 * - Getting content details
 * - Updating metrics
 */

import { z } from 'zod'
import { router, orgProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const contentTypeSchema = z.enum(['video', 'image', 'carousel', 'text', 'story', 'reel', 'short'])
const contentSourceSchema = z.enum(['synced', 'uploaded', 'url_import', 'generated'])
const platformTypeSchema = z.enum(['instagram', 'youtube', 'tiktok'])

const contentMetricsSchema = z.object({
  views: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
  saves: z.number().optional(),
  retention: z.number().min(0).max(1).optional(),
  reach: z.number().optional(),
  impressions: z.number().optional(),
  engagement_rate: z.number().optional(),
  watch_time_seconds: z.number().optional(),
})

export const contentRouter = router({
  /**
   * List content with pagination and filters
   */
  list: orgProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        platform: platformTypeSchema.optional(),
        content_type: contentTypeSchema.optional(),
        source: contentSourceSchema.optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('content')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (input.platform) {
        query = query.eq('platform', input.platform)
      }

      if (input.content_type) {
        query = query.eq('content_type', input.content_type)
      }

      if (input.source) {
        query = query.eq('source', input.source)
      }

      if (input.search) {
        query = query.or(`title.ilike.%${input.search}%,description.ilike.%${input.search}%`)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch content',
        })
      }

      return {
        items: data,
        total: count || 0,
        hasMore: (count || 0) > input.offset + input.limit,
      }
    }),

  /**
   * Get a single content item
   */
  get: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content not found',
        })
      }

      return data
    }),

  /**
   * Create content record (for uploads)
   */
  create: orgProcedure
    .input(
      z.object({
        content_type: contentTypeSchema,
        source: contentSourceSchema.default('uploaded'),
        title: z.string().max(500).optional(),
        description: z.string().optional(),
        platform: platformTypeSchema.optional(),
        storage_url: z.string().optional(),
        storage_path: z.string().optional(),
        file_size_bytes: z.number().optional(),
        duration_seconds: z.number().optional(),
        thumbnail_url: z.string().optional(),
        external_url: z.string().optional(),
        external_id: z.string().optional(),
        published_at: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('content')
        .insert({
          org_id: orgId,
          ...input,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create content',
        })
      }

      return data
    }),

  /**
   * Update content metadata
   */
  update: orgProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().max(500).optional(),
        description: z.string().optional(),
        transcript: z.string().optional(),
        thumbnail_url: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx
      const { id, ...updates } = input

      const { data, error } = await supabase
        .from('content')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update content',
        })
      }

      return data
    }),

  /**
   * Update content metrics (called by sync jobs)
   */
  updateMetrics: orgProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        metrics: contentMetricsSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Get current metrics to merge
      const { data: current } = await supabase
        .from('content')
        .select('metrics')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      const mergedMetrics = {
        ...(current?.metrics || {}),
        ...input.metrics,
      }

      const { data, error } = await supabase
        .from('content')
        .update({
          metrics: mergedMetrics,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update metrics',
        })
      }

      return data
    }),

  /**
   * Delete content
   */
  delete: orgProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete content',
        })
      }

      return { success: true }
    }),

  /**
   * Get content statistics for dashboard
   */
  stats: orgProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    // Get counts by platform
    const { data: byPlatform } = await supabase
      .from('content')
      .select('platform')
      .eq('org_id', orgId)

    // Get counts by source
    const { data: bySource } = await supabase
      .from('content')
      .select('source')
      .eq('org_id', orgId)

    // Get total count
    const { count: total } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)

    // Calculate platform breakdown
    const platformCounts: Record<string, number> = {}
    byPlatform?.forEach(item => {
      const platform = item.platform || 'unknown'
      platformCounts[platform] = (platformCounts[platform] || 0) + 1
    })

    // Calculate source breakdown
    const sourceCounts: Record<string, number> = {}
    bySource?.forEach(item => {
      sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1
    })

    return {
      total: total || 0,
      byPlatform: platformCounts,
      bySource: sourceCounts,
    }
  }),
})
