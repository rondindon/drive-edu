import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useAuth } from "../context/AuthContext";
import { User, Menu } from "lucide-react"; // Import Menu icon for hamburger
import { toast } from "react-toastify";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, username, logout } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-main-green font-semibold"
      : "text-secondary-lightGray hover:text-main-green transition-colors";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Log out successful!");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  console.log("User", role, username);

  return (
    <header className="w-full bg-main-darkBlue shadow-md">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Left Section: Logo */}
        <div className="flex-1">
          <a href="/" className="text-xl font-bold text-secondary-lightGray">
            Driving Test App
          </a>
        </div>

        {/* Center Section: Navigation Links (Visible on md and above) */}
        <div className="hidden md:flex flex-1 justify-center space-x-6">
          <a href="/" className={isActive("/")}>
            Home
          </a>
          <a href="/about" className={isActive("/about")}>
            About
          </a>
          {/* <a href="/contact" className={isActive("/contact")}>Contact</a> */}
        </div>

        {/* Right Section: Profile Dropdown and Admin Panel (Visible on md and above) */}
        <div className="hidden md:flex flex-1 justify-end items-center space-x-4">
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-main-darkBlue border-main-green text-secondary-lightGray hover:bg-main-green hover:text-main-darkBlue transition-colors flex items-center space-x-2"
              >
                {user ? (
                  <>
                    <span>{username || "User"}</span>
                    <User className="w-4 h-4" />
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-main-darkBlue border border-main-green text-secondary-lightGray"
            >
              {!user ? (
                <>
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
                  <DropdownMenuItem className="hover:bg-main-green hover:text-main-darkBlue transition-colors">
                    <span>Role: {role || "User"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="hover:bg-main-green hover:text-main-darkBlue transition-colors cursor-pointer"
                  >
                    Profile
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

          {/* Admin Panel Button (visible if user is logged in and admin) */}
          {user && role === "ADMIN" && (
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
              className="bg-main-darkBlue border-main-green text-secondary-lightGray hover:bg-main-green hover:text-main-darkBlue transition-colors"
            >
              Admin Panel
            </Button>
          )}
        </div>

        {/* Mobile Section: Hamburger Menu (Visible below md) */}
        <div className="flex md:hidden flex-1 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="bg-main-darkBlue border-none text-secondary-lightGray hover:text-main-green focus:outline-none"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-main-darkBlue border border-main-green text-secondary-lightGray"
            >
              {/* Navigation Links */}
              <div className="px-4 py-2 border-b border-main-green">
                <a
                  href="/"
                  className={`block px-2 py-1 rounded ${isActive("/")}`}
                >
                  Home
                </a>
                <a
                  href="/about"
                  className={`block px-2 py-1 rounded ${isActive("/about")}`}
                >
                  About
                </a>
                {/* <a
                  href="/contact"
                  className={`block px-2 py-1 rounded ${isActive("/contact")}`}
                >
                  Contact
                </a> */}
              </div>

              {/* User Options */}
              <div className="px-4 py-2">
                {!user ? (
                  <>
                    <a
                      href="/login"
                      className="block px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
                    >
                      Sign in
                    </a>
                    <a
                      href="/register"
                      className="block px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
                    >
                      Register
                    </a>
                  </>
                ) : (
                  <>
                    <div className="block px-2 py-1 rounded">
                      <span>Role: {role || "User"}</span>
                    </div>
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full text-left px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
                    >
                      Logout
                    </button>
                    {role === "ADMIN" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="w-full text-left px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors mt-2"
                      >
                        Admin Panel
                      </button>
                    )}
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;