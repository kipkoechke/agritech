import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  logoutUser,
  verifySession,
  login,
  getProfile,
} from "../services/authService";
import { getUserData, isAuthenticated, clearAuthData } from "../lib/auth";
import type {
  LoginCredentials,
  User,
  LoginResponse,
  UserRole,
  UserProfile,
} from "../types/auth";
import toast from "react-hot-toast";

// Query Keys
export const authQueryKeys = {
  all: ["auth"] as const,
  user: () => [...authQueryKeys.all, "user"] as const,
  session: () => [...authQueryKeys.all, "session"] as const,
  profile: () => [...authQueryKeys.all, "profile"] as const,
} as const;

// ============================================
// RBAC CONFIGURATION
// ============================================

/**
 * Role hierarchy - higher roles have more permissions
 * super-admin has all permissions
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  "super-admin": 100,
  "system-admin": 95,
  "farm-owner": 90,
  "farm-manager": 85,
  "farm-supervisor": 80,
  "factory-manager": 75,
  "plucker": 70,
  "farm-worker": 60,
  "business-manager": 90,
  "regional-manager": 80,
  "regional-supervisor": 75,
  "sales-manager": 70,
  "finance-manager": 70,
  "supply-chain-manager": 70,
  "depot-manager": 60,
  "depot-supervisor": 55,
  "logistics-coordinator": 50,
  "finance-officer": 45,
  "sales-representative": 40,
  "sales-person": 40,
  "field-officer": 35,
  "customer-service": 30,
  "data-analyst": 25,
  auditor: 20,
  transporter: 15,
  customer: 10,
};

/**
 * Route permissions - which roles can access which routes
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  // Dashboard - all authenticated users
  "/dashboard": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "depot-manager",
    "depot-supervisor",
    "logistics-coordinator",
    "finance-officer",
    "sales-representative",
    "sales-person",
    "field-officer",
    "customer-service",
    "data-analyst",
    "auditor",
    "transporter",
    "customer",
  ],

  // Operational Controls - management only
  "/operational-controls": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
  ],

  // Depot Services - depot managers and above
  "/depot-managers": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "depot-manager",
    "depot-supervisor",
  ],

  // Sales Representatives - sales team and management
  "/sales-representatives": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "depot-manager",
  ],

  // Customers - sales, customer service, and management
  "/customers": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "depot-manager",
    "sales-representative",
    "sales-person",
    "customer-service",
    "customer",
  ],

  // Products - most internal staff
  "/products": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "depot-manager",
    "depot-supervisor",
    "sales-representative",
    "sales-person",
    "customer",
  ],

  // Orders - sales, operations, and customers
  "/orders": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "depot-manager",
    "depot-supervisor",
    "logistics-coordinator",
    "sales-representative",
    "sales-person",
    "customer-service",
    "customer",
  ],

  // Price Reviews - finance and management
  "/price-reviews": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "depot-manager",
  ],

  // Payments - finance, management, and operations
  "/payments": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "depot-manager",
    "depot-supervisor",
    "finance-officer",
    "customer-service",
  ],

  // M-Pesa Transactions - finance and admin only
  "/mpesa-transactions": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "finance-manager",
    "finance-officer",
  ],

  // Sales Person Portal - Dashboard (sales reps only)
  "/sales-person/dashboard": ["sales-representative", "sales-person"],

  // Sales Person Portal - Orders (sales reps only)
  "/sales-person/orders": ["sales-representative", "sales-person"],

  // Sales Person Portal - Customers (sales reps only)
  "/sales-person/customers": ["sales-representative", "sales-person"],

  // Sales Person Portal - Products (sales reps only)
  "/sales-person/products": [
    "sales-representative",
    "sales-person",
    "customer",
  ],

  // Sales Person Portal - Cart (sales reps and customers)
  "/sales-person/cart": ["sales-representative", "sales-person", "customer"],

  // HRIS - admin and management only
  "/hris": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
  ],

  // Customer Portal - Dashboard
  "/customer/dashboard": ["customer"],

  // Customer Portal - Transactions
  "/customer/transactions": ["customer"],

  // Sales Person Portal - Transactions
  "/sales-person/transactions": ["sales-representative", "sales-person"],

  // Depot Portal
  "/depot/dashboard": ["depot-manager", "depot-supervisor"],
  "/depot/sales-persons": ["depot-manager", "depot-supervisor"],
  "/depot/customers": ["depot-manager", "depot-supervisor"],
  "/depot/orders": ["depot-manager", "depot-supervisor"],
  "/depot/payments": ["depot-manager", "depot-supervisor"],
  "/depot/stock": [
    "super-admin",
    "business-manager",
    "depot-manager",
    "depot-supervisor",
  ],
};

/**
 * Menu items visible to each role
 */
