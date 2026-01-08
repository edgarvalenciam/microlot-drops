// User management utilities
// For MVP, we use a simple fixed userId stored in localStorage

const USER_ID_KEY = "microlot_drops_user_id";

/**
 * Get or create a user ID for the current session
 */
export function getUserId(): string {
  if (typeof window === "undefined") {
    return "demo-user";
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user-${Date.now()}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

