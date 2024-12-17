import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface UserData {
  role: string;
  username: string;
  // Add other fields if necessary
}

interface AuthContextProps {
  user: User | null;
  role: string | null;
  username: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to fetch additional user data from the backend API
  const fetchUserData = async (email: string): Promise<UserData> => {
    console.log(`Fetching user data for email: ${email}`);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4444/api';
      const response = await fetch(`${API_BASE_URL}/user?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers if required
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        console.warn(`User with email ${email} not found in backend.`);
        // Optionally, you can choose to create a new user here or handle it differently
        throw new Error('User not found in backend.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data.');
      }

      const data = await response.json();
      console.log('User data fetched:', data);
      return data as UserData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('Initializing session...');
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('Session found:', data.session);
          setUser(data.session.user);
          const email = data.session.user.email;

          if (email) {
            try {
              const userData = await fetchUserData(email);
              setRole(userData.role);
              setUsername(userData.username);

              localStorage.setItem('supabaseToken', data.session.access_token);
              localStorage.setItem('role', userData.role);
              localStorage.setItem('username', userData.username);
            } catch (error) {
              console.error('Error during user data fetch:', error);
              setRole(null);
              setUsername(null);
            }
          } else {
            console.error('User email is undefined');
            setRole(null);
            setUsername(null);
          }
        } else {
          console.log('No session found.');
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setIsInitialized(true);
        console.log('Session initialization complete. isInitialized set to true.');
      }
    };

    initializeSession();

    // Listen for changes to the session
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`);
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user);
        setUser(session.user);
        const email = session.user.email;

        if (email) {
          try {
            const userData = await fetchUserData(email);
            setRole(userData.role);
            setUsername(userData.username);

            localStorage.setItem('supabaseToken', session.access_token);
            localStorage.setItem('role', userData.role);
            localStorage.setItem('username', userData.username);
          } catch (error) {
            console.error('Error fetching user data on sign-in:', error);
            setRole(null);
            setUsername(null);
          }
        } else {
          console.error('User email is undefined during sign-in.');
          setRole(null);
          setUsername(null);
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log('User signed out.');
        setUser(null);
        setRole(null);
        setUsername(null);
        localStorage.clear();
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
      console.log('Auth state change listener unsubscribed.');
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log(`Logging in user with email: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    const session = data.session;
    const currentUser = session?.user;
    if (!currentUser) {
      const errMsg = 'No user found in session after login.';
      console.error(errMsg);
      throw new Error(errMsg);
    }

    if (!currentUser.email) {
      const errMsg = 'User email is undefined after login.';
      console.error(errMsg);
      throw new Error(errMsg);
    }

    try {
      const userData = await fetchUserData(currentUser.email);
      setUser(currentUser);
      setRole(userData.role);
      setUsername(userData.username);

      localStorage.setItem('supabaseToken', session.access_token);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('username', userData.username);
    } catch (error) {
      console.error('Error fetching user data during login:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    console.log('Initiating Google OAuth sign-in.');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      console.error('Google OAuth sign-in error:', error);
      throw error;
    }
    // The session will be handled by the onAuthStateChange listener after redirection
  };

  const logout = async () => {
    console.log('Logging out user.');
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setUsername(null);
    localStorage.clear();
  };

  const updateUsername = async (newUsername: string) => {
    if (!user) {
      const errMsg = 'No user is currently logged in.';
      console.error(errMsg);
      throw new Error(errMsg);
    }

    try {
      const token = localStorage.getItem('supabaseToken');
      if (!token) {
        const errMsg = 'No authentication token found.';
        console.error(errMsg);
        throw new Error(errMsg);
      }

      console.log(`Updating username for email: ${user.email} to ${newUsername}`);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:4444/api'}/users/update-username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email, newUsername }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errMsg = errorData.error || 'Failed to update username.';
        console.error(errMsg);
        throw new Error(errMsg);
      }

      setUsername(newUsername);
      localStorage.setItem('username', newUsername);
      console.log('Username updated successfully.');
    } catch (error) {
      console.error('Error updating username:', error);
      throw new Error('Unable to update username.');
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* Replace with your actual loading spinner */}
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, role, username, login, loginWithGoogle, logout, updateUsername }}
    >
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