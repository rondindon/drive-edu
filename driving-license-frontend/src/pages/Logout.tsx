import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem('supabaseToken');
      localStorage.removeItem('role');

      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-main-green text-white py-2 px-4 rounded hover:bg-main-darkGreen"
    >
      Logout
    </button>
  );
};

export default Logout;