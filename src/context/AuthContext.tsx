'use client';

import React, { createContext, useContext } from 'react';
import { useSession, signOut as nextSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user: AuthUser | null = session?.user
    ? { id: session.user.id as string, email: session.user.email, name: session.user.name }
    : null;

  const signOut = async () => {
    await nextSignOut({ redirect: false });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading: status === 'loading', signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
