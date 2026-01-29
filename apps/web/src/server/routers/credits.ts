/**
 * Credits Router
 *
 * Handles credit operations:
 * - Getting current balance
 * - Consuming credits
 * - Viewing transaction history
 */

import { z } from 'zod'
import { router, orgProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const transactionTypeSchema = z.enum(['grant', 'purchase', 'consumption', 'refund', 'adjustment'])

export const creditsRouter = router({
  /**
   * Get current credit balance
   */
  balance: orgProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    const { data, error } = await supabase
      .from('organizations')
      .select('credit_balance, plan_tier')
      .eq('id', orgId)
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch credit balance',
      })
    }

    return {
      balance: data.credit_balance,
      plan_tier: data.plan_tier,
    }
  }),

  /**
   * Get transaction history
   */
  history: orgProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        type: transactionTypeSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('credit_ledger')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (input.type) {
        query = query.eq('transaction_type', input.type)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transaction history',
        })
      }

      return {
        items: data,
        total: count || 0,
        hasMore: (count || 0) > input.offset + input.limit,
      }
    }),

  /**
   * Consume credits (called by jobs/workflows)
   */
  consume: orgProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().max(500),
        job_id: z.string().uuid().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Get current balance
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('credit_balance')
        .eq('id', orgId)
        .single()

      if (orgError || !org) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch organization',
        })
      }

      // Check if sufficient balance
      if (org.credit_balance < input.amount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Insufficient credits',
        })
      }

      const newBalance = org.credit_balance - input.amount

      // Create ledger entry (trigger will update org balance)
      const { data, error } = await supabase
        .from('credit_ledger')
        .insert({
          org_id: orgId,
          amount: -input.amount, // Negative for consumption
          balance_after: newBalance,
          transaction_type: 'consumption',
          description: input.description,
          job_id: input.job_id,
          metadata: input.metadata,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to consume credits',
        })
      }

      return {
        transaction: data,
        newBalance,
      }
    }),

  /**
   * Check if org has sufficient credits
   */
  canAfford: orgProcedure
    .input(z.object({ amount: z.number().positive() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('organizations')
        .select('credit_balance')
        .eq('id', orgId)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check balance',
        })
      }

      return {
        canAfford: data.credit_balance >= input.amount,
        currentBalance: data.credit_balance,
        required: input.amount,
        shortfall: Math.max(0, input.amount - data.credit_balance),
      }
    }),

  /**
   * Grant credits (admin/system operation)
   * In production, this would require admin auth
   */
  grant: orgProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().max(500),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Get current balance
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('credit_balance')
        .eq('id', orgId)
        .single()

      if (orgError || !org) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch organization',
        })
      }

      const newBalance = org.credit_balance + input.amount

      // Create ledger entry (trigger will update org balance)
      const { data, error } = await supabase
        .from('credit_ledger')
        .insert({
          org_id: orgId,
          amount: input.amount, // Positive for grant
          balance_after: newBalance,
          transaction_type: 'grant',
          description: input.description,
          metadata: input.metadata,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to grant credits',
        })
      }

      return {
        transaction: data,
        newBalance,
      }
    }),

  /**
   * Get usage summary for the current period
   */
  usageSummary: orgProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    // Get transactions from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data } = await supabase
      .from('credit_ledger')
      .select('amount, transaction_type, description, created_at')
      .eq('org_id', orgId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    let consumed = 0
    let granted = 0
    const byDescription: Record<string, number> = {}

    data?.forEach(tx => {
      if (tx.amount < 0) {
        consumed += Math.abs(tx.amount)
        const desc = tx.description || 'Other'
        byDescription[desc] = (byDescription[desc] || 0) + Math.abs(tx.amount)
      } else {
        granted += tx.amount
      }
    })

    return {
      periodDays: 30,
      consumed,
      granted,
      net: granted - consumed,
      byDescription,
      transactionCount: data?.length || 0,
    }
  }),
})
