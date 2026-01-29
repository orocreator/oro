/**
 * Instagram OAuth - Initiate Flow
 *
 * Redirects user to Instagram authorization page
 * Uses Instagram Graph API (via Facebook Login)
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`

// Scopes needed for reading creator content and metrics
const SCOPES = [
  'instagram_basic',           // Basic profile and media
  'instagram_manage_insights', // Analytics and metrics
  'pages_show_list',          // List connected pages
  'pages_read_engagement',    // Read page engagement data
].join(',')

export async function GET() {
  // Verify user is authenticated
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL))
  }

  if (!INSTAGRAM_APP_ID) {
    return NextResponse.json(
      { error: 'Instagram app not configured' },
      { status: 500 }
    )
  }

  // Generate state for CSRF protection (include userId for callback)
  const state = Buffer.from(JSON.stringify({
    userId,
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
  })).toString('base64url')

  // Build Instagram OAuth URL (using Facebook Login for Graph API)
  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
  authUrl.searchParams.set('client_id', INSTAGRAM_APP_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('scope', SCOPES)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('state', state)

  return NextResponse.redirect(authUrl.toString())
}
