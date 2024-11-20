import React from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";

const Navbar: React.FC = () => {
  return (
    <header className="w-full bg-main-darkBlue shadow-md">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-secondary-lightGray">
          Driving Test App
        </a>

        {/* Links */}
        <div className="hidden md:flex space-x-6">
          <a
            href="/"
            className="text-secondary-lightGray hover:text-main-green transition-colors"
          >
            Home
          </a>
          <a
            href="/about"
            className="text-secondary-lightGray hover:text-main-green transition-colors"
          >
            About
          </a>
        </div>

        {/* Profile Dropdown */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-main-darkBlue border-main-green text-secondary-lightGray hover:bg-main-green hover:text-main-darkBlue transition-colors"
              >
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-main-darkBlue border border-main-green text-secondary-lightGray"
            >
              <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                <a href="/login" className="block w-full">
                  Login
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                <a href="/register" className="block w-full">
                  Register
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                <a href="/logout" className="block w-full">
                  Logout
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;