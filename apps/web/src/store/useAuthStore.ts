import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import type { PublicProfileSettings } from "@/lib/public-profile";

interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  role: "MENTOR" | "SEEKER";
  bio?: string;
  location?: string;
  languages?: string[];
  lifeEvents?: string[];
  settings?: PublicProfileSettings;
  subscriptionTier?: "FREE" | "PLUS" | "PRO";
  stripeCustomerId?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  /** Rotates the access/refresh token pair without touching `user`. Used after a silent refresh. */
  setTokens: (token: string, refreshToken: string) => void;
}

/** Shape returned by the backend's `safeUser()` (see auth.controller.ts). */
interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  languages: string[];
  settings?: PublicProfileSettings;
  subscriptionTier?: string;
  stripeCustomerId: string | null;
}

/** Maps a signup/login API response's `user` into the shape the auth store expects. */
export function toAuthUser(apiUser: ApiUser): AuthUser {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    avatar:
      apiUser.avatar ??
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(apiUser.id)}`,
    role: apiUser.role === "MENTOR" ? "MENTOR" : "SEEKER",
    bio: apiUser.bio ?? undefined,
    location: apiUser.location ?? undefined,
    languages: apiUser.languages,
    settings: apiUser.settings,
    subscriptionTier: apiUser.subscriptionTier as AuthUser["subscriptionTier"],
    stripeCustomerId: apiUser.stripeCustomerId,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: MOCK_CURRENT_USER,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      updateUser: (partial) =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  ...partial,
                  settings: {
                    ...state.user.settings,
                    ...partial.settings,
                    general: {
                      ...state.user.settings?.general,
                      ...partial.settings?.general,
                    },
                    seeker: {
                      ...state.user.settings?.seeker,
                      ...partial.settings?.seeker,
                    },
                    mentor: {
                      ...state.user.settings?.mentor,
                      ...partial.settings?.mentor,
                    },
                  },
                },
              }
            : {}
        ),
    }),
    { name: "myalongside-auth" }
  )
);
