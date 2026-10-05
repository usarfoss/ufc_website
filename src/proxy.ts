import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/login") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/:path*"],
};
