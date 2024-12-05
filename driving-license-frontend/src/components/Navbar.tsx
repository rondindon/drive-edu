import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useAuth } from "../context/AuthContext"; // Import AuthContext to access user state

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth(); // Access user, role, and logout function from AuthContext

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-main-green font-semibold"
      : "text-secondary-lightGray hover:text-main-green transition-colors";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login"); // Redirect to login page after logout
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

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
                {user ? `Profile` : "Sign up"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-main-darkBlue border border-main-green text-secondary-lightGray"
            >
              {!user ? (
                <>
                  {/* If user is not logged in */}
                  <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                    <a href="/login" className="block w-full">
                      Sign in
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                    <a href="/register" className="block w-full">
                      Register
                    </a>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  {/* If user is logged in */}
                  <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                    <span className="block w-full">Role: {role || "User"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="hover:bg-main-green hover:text-main-darkBlue transition-colors cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;