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
  const protectedRoutePrefixes = ["/admin", "/course"];

  // If user has both tokens and tries to access auth pages, redirect to home
  if (authRoutes.includes(request.nextUrl.pathname) && accessToken && refreshToken) {
    console.log('Redirecting authenticated user from auth route to home');
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Allow access to login and register pages even without tokens
  if (authRoutes.includes(request.nextUrl.pathname)) {
    console.log('Allowing access to auth route');
    return NextResponse.next();
  }

  // If neither access token nor refresh token is present, redirect to login for non-auth URLs
  if (!accessToken && !refreshToken) {
    console.log('No tokens present, redirecting to login');
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For all routes (including protected ones), check if the user is blocked
  if (accessToken) {
    console.log('Verifying access token and checking if user is blocked');
    try {
      const secret = new TextEncoder().encode(process.env.JWT_KEY || "qw8U4DWxcbsNZXWdjkUYheEzFshbDSNE");
      const { payload } = await jwtVerify(accessToken, secret);

      // Use Axios for the API request
      const response = await axiosInstance.get(USERVALUES, {
        params: { email: (payload as { email: string }).email },
      });

      // Check if user is blocked
      if (response.data.isBlocked) {
        console.log('User is blocked');
        // Clear the tokens
        const res = NextResponse.redirect(new URL("/login", request.url));
        res.cookies.delete("access_token");
        res.cookies.delete("refresh_token");
        return res;
      }
      // For protected routes, check for admin role
      if (protectedRoutePrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
        if (request.nextUrl.pathname.startsWith("/admin") && response.data.data.roles !== "admin") {
          console.log('Non-admin user attempting to access admin route, redirecting to home');
          return NextResponse.redirect(new URL("/home", request.url));
        }
      }

      console.log('Access granted');
      // Token is valid and user is not blocked, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      console.error("Token verification failed:", error);

      // Try to refresh the token if refresh token is present
      if (refreshToken) {
        console.log('Attempting to refresh token after verification failure');
        try {
          const response = await axiosInstance.post(REFRESHTOKEN, { refreshToken });

          if (response.status === 200) {
            const { accessToken: newAccessToken } = response.data;
            console.log('Token refreshed successfully after verification failure');

            // Set the new access token in the response
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
      // If refresh failed or no refresh token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  console.log('Allowing request to proceed');
  // For non-protected routes, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/admin/:path*", "/course/:path*", "/home"],
};