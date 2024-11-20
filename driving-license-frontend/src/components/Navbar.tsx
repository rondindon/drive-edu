import React from 'react';
import { Button } from '@components/ui/button';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@components/ui/menu';

const Navbar: React.FC = () => {
  return (
    <header className="w-full bg-lightGray shadow-sm">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        <a href="/" className="text-lg font-bold text-deepBlue">Driving Test App</a>
        <div className="hidden md:flex space-x-6">
          <a href="/" className="text-deepBlue hover:text-brightGreen">Home</a>
          <a href="/about" className="text-deepBlue hover:text-brightGreen">About</a>
        </div>
        <div className="hidden md:block">
          <Menu>
            <MenuTrigger asChild>
              <Button variant="outline" className="text-deepBlue">Profile</Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Login</MenuItem>
              <MenuItem>Register</MenuItem>
              <MenuItem>Logout</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
