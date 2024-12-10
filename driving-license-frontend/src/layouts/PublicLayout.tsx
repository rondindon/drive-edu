// src/layouts/PublicLayout.tsx
import React from 'react';
import Navbar from '../components/Navbar'; // Adjust the import path as needed
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;