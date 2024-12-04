import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextProps {
  user: any; // Replace `any` with the actual type for your user object
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Ensure we properly await the getSession call
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        setRole(localStorage.getItem('role') || null);
      }
    };

    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const session = data.session;
    const user = session?.user;

    if (!user) throw new Error('No user found in session');

    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('email', email)
      .single();

    if (userError) throw userError;

    setUser(user);
    setRole(userData.role);

    // Save user details to local storage
    localStorage.setItem('supabaseToken', session.access_token);
    localStorage.setItem('role', userData.role);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};