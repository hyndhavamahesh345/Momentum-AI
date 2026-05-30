import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuth = create(
  persist(
    (set) => ({
      userId: null,      // Used across the app (matches user.id)
      token: null,       // JWT token
      user: null,        // Full user object
      isLoginModalOpen: false,
      
      login: (token, user) => set({ 
        token, 
        user, 
        userId: user.id,
        isLoginModalOpen: false 
      }),
      
      logout: () => set({ 
        token: null, 
        user: null, 
        userId: null 
      }),
      
      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),
    }),
    {
      name: 'momentum-auth-storage', 
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        userId: state.userId
      }), 
    }
  )
);
