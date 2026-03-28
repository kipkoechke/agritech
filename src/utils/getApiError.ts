/**
 * Extracts a user-friendly error message from an API error response.
 *
 * Handles multiple API error formats:
 * - { error: "...", message: "..." }
 * - { message: "...", errors: { "field": ["..."] } }
 * - { message: "..." }
 * - Standard Error objects
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string = "Something went wrong",
): string {
  const axiosError = error as {
    response?: {
      data?: {
        error?: string;
        message?: string;
        errors?: Record<string, string[]>;
      };
    };
    message?: string;
  };

  const data = axiosError?.response?.data;

  if (data) {
    // Prefer the `error` field (e.g., "Customer has overdue orders...")
    if (data.error && typeof data.error === "string") {
      return data.error;
    }

    // Check for validation errors and return the first one
    if (data.errors && typeof data.errors === "object") {
      const firstError = Object.values(data.errors)[0]?.[0];
      if (firstError) return firstError;
    }

    // Fall back to `message` field
    if (data.message && typeof data.message === "string") {
      return data.message;
    }
  }

  // Fall back to the error's own message
  if (axiosError?.message) {
    return axiosError.message;
  }

  return fallback;
}
