import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock session
    const stored = localStorage.getItem('nutfy_auth_user');
    if (stored) {
        try {
            const userData = JSON.parse(stored);
            setUser(userData);
            setSession({ user: userData } as Session);
        } catch (e) {
            console.error("Erro ao restaurar sessão local", e);
        }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string) => {
    const mockUser = {
        id: 'local-user-id', // ID fixo para facilitar testes locais ou gerar uuid
        email: email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        identities: [],
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        factors: []
    } as unknown as User;

    localStorage.setItem('nutfy_auth_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setSession({ user: mockUser } as Session);
  };

  const signOut = async () => {
    localStorage.removeItem('nutfy_auth_user');
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};