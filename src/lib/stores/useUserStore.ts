import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserInfo } from '../types';


//  public_id: user.public_id, email: user.email, role: user.role
type UserStore = {
    user: UserInfo | null;
    isAuthenticated: boolean;
    login: (AuthUserResponseData: UserInfo) => void;
    logout: () => void;
    hydrate: () => void;
};

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (userData) => set({ user: userData, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            hydrate: () => { }, // This will be used to trigger hydration
        }),
        {
            name: 'user-storage', // unique name for localStorage key
            storage: createJSONStorage(() => localStorage), // or sessionStorage
            // Optional: you can exclude certain fields from being persisted
            // partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);