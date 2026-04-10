// GET /auth/callback — Handles Google OAuth callback
import { signJwt, parseCookies } from './_jwt.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Handle errors from Google
  if (error) {
    return Response.redirect(`${url.origin}/?login_error=${error}`, 302);
  }

  if (!code || !state) {
    return Response.redirect(`${url.origin}/?login_error=missing_params`, 302);
  }

  // Verify state matches cookie
  const cookies = parseCookies(request.headers.get('Cookie'));
  if (cookies.oauth_state !== state) {
    return Response.redirect(`${url.origin}/?login_error=invalid_state`, 302);
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${url.origin}/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error('Token exchange failed:', err);
      // Temporarily expose Google's error detail in the URL for debugging
      return Response.redirect(`${url.origin}/?login_error=token_exchange_failed&detail=${encodeURIComponent(err)}`, 302);
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return Response.redirect(`${url.origin}/?login_error=userinfo_failed`, 302);
    }

    const userInfo = await userInfoResponse.json();

    // Upsert user in D1 database
    await env.DB.prepare(
      `INSERT INTO users (google_id, email, name, picture, last_login)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(google_id) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         picture = excluded.picture,
         last_login = CURRENT_TIMESTAMP`
    )
      .bind(userInfo.id, userInfo.email, userInfo.name, userInfo.picture)
      .run();

    // Create JWT session token
    const jwt = await signJwt(
      {
        sub: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      env.JWT_SECRET
    );

    // Set session cookie and redirect to home
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.origin + '/',
        'Set-Cookie': [
          `session=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 3600}`,
          // Clear the oauth_state cookie
          `oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
        ].join(', '),
      },
    });
  } catch (err) {
    console.error('OAuth callback error:', err);
    return Response.redirect(`${url.origin}/?login_error=server_error`, 302);
  }
}
