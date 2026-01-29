/**
 * Platform Connection Router
 *
 * Handles platform OAuth connections:
 * - Listing connected platforms
 * - Initiating OAuth flows
 * - Storing/refreshing tokens
 * - Disconnecting platforms
 */

import { z } from 'zod'
import { router, orgProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const platformTypeSchema = z.enum(['instagram', 'youtube', 'tiktok'])

export const platformConnectionRouter = router({
  /**
   * List all platform connections for the org
   */
  list: orgProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    const { data, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch platform connections',
      })
    }

    // Don't expose tokens to the client
    return data.map(conn => ({
      ...conn,
      access_token: conn.access_token ? '***' : null,
      refresh_token: conn.refresh_token ? '***' : null,
    }))
  }),

  /**
   * Get a specific platform connection
   */
  get: orgProcedure
    .input(z.object({ platform: platformTypeSchema }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('org_id', orgId)
        .eq('platform', input.platform)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch platform connection',
        })
      }

      if (!data) {
        return null
      }

      // Don't expose tokens
      return {
        ...data,
        access_token: data.access_token ? '***' : null,
        refresh_token: data.refresh_token ? '***' : null,
      }
    }),

  /**
   * Store OAuth tokens after successful authorization
   * Called from the OAuth callback
   */
  storeTokens: orgProcedure
    .input(
      z.object({
        platform: platformTypeSchema,
        account_id: z.string(),
        account_name: z.string().optional(),
        account_username: z.string().optional(),
        access_token: z.string(),
        refresh_token: z.string().optional(),
        token_expires_at: z.string().optional(),
        scopes: z.array(z.string()).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Check if connection already exists
      const { data: existing } = await supabase
        .from('platform_connections')
        .select('id')
        .eq('org_id', orgId)
        .eq('platform', input.platform)
        .eq('account_id', input.account_id)
        .single()

      if (existing) {
        // Update existing connection
        const { data, error } = await supabase
          .from('platform_connections')
          .update({
            account_name: input.account_name,
            account_username: input.account_username,
            access_token: input.access_token,
            refresh_token: input.refresh_token,
            token_expires_at: input.token_expires_at,
            scopes: input.scopes,
            metadata: input.metadata,
            status: 'connected',
            connected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update platform connection',
          })
        }

        return { ...data, access_token: '***', refresh_token: '***' }
      }

      // Create new connection
      const { data, error } = await supabase
        .from('platform_connections')
        .insert({
          org_id: orgId,
          platform: input.platform,
          account_id: input.account_id,
          account_name: input.account_name,
          account_username: input.account_username,
          access_token: input.access_token,
          refresh_token: input.refresh_token,
          token_expires_at: input.token_expires_at,
          scopes: input.scopes,
          metadata: input.metadata,
          status: 'connected',
          connected_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create platform connection',
        })
      }

      return { ...data, access_token: '***', refresh_token: '***' }
    }),

  /**
   * Disconnect a platform
   */
  disconnect: orgProcedure
    .input(z.object({ platform: platformTypeSchema }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { error } = await supabase
        .from('platform_connections')
        .update({
          status: 'disconnected',
          access_token: null,
          refresh_token: null,
          updated_at: new Date().toISOString(),
        })
        .eq('org_id', orgId)
        .eq('platform', input.platform)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disconnect platform',
        })
      }

      return { success: true }
    }),

  /**
   * Update connection status (used by sync jobs)
   */
  updateStatus: orgProcedure
    .input(
      z.object({
        platform: platformTypeSchema,
        status: z.enum(['connected', 'disconnected', 'error', 'pending']),
        last_sync_at: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const updateData: Record<string, unknown> = {
        status: input.status,
        updated_at: new Date().toISOString(),
      }

      if (input.last_sync_at) {
        updateData.last_sync_at = input.last_sync_at
      }

      if (input.metadata) {
        // Merge metadata
        const { data: current } = await supabase
          .from('platform_connections')
          .select('metadata')
          .eq('org_id', orgId)
          .eq('platform', input.platform)
          .single()

        updateData.metadata = {
          ...(current?.metadata || {}),
          ...input.metadata,
        }
      }

      const { data, error } = await supabase
        .from('platform_connections')
        .update(updateData)
        .eq('org_id', orgId)
        .eq('platform', input.platform)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update connection status',
        })
      }

      return { ...data, access_token: '***', refresh_token: '***' }
    }),

  /**
   * Get connection summary for dashboard
   */
  summary: orgProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    const { data, error } = await supabase
      .from('platform_connections')
      .select('platform, status, last_sync_at, account_name')
      .eq('org_id', orgId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch connection summary',
      })
    }

    return {
      total: data.length,
      connected: data.filter(c => c.status === 'connected').length,
      platforms: data,
    }
  }),
})
