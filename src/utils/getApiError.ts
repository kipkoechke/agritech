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
        errors?: string[] | Record<string, string[]>;
      };
    };
    message?: string;
  };

  const data = axiosError?.response?.data;

  if (data) {
    // Handle string-array errors (e.g. ["You do not manage a farm..."])
    if (
      Array.isArray(data.errors) &&
      data.errors.length > 0 &&
      typeof data.errors[0] === "string"
    ) {
      return (data.errors as string[])[0];
    }

    // Handle record-style field errors (e.g. { field: ["message"] })
    if (
      data.errors &&
      typeof data.errors === "object" &&
      !Array.isArray(data.errors)
    ) {
      const firstError = Object.values(
        data.errors as Record<string, string[]>,
      )[0]?.[0];
      if (firstError) return firstError;
    }

    // Return the `error` field only when it looks like a human message (not a code)
    if (
      data.error &&
      typeof data.error === "string" &&
      data.error !== "validation_error"
    ) {
      return data.error;
    }

    // Fall back to the `message` field
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
