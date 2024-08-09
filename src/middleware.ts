import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { REFRESHTOKEN, USERVALUES } from "./shared/helpers/endpoints";
import axiosInstance from "./shared/helpers/axiosInstance";
import axios from "axios";
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
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  console.log("Access token:", accessToken ? "Present" : "Not present");
  console.log("Refresh token:", refreshToken ? "Present" : "Not present");

  const authRoutes = ["/login", "/register"];
  const adminRoutes = [
    "/admin",
    "/admin/Complaint-Management",
    "/admin/Course-Management",
    "/admin/User-Management",
  ];
  const userRoutes = [
    "/profile",
    "/home",
    "/course",
    "/service",
    "/complaints",
  ];

  // Handle the root route "/"
  if (request.nextUrl.pathname === "/") {
    if (!accessToken && !refreshToken) {
      console.log("User accessing root without tokens, allowing access");
      return NextResponse.next();
    } else {
      console.log("User accessing root with tokens, redirecting");
      return verifyTokenAndRedirectHome(request, accessToken, refreshToken);
    }
  }

  // If it's the login page and there are tokens, attempt to verify and redirect
  if (request.nextUrl.pathname === "/login" && (accessToken || refreshToken)) {
    console.log("User accessing login page with tokens present, verifying...");
    return verifyTokenAndRedirectHome(request, accessToken, refreshToken);
  }

  // If it's an auth route and there's no access token, allow access
  if (authRoutes.includes(request.nextUrl.pathname) && !accessToken) {
    console.log("Unauthenticated user accessing auth route, allowing access");
    return NextResponse.next();
  }

  // If there are tokens, attempt to verify or refresh
  if (accessToken || refreshToken) {
    return verifyTokenAndRedirect(request, accessToken, refreshToken);
  }

  // If no tokens at all, redirect to login
  console.log("No tokens present, redirecting to login");
  return NextResponse.redirect(new URL("/login", request.url));
}

async function verifyTokenAndRedirectHome(
  request: NextRequest,
  accessToken: string | undefined,
  refreshToken: string | undefined
) {
  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_KEY);
      const { payload } = await jwtVerify(accessToken, secret);

      const response = await axiosInstance.get(USERVALUES, {
        params: { email: (payload as { email: string }).email },
      });

      if (response.data && response.data.data) {
        if (response.data.isBlocked) {
          console.log("User is blocked");
          const res = NextResponse.redirect(new URL("/login", request.url));
          res.cookies.delete("access_token");
          res.cookies.delete("refresh_token");
          return res;
        }

        const userRole = response.data.data.roles;

        if (userRole === "admin") {
          console.log("Admin user, redirecting to admin home");
          return NextResponse.redirect(new URL("/admin", request.url));
        } else {
          console.log("Regular user, redirecting to user home");
          return NextResponse.redirect(new URL("/home", request.url));
        }
      } else {
        console.log("Invalid user data received");
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      return handleTokenRefresh(request, refreshToken);
    }
  }

  return handleTokenRefresh(request, refreshToken);
}

async function verifyTokenAndRedirect(
  request: NextRequest,
  accessToken: string | undefined,
  refreshToken: string | undefined
) {
  if (accessToken) {
    console.log("Verifying access token and checking user role");
    try {
      const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_KEY);
      const { payload } = await jwtVerify(accessToken, secret);

      const response = await axiosInstance.get(USERVALUES, {
        params: { email: (payload as { email: string }).email },
      });

      if (response.data && response.data.data) {
        if (response.data.isBlocked) {
          console.log("User is blocked");
          const res = NextResponse.redirect(new URL("/login", request.url));
          res.cookies.delete("access_token");
          res.cookies.delete("refresh_token");
          return res;
        }

        const userRole = response.data.data.roles;
        const currentPath = request.nextUrl.pathname;

        if (userRole === "admin") {
          if (!currentPath.startsWith("/admin")) {
            console.log(
              "Admin accessing non-admin route, redirecting to admin home"
            );
            return NextResponse.redirect(new URL("/admin", request.url));
          }
        } else {
          if (currentPath.startsWith("/admin")) {
            console.log(
              "Non-admin user attempting to access admin route, redirecting to user home"
            );
            return NextResponse.redirect(new URL("/home", request.url));
          }
        }

        console.log("Access granted");
        return NextResponse.next();
      } else {
        console.log("Invalid user data received");
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      return handleTokenRefresh(request, refreshToken);
    }
  }

  return handleTokenRefresh(request, refreshToken);
}

async function handleTokenRefresh(
  request: NextRequest,
  refreshToken: string | undefined
) {
  if (refreshToken) {
    console.log("Attempting to refresh token");
    try {
      const response = await axiosInstance.post(REFRESHTOKEN, { refreshToken });

      if (response.status === 200) {
        const { accessToken: newAccessToken } = response.data;
        console.log("Token refreshed successfully");

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

      // If refresh fails, clear both tokens and redirect to login
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      return res;
    }
  }

  console.log("Authentication failed, redirecting to login");
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/:path*.(jpg|jpeg|png|gif|svg|ico|css|js|avif)",
  ],
};
