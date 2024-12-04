import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import Logout from "../pages/Logout";


const Navbar: React.FC = () => {
  const location = useLocation();

  // Helper function to check if a link is active
  const isActive = (path: string) =>
    location.pathname === path
      ? "text-main-green font-semibold"
      : "text-secondary-lightGray hover:text-main-green transition-colors";

  return (
    <header className="w-full bg-main-darkBlue shadow-md">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-secondary-lightGray">
          Driving Test App
        </a>

        {/* Links */}
        <div className="hidden md:flex space-x-6">
          <a href="/" className={isActive("/")}>
            Home
          </a>
          <a href="/about" className={isActive("/about")}>
            About
          </a>
          <a href="/contact" className={isActive("/contact")}>
            Contact
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
                <Logout />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;