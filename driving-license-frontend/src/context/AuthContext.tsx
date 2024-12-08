import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface AuthContextProps {
  user: any; // Replace `any` with the actual user object type
  role: string | null;
  username: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Restore user state from localStorage if a session exists
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // User is logged in, restore from localStorage
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

    // Check if the new username differs from what we currently have
    const storedUsername = localStorage.getItem('username');
    if (userData.username !== storedUsername) {
      setUsername(userData.username);
      localStorage.setItem('username', userData.username);
    }

    // Always update role and token on login
    localStorage.setItem('supabaseToken', session.access_token);
    localStorage.setItem('role', userData.role);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setUsername(null);
    localStorage.clear();
  };

  if (!isInitialized) {
    // Optionally render a loading spinner or null while checking session
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, role, username, login, logout }}>
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