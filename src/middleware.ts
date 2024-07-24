import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { REFRESHTOKEN, USERVALUES } from "./shared/helpers/endpoints";
import axiosInstance from "./shared/helpers/axiosInstance";
import axios from "axios";

export async function middleware(request: NextRequest) {
  console.log('Middleware started for path:', request.nextUrl.pathname);

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  console.log('Access token:', accessToken ? 'Present' : 'Not present');
  console.log('Refresh token:', refreshToken ? 'Present' : 'Not present');

  const authRoutes = ["/login", "/register"];
  const adminRoutes = [
    "/admin",
    "/admin/Complaint-Management",
    "/admin/Course-Management",
    "/admin/User-Management"
  ];
  const userRoutes = ["/profile", "/home", "/course", "/service", "/complaints"];

  // If user has both tokens and tries to access auth pages, redirect to appropriate home
  if (authRoutes.includes(request.nextUrl.pathname) && accessToken && refreshToken) {
    console.log('Authenticated user attempting to access auth route');
    return verifyTokenAndRedirect(request, accessToken, refreshToken, true);
  }

  // If neither access token nor refresh token is present, allow access to auth routes, redirect to login for others
  if (!accessToken && !refreshToken) {
    if (authRoutes.includes(request.nextUrl.pathname)) {
      console.log('Unauthenticated user accessing auth route, allowing access');
      return NextResponse.next();
    }
    console.log('No tokens present, redirecting to login');
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For all other routes, verify token and check user role
  return verifyTokenAndRedirect(request, accessToken, refreshToken, false);
}

async function verifyTokenAndRedirect(request: NextRequest, accessToken: string | undefined, refreshToken: string | undefined, isAuthRoute: boolean) {
  if (accessToken) {
    console.log('Verifying access token and checking user role');
    try {
      const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_KEY);
      const { payload } = await jwtVerify(accessToken, secret);

      const response = await axiosInstance.get(USERVALUES, {
        params: { email: (payload as { email: string }).email },
      });

      if (response.data.isBlocked) {
        console.log('User is blocked');
        const res = NextResponse.redirect(new URL("/login", request.url));
        res.cookies.delete("access_token");
        res.cookies.delete("refresh_token");
        return res;
      }

      const isAdmin = response.data.data.roles === "admin";
      const currentPath = request.nextUrl.pathname;

      if (isAuthRoute) {
        // Redirect to appropriate home page if trying to access auth routes
        return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/home", request.url));
      }

      if (isAdmin) {
        if (!currentPath.startsWith("/admin")) {
          console.log('Admin accessing non-admin route, redirecting to admin home');
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } else {
        if (currentPath.startsWith("/admin")) {
          console.log('Non-admin user attempting to access admin route, redirecting to user home');
          return NextResponse.redirect(new URL("/home", request.url));
        }
      }

      console.log('Access granted');
      return NextResponse.next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return handleTokenRefresh(request, refreshToken);
    }
  }

  return handleTokenRefresh(request, refreshToken);
}
async function handleTokenRefresh(request: NextRequest, refreshToken: string | undefined) {
  if (refreshToken) {
    console.log('Attempting to refresh token');
    try {
      const response = await axiosInstance.post(REFRESHTOKEN, { refreshToken });

      if (response.status === 200) {
        const { accessToken: newAccessToken } = response.data;
        console.log('Token refreshed successfully');

        const res = NextResponse.next();
        res.cookies.set("access_token", newAccessToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          maxAge: 3600, // 1 hour
        });
        return res;
      }
    } catch (refreshError) {
      if (axios.isAxiosError(refreshError)) {
        console.error("Token refresh failed:", refreshError.message);
      } else {
        console.error("An unexpected error occurred:", refreshError);
      }
    }
  }

  console.log('Authentication failed, redirecting to login');
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};