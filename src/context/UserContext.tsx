// src/context/UserContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { FullUser } from '@/lib/actions/currentUser';

export const UserContext = createContext<FullUser | null>(null);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({
  children,
  user
}: {
  children: React.ReactNode,
  user: FullUser | null
}) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}