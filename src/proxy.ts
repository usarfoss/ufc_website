import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { needsSignIn } from "@/server/auth/reauth";

/** Requests that change something must come from this site. Browsers send Origin (and Sec-Fetch-Site) on those, so another site cannot make a member's browser act for them. */
function crossSite(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = request.headers.get("origin");
  return !!origin && origin !== request.nextUrl.origin;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const changes = !["GET", "HEAD", "OPTIONS"].includes(request.method);
    // Sign in has its own protection, and background jobs come from QStash (signed), not a browser.
    const exempt = pathname.startsWith("/api/auth/") || pathname.startsWith("/api/jobs/");
    if (changes && !exempt && crossSite(request)) {
      return NextResponse.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
    }
    return NextResponse.next();
  }

  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Someone whose GitHub connection has run out and could not be renewed is signed out here: their cookie is removed and they are sent to sign
  // in again. (Their old cookie would otherwise keep a dashboard open that can no longer update.)
  const mustSignIn = !!session && typeof session.userId === "string" && (await needsSignIn(session.userId));

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (mustSignIn) return signedOut(request, NextResponse.redirect(new URL("/login?reauth=1", request.url)));
  }

  if (pathname.startsWith("/login") && session) {
    // Signed in members go to their dashboard. Someone who has to sign in again stays here, with the old cookie cleared.
    if (mustSignIn) return signedOut(request, NextResponse.next());
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

/** Removes the sign in cookie (it can be split over several, and has a different name over https). */
function signedOut(request: NextRequest, response: NextResponse) {
  for (const { name } of request.cookies.getAll()) {
    if (name.includes("next-auth.session-token")) response.cookies.delete(name);
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/:path*"],
};
