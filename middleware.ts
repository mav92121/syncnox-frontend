import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Get the authentication cookie
  const token = request.cookies.get("access_token");
  const { pathname } = request.nextUrl;

  // If user is not authenticated and trying to access protected routes
  if (!token && pathname !== "/sign-in") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If user is authenticated and trying to access sign-in page, redirect to dashboard
  if (token && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure which routes should be checked by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (logo.svg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)",
  ],
};
