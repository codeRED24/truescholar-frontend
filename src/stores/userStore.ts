import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  custom_code?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "user-storage",
    }
  )
);
