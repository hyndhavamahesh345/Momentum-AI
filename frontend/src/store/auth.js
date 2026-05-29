import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuth = create(
  persist(
    (set) => ({
      userId: null,
      isLoginModalOpen: false,
      login: (id) => set({ userId: id, isLoginModalOpen: false }),
      logout: () => set({ userId: null }),
      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),
    }),
    {
      name: 'momentum-auth-storage', // unique name for localStorage key
      partialize: (state) => ({ userId: state.userId }), // Only persist userId
    }
  )
);
