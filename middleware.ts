import { NextRequest, NextResponse } from "next/server";

/**
 * Helper function to get user data from cookie
 */
function getUserFromCookie(request: NextRequest): any {
  try {
    const userDataCookie = request.cookies.get("ravine_user_data")?.value;
    if (!userDataCookie) return null;
    return JSON.parse(decodeURIComponent(userDataCookie));
  } catch (error) {
    console.error("Error parsing user data from cookie:", error);
    return null;
  }
}

/**
 * Get the default dashboard URL based on user role
 */
export function getDefaultDashboard(role: string): string {
  switch (role) {
    case "farmer":
      return "/farmer/dashboard";
    case "farm_supervisor":
      return "/supervisor/dashboard";
    case "plucker":
      return "/plucker/dashboard";
    case "admin":
    default:
      return "/dashboard";
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("ravine_auth_token")?.value;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/unauthorized"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    // Redirect authenticated users from login page to their default dashboard
    if (pathname === "/login" && token) {
      const user = getUserFromCookie(request);
      if (user) {
        const defaultDashboard = getDefaultDashboard(user.role);
        return NextResponse.redirect(new URL(defaultDashboard, request.url));
      }
    }
    return NextResponse.next();
  }

  // For all other routes, require authentication
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify user data exists
  const user = getUserFromCookie(request);
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("ravine_auth_token");
    response.cookies.delete("ravine_user_data");
    return response;
  }

  // Redirect from root to user's default dashboard
  if (pathname === "/") {
    const defaultDashboard = getDefaultDashboard(user.role);
    return NextResponse.redirect(new URL(defaultDashboard, request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|assets).*)",
  ],
};
