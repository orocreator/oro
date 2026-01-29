/**
 * Creator DNA Router
 *
 * Handles Creator DNA operations:
 * - Getting the creator profile
 * - Updating onboarding information
 * - Managing style preferences
 * - Storing knowledge memory
 */

import { z } from 'zod'
import { router, orgProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Validation schemas
const platformTypeSchema = z.enum(['instagram', 'youtube', 'tiktok'])

const stylePreferencesSchema = z.object({
  tone: z.enum(['casual', 'professional', 'educational', 'entertaining']).optional(),
  visual_style: z.string().optional(),
  cta_style: z.enum(['soft', 'direct', 'none']).optional(),
  music_preference: z.string().optional(),
})

const knowledgeMemorySchema = z.object({
  products: z.array(z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().optional(),
  })).optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  brand_guidelines: z.object({
    colors: z.array(z.string()).optional(),
    fonts: z.array(z.string()).optional(),
    dos: z.array(z.string()).optional(),
    donts: z.array(z.string()).optional(),
  }).optional(),
})

export const creatorDnaRouter = router({
  /**
   * Get the current org's Creator DNA
   */
  get: orgProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    const { data, error } = await supabase
      .from('creator_dna')
      .select('*')
      .eq('org_id', orgId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch Creator DNA',
      })
    }

    // If no Creator DNA exists, create one
    if (!data) {
      const { data: newDna, error: createError } = await supabase
        .from('creator_dna')
        .insert({ org_id: orgId })
        .select()
        .single()

      if (createError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create Creator DNA',
        })
      }

      return newDna
    }

    return data
  }),

  /**
   * Update onboarding information (niche, voice, goals, etc.)
   */
  updateOnboarding: orgProcedure
    .input(
      z.object({
        niche: z.string().max(255).optional(),
        voice_description: z.string().max(2000).optional(),
        goals: z.array(z.string()).optional(),
        posting_capacity: z.enum(['daily', '3x_week', 'weekly', 'biweekly']).optional(),
        target_platforms: z.array(platformTypeSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('creator_dna')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update Creator DNA',
        })
      }

      return data
    }),

  /**
   * Update style preferences
   */
  updateStylePreferences: orgProcedure
    .input(stylePreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Get current style preferences
      const { data: current } = await supabase
        .from('creator_dna')
        .select('style_preferences')
        .eq('org_id', orgId)
        .single()

      // Merge with new preferences
      const mergedPreferences = {
        ...(current?.style_preferences || {}),
        ...input,
      }

      const { data, error } = await supabase
        .from('creator_dna')
        .update({
          style_preferences: mergedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update style preferences',
        })
      }

      return data
    }),

  /**
   * Update knowledge memory (products, FAQs, brand guidelines)
   */
  updateKnowledgeMemory: orgProcedure
    .input(knowledgeMemorySchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Get current knowledge memory
      const { data: current } = await supabase
        .from('creator_dna')
        .select('knowledge_memory')
        .eq('org_id', orgId)
        .single()

      // Merge with new knowledge
      const mergedKnowledge = {
        ...(current?.knowledge_memory || {}),
        ...input,
      }

      const { data, error } = await supabase
        .from('creator_dna')
        .update({
          knowledge_memory: mergedKnowledge,
          updated_at: new Date().toISOString(),
        })
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update knowledge memory',
        })
      }

      return data
    }),

  /**
   * Calculate DNA score based on profile completeness
   */
  calculateScore: orgProcedure.query(async ({ ctx }) => {
    const { supabase, orgId } = ctx

    const { data, error } = await supabase
      .from('creator_dna')
      .select('*')
      .eq('org_id', orgId)
      .single()

    if (error || !data) {
      return { score: 0, breakdown: {} }
    }

    // Calculate score based on filled fields
    const breakdown: Record<string, number> = {}
    let totalPoints = 0
    let earnedPoints = 0

    // Basic info (30 points)
    totalPoints += 30
    if (data.niche) { earnedPoints += 10; breakdown.niche = 10 }
    if (data.voice_description) { earnedPoints += 10; breakdown.voice = 10 }
    if (data.goals?.length) { earnedPoints += 10; breakdown.goals = 10 }

    // Capacity & platforms (20 points)
    totalPoints += 20
    if (data.posting_capacity) { earnedPoints += 10; breakdown.capacity = 10 }
    if (data.target_platforms?.length) { earnedPoints += 10; breakdown.platforms = 10 }

    // Style preferences (25 points)
    totalPoints += 25
    const style = data.style_preferences || {}
    if (style.tone) { earnedPoints += 10; breakdown.tone = 10 }
    if (style.cta_style) { earnedPoints += 8; breakdown.cta_style = 8 }
    if (style.visual_style) { earnedPoints += 7; breakdown.visual_style = 7 }

    // Knowledge memory (25 points)
    totalPoints += 25
    const knowledge = data.knowledge_memory || {}
    if (knowledge.products?.length) { earnedPoints += 10; breakdown.products = 10 }
    if (knowledge.faqs?.length) { earnedPoints += 8; breakdown.faqs = 8 }
    if (knowledge.brand_guidelines) { earnedPoints += 7; breakdown.brand = 7 }

    const score = Math.round((earnedPoints / totalPoints) * 100)

    // Update the score in the database
    await supabase
      .from('creator_dna')
      .update({ dna_score: score })
      .eq('org_id', orgId)

    return { score, breakdown }
  }),
})
