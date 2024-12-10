import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface AuthContextProps {
  user: any; // Replace `any` with the actual user object type
  role: string | null;
  username: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (newUsername: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        setRole(localStorage.getItem('role') || null);
        setUsername(localStorage.getItem('username') || null);
      }
      setIsInitialized(true);
    };

    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const session = data.session;
    const currentUser = session?.user;
    if (!currentUser) throw new Error('No user found in session');

    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role, username')
      .eq('email', email)
      .single();

    if (userError) throw userError;

    setUser(currentUser);
    setRole(userData.role);
    setUsername(userData.username);

    localStorage.setItem('supabaseToken', session.access_token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('username', userData.username);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setUsername(null);
    localStorage.clear();
  };

  const updateUsername = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem('username', newUsername);
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, role, username, login, logout, updateUsername }}>
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