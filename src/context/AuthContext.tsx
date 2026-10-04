import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  role: 'student' | 'staff';
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: 'student' | 'staff') => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role?: 'student' | 'staff'; department?: string; collegeId?: string; phone?: string }) => Promise<void>;
  signInWithGoogle: (role?: 'student' | 'staff') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('xeroxflow_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('xeroxflow_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('xeroxflow_user_profile');
    }
  }, [user]);

  // Synchronize Supabase session user with our backend database/profiles
  const syncSessionUser = useCallback(async (sessionUser: any) => {
    if (!sessionUser || !sessionUser.email) return;
    try {
      setIsLoading(true);
      const rawRole = localStorage.getItem('xeroxflow_pending_role');
      const pendingRole = rawRole === 'staff' || rawRole === 'student' ? rawRole : undefined;
      const name =
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        sessionUser.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
        'User';
      const avatar = sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture || '';

      const res = await authApi.syncGoogleUser({
        id: sessionUser.id,
        email: sessionUser.email,
        name,
        role: pendingRole,
        avatar,
      });

      if (res?.token && res?.user) {
        setAuthToken(res.token);
        setUser(res.user);
        localStorage.removeItem('xeroxflow_pending_role');
      }
    } catch (err) {
      console.error('Failed to sync Google user with backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate session on mount and listen for Supabase OAuth redirects / state changes
  useEffect(() => {
    const checkInitialSession = async () => {
      // 1. First check if a Supabase OAuth session was just returned in the URL / storage
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await syncSessionUser(session.user);
          return;
        }
      } catch (err) {
        console.warn('Supabase session check error:', err);
      }

      // 2. Otherwise validate existing JWT token against backend
      const token = getAuthToken();
      if (!token) return;
      try {
        const profile = await authApi.getMe();
        if (profile) setUser(profile);
      } catch {
        // Token expired or invalid
        removeAuthToken();
        setUser(null);
      }
    };

    checkInitialSession();

    // Listen for OAuth redirects and auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await syncSessionUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        removeAuthToken();
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncSessionUser]);

  const login = async (email: string, password: string, role: 'student' | 'staff' = 'student') => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password, role);
      setAuthToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role?: 'student' | 'staff'; department?: string; collegeId?: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        ...userData,
        role: userData.role || 'student',
      });
      setAuthToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (role: 'student' | 'staff' = 'student') => {
    setIsLoading(true);
    try {
      localStorage.setItem('xeroxflow_pending_role', role);

      const redirectUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Google sign-in initiation failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    removeAuthToken();
    localStorage.removeItem('xeroxflow_pending_role');
    localStorage.removeItem('xeroxflow_post_auth_redirect');
    localStorage.removeItem('xeroxflow_user_profile');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
