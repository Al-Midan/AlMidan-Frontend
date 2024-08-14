import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isStaticAsset(pathname: string) {
  return /\.(jpg|jpeg|png|gif|svg|ico|css|js|avif)$/i.test(pathname);
}

export async function middleware(request: NextRequest) {
  console.log("Middleware started for path:", request.nextUrl.pathname);

  // Skip middleware for static assets
  if (isStaticAsset(request.nextUrl.pathname)) {
    console.log("Static asset detected, skipping middleware");
    return NextResponse.next();
  }

  // Allow access to all routes
  console.log("Allowing access to all routes");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // Match root
    "/login", // Match login page
    "/register", // Match registration page
    "/admin/:path*", // Match all admin routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // Match all other routes
    "/:path*.(jpg|jpeg|png|gif|svg|ico|css|js|avif)", // Match static assets
  ],
}