export const MENU_PERMISSIONS: Record<string, UserRole[]> = {
  Dashboard: [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "logistics-coordinator",
    "finance-officer",
    "field-officer",
    "customer-service",
    "data-analyst",
    "auditor",
    "transporter",
  ],
  "My Dashboard": ["customer"],
  "My Transactions": ["customer"],
  "Sales Rep Dashboard": ["sales-representative", "sales-person"],
  "Depot Dashboard": ["depot-manager", "depot-supervisor"],
  "Depot Sales Reps": ["depot-manager", "depot-supervisor"],
  "Depot Customers": ["depot-manager", "depot-supervisor"],
  "Depot Orders": ["depot-manager", "depot-supervisor"],
  "Depot Dispatches": [
    "super-admin",
    "business-manager",
    "depot-manager",
    "depot-supervisor",
  ],
  "Depot Payments": ["depot-manager", "depot-supervisor"],
  "Stock Management": [
    "super-admin",
    "business-manager",
    "depot-manager",
    "depot-supervisor",
  ],
  "My Orders": ["customer"],
  "Make Order": ["sales-representative", "sales-person", "customer"],
  "Shopping Cart": ["sales-representative", "sales-person", "customer"],
  "My Cart": ["customer"],
  "Operational Controls": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
  ],
  "Depot Services": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
  ],
  "Depot Managers": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
  ],
  "Sales Representatives": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
  ],
  "Sales Reps": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
  ],
  Customers: [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "sales-representative",
    "customer-service",
  ],
  Products: [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "sales-representative",
  ],
  Orders: [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "logistics-coordinator",
    "sales-representative",
    "customer-service",
  ],
  "Price Reviews": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
  ],
  Payments: [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "finance-officer",
    "customer-service",
  ],
  Transactions: [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
    "finance-officer",
    "customer-service",
  ],
  "M-Pesa Transactions": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "finance-manager",
    "finance-officer",
  ],
  "M-Pesa": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "finance-manager",
    "finance-officer",
  ],
  "Sales Person Products": ["sales-representative", "sales-person"],
  "Sales Person Cart": ["sales-representative", "sales-person"],
  "Customer Orders": ["sales-representative", "sales-person"],
  "My Customers": ["sales-representative", "sales-person"],
  "Customer Transactions": ["sales-representative", "sales-person"],
  "Modern Trade": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
  ],
  HRIS: ["super-admin", "system-admin", "business-manager", "regional-manager"],
  Reconciliations: [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "finance-manager",
    "supply-chain-manager",
    "finance-officer",
  ],
  "Sales Rep Performance": [
    "super-admin",
    "system-admin",
    "business-manager",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
  ],
};

// ============================================
// AUTH HOOKS
// ============================================

/**
 * Hook to get current user data
 */
export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: authQueryKeys.user(),
    queryFn: getUserData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: isAuthenticated(),
  });

  const logout = () => {
    clearAuthData();
    queryClient.clear(); // Clear all queries
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated() && !!user,
    logout,
  };
};

/**
 * Hook to get user profile from /profile endpoint
 */
export const useProfile = () => {
  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: isAuthenticated(),
  });
};

/**
 * Hook for login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      credentials,
      remember,
    }: {
      credentials: LoginCredentials;
      remember?: boolean;
    }) => login(credentials, remember),
    onSuccess: (data: LoginResponse) => {
      // Extract user data from response (excluding token)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { token, ...userData } = data;
      queryClient.setQueryData(authQueryKeys.user(), userData);
      toast.success(`Welcome back, ${data.name}!`);
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      // Don't show toast for login errors - they're handled in the form UI
    },
  });
};

// Legacy alias for backwards compatibility
export const useDirectLogin = useLogin;

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      // Show success message
      toast.success("Logged out successfully");

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
    onError: (error: Error) => {
      console.error("Logout failed:", error);

      // Even if logout fails on server, clear local data
      clearAuthData();
      queryClient.clear();

      toast.error("Logout failed, but you have been signed out locally");

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  });
};

/**
 * Hook to verify current session
 */
export const useSessionVerification = () => {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: verifySession,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated(),
    retry: false,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });
};

/**
 * Hook to get current user without triggering a fetch
 */
export const useCurrentUser = (): User | null => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<User>(authQueryKeys.user()) || null;
};

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (requiredRole: UserRole | UserRole[]): boolean => {
  const { user } = useAuth();
  if (!user) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
};

/**
 * Hook to check if user has specific rank (alias for useHasRole)
 */
export const useHasRank = (requiredRank: string): boolean => {
  const { user } = useAuth();
  return user?.role === requiredRank;
};

/**
 * Hook to check if user can access a specific route
 */
export const useCanAccessRoute = (route: string): boolean => {
  const { user } = useAuth();
  if (!user) return false;

  // Super admin can access everything
  if (user.role === "super-admin") return true;

  // Find matching route permission
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find(
    (r) => route === r || route.startsWith(r + "/"),
  );

  if (!matchingRoute) return true; // If no specific permission defined, allow access

  return ROUTE_PERMISSIONS[matchingRoute].includes(user.role);
};

/**
 * Hook to check if user can see a menu item
 */
