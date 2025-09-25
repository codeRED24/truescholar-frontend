// middleware.js
import { NextResponse } from "next/server";

export function middleware(req: any) {
  const url = req.nextUrl.clone();
  let pathname = url.pathname;

  // Only touch /colleges/... routes
  if (pathname.startsWith("/colleges/")) {
    // Case 1: remove duplicate -id at the end of slugs
    // Example: -7019120-7019120 -> -7019120
    pathname = pathname.replace(/-(\d+)(-\1)+/, "-$1");

    // Case 3: normalize "scholarships" → "scholarship"
    pathname = pathname.replace(/\/scholarships$/, "/scholarship");

    // Case 4: if /colleges/... has NO numeric ID at the end → redirect to /
    // const hasId = /-\d+$/.test(pathname);
    // if (!hasId) {
    //   pathname = "/colleges";
    // }
  }

  // If we changed the path → redirect
  if (pathname !== url.pathname) {
    url.pathname = pathname;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}
