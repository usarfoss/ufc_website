import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie
  const cookieDomain = process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.ufc-ipu.tech' : undefined);
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    ...(cookieDomain ? { domain: cookieDomain } : {})
  });

  return response;
}