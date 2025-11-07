// middleware.js
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { hasValidTokens } from "./lib/validateAuth";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  let pathname = url.pathname;
  const cookieStore = await cookies();

  if (pathname.startsWith("/profile")) {
    // Check if we have the basic token cookies
    if (!cookieStore.get("refreshToken") || !cookieStore.get("accessToken")) {
      url.pathname = "/signin";
      // Add returnUrl query parameter to redirect back after authentication
      url.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Check if tokens are valid (this will try refresh if needed)
    const hasTokens = await hasValidTokens();
    if (!hasTokens) {
      url.pathname = "/signin";
      // Add returnUrl query parameter to redirect back after authentication
      url.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Only touch /colleges/... routes
  if (pathname.startsWith("/colleges/")) {
    pathname = pathname.replace(/-(\d+)(-\1)+/, "-$1");
    pathname = pathname.replace(/\/scholarships$/, "/scholarship");
  }

  if (pathname !== url.pathname) {
    url.pathname = pathname;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}
