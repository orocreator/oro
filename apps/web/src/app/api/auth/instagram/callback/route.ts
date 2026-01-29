/**
 * Instagram OAuth - Callback Handler
 *
 * Exchanges authorization code for access token,
 * fetches Instagram account info, and stores connection
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`

// Create admin Supabase client for storing tokens
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

interface InstagramAccount {
  id: string
  username: string
  name?: string
  profile_picture_url?: string
  followers_count?: number
  media_count?: number
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('Instagram OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/connections?error=${encodeURIComponent(errorDescription || error)}`, process.env.NEXT_PUBLIC_APP_URL)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/connections?error=Missing authorization code', process.env.NEXT_PUBLIC_APP_URL)
    )
  }

  // Verify user is authenticated
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL))
  }

  // Verify state (CSRF protection)
  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())

    // Check state is recent (within 10 minutes)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      throw new Error('State expired')
    }

    // Verify userId matches
    if (stateData.userId !== userId) {
      throw new Error('User mismatch')
    }
  } catch {
    return NextResponse.redirect(
      new URL('/connections?error=Invalid state parameter', process.env.NEXT_PUBLIC_APP_URL)
    )
  }

  try {
    // Exchange code for short-lived access token
    const tokenResponse = await fetch('https://graph.facebook.com/v21.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID!,
        client_secret: INSTAGRAM_APP_SECRET!,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      throw new Error('Failed to exchange authorization code')
    }

    const shortLivedToken: TokenResponse = await tokenResponse.json()

    // Exchange for long-lived access token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${INSTAGRAM_APP_ID}&` +
      `client_secret=${INSTAGRAM_APP_SECRET}&` +
      `fb_exchange_token=${shortLivedToken.access_token}`
    )

    if (!longLivedResponse.ok) {
      const errorData = await longLivedResponse.json()
      console.error('Long-lived token exchange failed:', errorData)
      throw new Error('Failed to get long-lived token')
    }

    const longLivedToken: TokenResponse = await longLivedResponse.json()

    // Get connected Instagram accounts via Facebook Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?` +
      `fields=id,name,instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}&` +
      `access_token=${longLivedToken.access_token}`
    )

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json()
      console.error('Pages fetch failed:', errorData)
      throw new Error('Failed to fetch connected pages')
    }

    const pagesData = await pagesResponse.json()

    // Find Instagram account from pages
    let instagramAccount: InstagramAccount | null = null
    let pageAccessToken: string | null = null

    for (const page of pagesData.data || []) {
      if (page.instagram_business_account) {
        instagramAccount = page.instagram_business_account

        // Get page-specific access token for this Instagram account
        const pageTokenResponse = await fetch(
          `https://graph.facebook.com/v21.0/${page.id}?` +
          `fields=access_token&` +
          `access_token=${longLivedToken.access_token}`
        )

        if (pageTokenResponse.ok) {
          const pageTokenData = await pageTokenResponse.json()
          pageAccessToken = pageTokenData.access_token
        }
        break
      }
    }

    if (!instagramAccount) {
      return NextResponse.redirect(
        new URL('/connections?error=No Instagram Business or Creator account found. Please connect a Business or Creator account to a Facebook Page first.', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    // Get the user's org_id from database
    const supabase = getSupabaseAdmin()

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('org_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      console.error('User not found:', userError)
      throw new Error('User not found in database')
    }

    // Calculate token expiration (60 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 60)

    // Store or update the platform connection
    const { error: connectionError } = await supabase
      .from('platform_connections')
      .upsert({
        org_id: user.org_id,
        platform: 'instagram',
        account_id: instagramAccount.id,
        account_name: instagramAccount.name || instagramAccount.username,
        account_username: instagramAccount.username,
        access_token: pageAccessToken || longLivedToken.access_token,
        token_expires_at: expiresAt.toISOString(),
        scopes: ['instagram_basic', 'instagram_manage_insights', 'pages_show_list', 'pages_read_engagement'],
        status: 'connected',
        connected_at: new Date().toISOString(),
        metadata: {
          followers_count: instagramAccount.followers_count,
          media_count: instagramAccount.media_count,
          profile_picture_url: instagramAccount.profile_picture_url,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'org_id,platform,account_id',
      })

    if (connectionError) {
      console.error('Failed to store connection:', connectionError)
      throw new Error('Failed to store platform connection')
    }

    // Redirect to connections page with success
    return NextResponse.redirect(
      new URL('/connections?success=Instagram connected successfully', process.env.NEXT_PUBLIC_APP_URL)
    )

  } catch (error) {
    console.error('Instagram OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/connections?error=${encodeURIComponent(error instanceof Error ? error.message : 'Connection failed')}`, process.env.NEXT_PUBLIC_APP_URL)
    )
  }
}
