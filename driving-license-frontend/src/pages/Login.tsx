import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { AuthError, Session } from '@supabase/supabase-js';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error }: { data: { session: Session | null }; error: AuthError | null } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log(data)

    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('id', data.session?.user.id)
      .single();

    if (userError) {
      setMessage(`Failed to fetch user role: ${userError.message}`);
      return;
    }

      if (error) {
        setMessage(`Login error: ${error.message}`);
        console.log(userData)
      } else if (data.session) {
        setMessage('Login successful!');
        localStorage.setItem('supabaseToken', data.session.access_token);
        localStorage.setItem('role', userData.role);
        console.log(userData)
        // Handle successful login
      }
    } catch (err) {
      setMessage(`Login failed: ${err}`);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      {message && <p>{message}</p>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
