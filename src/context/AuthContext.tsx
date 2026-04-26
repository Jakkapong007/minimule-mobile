import React, { createContext, useContext, useEffect, useState } from 'react';
import { apolloClient, getToken, removeToken, saveToken } from '../graphql/client';
import { ME } from '../graphql/queries';

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  addresses?: Address[];
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const stored = await getToken();
      if (stored) {
        setToken(stored);
        await fetchMe();
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMe() {
    try {
      const { data } = await apolloClient.query<any>({ query: ME, fetchPolicy: 'network-only' });
      if (data?.me) {
        setUser(data.me);
      } else {
        await removeToken();
        setToken(null);
        setUser(null);
      }
    } catch {
      await removeToken();
      setToken(null);
      setUser(null);
    }
  }

  async function signIn(newToken: string) {
    await saveToken(newToken);
    setToken(newToken);
    await fetchMe();
  }

  async function signOut() {
    await removeToken();
    await apolloClient.clearStore();
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    await fetchMe();
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
