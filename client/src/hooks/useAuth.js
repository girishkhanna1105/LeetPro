import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (userData) => set({ token: userData.token, user: userData }),
      logout: () => {
        // Clear the persisted state from localStorage
        localStorage.removeItem('auth-storage');
        set({ token: null, user: null });
      },
      setUser: (user) => set((state) => ({ ...state, user })),
    }),
    {
      name: 'auth-storage', // The key for the localStorage item
    }
  )
);

export default useAuthStore;