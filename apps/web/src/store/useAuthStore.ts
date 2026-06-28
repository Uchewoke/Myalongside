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
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: MOCK_CURRENT_USER,
      token: null,
      isAuthenticated: false,
      login: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
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
