export const ASYNC_STORAGE_KEYS = {
  THEME: "tripmate_theme",
  ONBOARDING_COMPLETED: "tripmate_onboarding_completed",
  RECENT_SEARCHES: "tripmate_recent_searches",
  CACHED_DESTINATIONS: "tripmate_cached_destinations",
} as const;

export const SECURE_STORAGE_KEYS = {
  AUTH_TOKEN: "tripmate_auth_token",
  USER_SESSION: "tripmate_user_session",
} as const;