export const useCanSeeMenuItem = (menuName: string): boolean => {
  const { user } = useAuth();
  if (!user) return false;

  // Super admin can see everything
  if (user.role === "super-admin") return true;

  const permissions = MENU_PERMISSIONS[menuName];
  if (!permissions) return true; // If no specific permission defined, show menu

  return permissions.includes(user.role);
};

/**
 * Hook to get authentication status without triggering queries
 */
export const useAuthStatus = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<User>(authQueryKeys.user());

  return {
    isAuthenticated: isAuthenticated() && !!user,
    user,
  };
};

/**
 * Hook to check if user is an administrator (super-admin or system-admin)
 */
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role === "super-admin" || user?.role === "system-admin";
};

/**
 * Hook to check if user is a super admin
 */
export const useIsSuperAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role === "super-admin";
};

/**
 * Hook to check if user is a business manager (view-only role)
 */
export const useIsBusinessManager = (): boolean => {
  const { user } = useAuth();
  return user?.role === "business-manager";
};

/**
 * Hook to check if user can perform write operations (create, edit, delete)
 * Business managers have view-only access, so they cannot perform write operations
 */
export const useCanWrite = (): boolean => {
  const { user } = useAuth();
  if (!user) return false;
  // Business managers have view-only access
  return user.role !== "business-manager";
};

/**
 * Hook to check if user is a customer
 */
export const useIsCustomer = (): boolean => {
  const { user } = useAuth();
  return user?.role === "customer";
};

/**
 * Hook to check if user is a depot manager
 */
export const useIsDepotManager = (): boolean => {
  const { user } = useAuth();
  return user?.role === "depot-manager" || user?.role === "depot-supervisor";
};

/**
 * Hook to check if user can manage stock (edit, delete stock)
 * Depot managers and admins can manage existing stock.
 */
export const useCanManageStock = (): boolean => {
    const { data: profile, isLoading } = useProfile();

    // If profile not loaded yet, deny access
    if (isLoading || !profile) return false;

    // Otherwise allow based on role
    const allowedRoles = ["super-admin", "system-admin", "depot-manager", "depot-supervisor"];
    return allowedRoles.includes(profile.role?.name || "");
};

/**
 * Hook to check if user can add new stock entries.
 * Only admins (super-admin, system-admin) can add stock.
 */
export const useCanAddStock = (): boolean => {
    const { user } = useAuth();
    const { data: profile, isLoading } = useProfile();
    if (!user) {
        return false;
    }

    // If profile is not loaded yet, assume false
    if (isLoading || !profile) {
        return false;
    }

    const specialEmails = ["ikibet@ravinedairies.co.ke"];

    // Check against route permissions for /depot/stock
    const allowedRoles = [
        "super-admin", 
        "system-admin",
        "business-manager", 
        "depot-manager", 
        "depot-supervisor"
    ];

    const hasAllowedRole = allowedRoles.includes(user.role);
    const isSpecialEmail = specialEmails.includes(profile.email);

    // Allow if role is allowed OR email is in the special list
    return hasAllowedRole || isSpecialEmail;
};
/**
 * Hook to check if user is a sales representative
 */
export const useIsSalesRep = (): boolean => {
  const { user } = useAuth();
  return user?.role === "sales-representative" || user?.role === "sales-person";
};

/**
 * Hook to check if user has management role
 */
export const useIsManagement = (): boolean => {
  const { user } = useAuth();
  if (!user) return false;

  const managementRoles: UserRole[] = [
    "super-admin",
    "system-admin",
    "regional-manager",
    "regional-supervisor",
    "sales-manager",
    "finance-manager",
    "supply-chain-manager",
  ];

  return managementRoles.includes(user.role);
};

/**
 * Hook to get user's zone (for depot managers)
 */
export const useUserZone = () => {
  const { user } = useAuth();
  return user?.zone || null;
};

/**
 * Hook to get user's customer ID (for customers)
 */
export const useCustomerId = () => {
  const { user } = useAuth();
  return user?.customer_id || null;
};

/**
 * Hook to get available filter levels based on user's role/permissions
 */
export const useAvailableFilterLevels = () => {
  const { user } = useAuth();

  // Define available levels based on user role
  const levels = {
    national: ["super-admin", "system-admin", "regional-manager"].includes(
      user?.role || "",
    ),
    regional: [
      "super-admin",
      "system-admin",
      "regional-manager",
      "regional-supervisor",
    ].includes(user?.role || ""),
    zone: [
      "super-admin",
      "system-admin",
      "regional-manager",
      "regional-supervisor",
      "depot-manager",
    ].includes(user?.role || ""),
  };

  return levels;
};

/**
 * Get visible menu items for current user
 */
export const useVisibleMenuItems = <T extends { name: string }>(
  menuItems: T[],
): T[] => {
  const { user } = useAuth();

  if (!user) return [];

  return menuItems.filter((item) => {
    const permissions = MENU_PERMISSIONS[item.name];
    if (!permissions) return true;
    return permissions.includes(user.role);
  });
};
