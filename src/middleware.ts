import { NextResponse, NextRequest } from "next/server";
import { getCookieCache } from "better-auth/cookies";

// Auth pages - redirect to home if already logged in
const authPages = ["/signin", "/signup", "/forgot-password", "/reset-password"];

// Protected pages - redirect to signin if not logged in
const protectedPages = new Set([
  "/feed/network",
  "/feed/profile",
  "/feed/notifications",
  "/feed/events/create",
  "/feed/groups/create",
]);

function isProtectedFeedPath(pathname: string): boolean {
  if (protectedPages.has(pathname)) return true;
  if (pathname.startsWith("/feed/profile/")) return true;
  if (/^\/feed\/events\/[^/]+\/edit$/.test(pathname)) return true;
  if (/^\/feed\/groups\/[^/]+\/settings$/.test(pathname)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  let pathname = url.pathname;

  // Get session from cookie cache (validates JWT without DB call)
  // This works because backend has cookieCache enabled with JWT strategy
  const session = await getCookieCache(req);
  const isLoggedIn = !!session;

  // Auth pages: redirect to home if already logged in
  if (authPages.some((page) => pathname.startsWith(page))) {
    if (isLoggedIn) {
      url.pathname = "/";
      return NextResponse.redirect(url, 302);
    }
  }

  // Protected pages: redirect to signin if not logged in
  const isProtectedPage = isProtectedFeedPath(pathname);

  if (isProtectedPage) {
    if (!isLoggedIn) {
      const redirectTarget = `${pathname}${url.search}`;
      url.pathname = "/signin";
      url.search = "";
      url.searchParams.set("redirect", redirectTarget);
      return NextResponse.redirect(url, 302);
    }
  }

  // Only touch /colleges/... routes for URL normalization
  if (pathname.startsWith("/colleges/")) {
    // Case 1: remove duplicate -id at the end of slugs
    // Example: -7019120-7019120 -> -7019120
    pathname = pathname.replace(/-(\d+)(-\1)+/, "-$1");

    // Case 3: normalize "scholarships" → "scholarship"
    pathname = pathname.replace(/\/scholarships$/, "/scholarship");
  }

  // If we changed the path → redirect
  if (pathname !== url.pathname) {
    url.pathname = pathname;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Auth pages
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    // Protected pages
    "/feed/network",
    "/feed/profile/:path*",
    "/feed/notifications",
    "/feed/events/create",
    "/feed/events/:eventId/edit",
    "/feed/groups/create",
    "/feed/groups/:slugId/settings",
    // Colleges URL normalization
    "/colleges/:path*",
  ],
};
