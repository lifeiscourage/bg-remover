// GET /auth/me — Returns current user info from JWT cookie
import { verifyJwt, parseCookies } from './_jwt.js';

export async function onRequestGet(context) {
  const { env, request } = context;

  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies.session;

  if (!token) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifyJwt(token, env.JWT_SECRET);

  if (!payload) {
    // Invalid or expired token — clear the cookie
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      },
    });
  }

  return Response.json({
    authenticated: true,
    user: {
      google_id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    },
  });
}
