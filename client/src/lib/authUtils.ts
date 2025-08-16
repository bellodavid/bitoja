// Authentication utility functions for handling API errors and auth states

export interface AuthError {
  status: number;
  message: string;
}

/**
 * Check if an error is an unauthorized (401) error
 */
export const isUnauthorizedError = (error: any): boolean => {
  if (!error) return false;

  // Handle different error formats
  if (error.status === 401) return true;
  if (error.response?.status === 401) return true;
  if (error.message?.includes("401")) return true;
  if (error.message?.includes("Unauthorized")) return true;
  if (error.message?.includes("Authentication failed")) return true;

  return false;
};

/**
 * Handle authentication errors by redirecting to login
 */
export const handleAuthError = (error: any, logout?: () => void) => {
  if (isUnauthorizedError(error)) {
    console.warn("Authentication error detected:", error);
    if (logout) {
      logout();
    }
    return true;
  }
  return false;
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (token?: string) => {
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Parse JWT token payload (without verification - for client-side only)
 */
export const parseJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Format authentication error message for display
 */
export const formatAuthError = (error: any): string => {
  if (isUnauthorizedError(error)) {
    return "Your session has expired. Please log in again.";
  }

  if (error.message) {
    return error.message;
  }

  return "An authentication error occurred. Please try again.";
};
