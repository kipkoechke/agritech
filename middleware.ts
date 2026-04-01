// middleware.ts (Updated with my-services access)
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
      return "/dashboard";
    case "supervisor":
      return "/dashboard";
    case "plucker":
      return "/dashboard";
    case "admin":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

/**
 * Check if user has access to a specific route based on role
 */
function hasRouteAccess(role: string, pathname: string): boolean {
  // Admin has access to all routes
  if (role === "admin") return true;

  // Routes that are accessible by all authenticated users
  const publicForAllRoles = ["/dashboard", "/my-services", "/unauthorized"];
  
  // Check if it's a public route for all roles
  if (publicForAllRoles.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // Role-specific route restrictions
  const restrictedPaths: Record<string, string[]> = {
    farmer: ["/farm-workers", "/farmers", "/farm-map", "/hris"],
    supervisor: ["/farms", "/farmers", "/factory", "/hris"],
    plucker: ["/farms", "/farm-workers", "/farm-supervisors", "/farmers", "/factory", "/weighing-points", "/farm-map", "/orders", "/products", "/hris"],
  };

  const restricted = restrictedPaths[role] || [];
  
  // Check if current path is restricted for this role
  // If path is in restricted list, deny access (return false)
  // Otherwise allow access (return true)
  const isRestricted = restricted.some((path) => pathname.startsWith(path));
  
  return !isRestricted;
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
    // Redirect authenticated users from login page to dashboard
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

  // Check if user has access to the requested route
  if (!hasRouteAccess(user.role, pathname)) {
    // Redirect to unauthorized page
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Redirect from root to user's dashboard
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